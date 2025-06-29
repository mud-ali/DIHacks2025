import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import {
  GEOCODE_API_KEY,
  JWT_SECRET,
  MONGODB_URI,
  PORT,
} from "./utils/config.ts";
import {
  supportedCalculationMethods,
  supportedServices,
} from "./data/enums.ts";
import Masjid from "./models/masjid.ts";
import User from "./models/user.ts";
import { ObjectId as _ObjectId } from "mongoose";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Status: up");
  console.log("✅ Backend is running ✅");
});

app.get("/calculationmethods", (_req: Request, res: Response) => {
  res.json({ methods: supportedCalculationMethods });
});

app.get("/services", (_req: Request, res: Response) => {
  res.json({ services: supportedServices });
});

app.post("/masjid", authenticateToken, async (req: Request, res: Response) => {
  const {
    name,
    address,
    latitude,
    longitude,
    calculationMethod,
    phone,
    email,
    services,
  } = req.body;

  let lat = latitude;
  let lng = longitude;

  try {
    if (
      typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) ||
      isNaN(lng) || (lat === 0 && lng === 0)
    ) {
      if (!address) {
        return res.status(400).json({
          error: "Address is required if coordinates are not provided.",
        });
      }

      const geoURL = `https://geocode.maps.co/search?q=${
        encodeURIComponent(
          address,
        )
      }&api_key=${GEOCODE_API_KEY}`;

      const geoRes = await fetch(geoURL);
      console.log(await geoRes);
      const geoData = await geoRes.json();

      if (!geoData || !Array.isArray(geoData) || geoData.length === 0) {
        return res.status(400).json({ error: "Unable to geocode address." });
      }

      const firstResult = geoData[0];
      lat = parseFloat(firstResult.lat);
      lng = parseFloat(firstResult.lon);
    }

    const today = new Date();
    const dateString = `${today.getDate()}-${
      today.getMonth() + 1
    }-${today.getFullYear()}`;

    let calculationIndex = supportedCalculationMethods.indexOf(
      calculationMethod,
    );
    if (calculationIndex === -1) calculationIndex = 2; // default to ISNA
    const url =
      `https://api.aladhan.com/v1/timings/${dateString}?latitude=${lat}&longitude=${lng}&method=${calculationIndex}`;

    let timings;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch prayer times: ${res.statusText}`);
      }

      const data = await res.json();

      timings = data.data.timings;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      } else {
        console.error("Error:", error);
      }
    }

    // Map timings keys to match schema (lowercase)
    const mappedPrayerTimes = timings
      ? {
          fajr: timings.Fajr,
          dhuhr: timings.Dhuhr,
          asr: timings.Asr,
          maghrib: timings.Maghrib,
          isha: timings.Isha,
        }
      : {};

    const newMasjid = new Masjid({
      name,
      address,
      latitude: lat,
      longitude: lng,
      calculationMethod,
      phone,
      email,
      services: services || [],
      prayerTimes: mappedPrayerTimes,
    });

    await newMasjid.save();
    console.log("✅ New masjid created:", name);

    res.status(201).json({
      success: true,
      message: "Masjid created successfully",
      data: newMasjid,
    });
  } catch (error) {
    console.error("Error creating masjid:", error);

    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      const validationError = error as mongoose.Error.ValidationError;
      const errors = Object.values(validationError.errors).map((err) =>
        err.message
      );
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

app.get("/masjid", async (_req: Request, res: Response) => {
  try {
    const masajid = await Masjid.find({});

    res.status(200).json({
      success: true,
      count: masajid.length,
      data: masajid,
    });
  } catch (error) {
    console.error("Error fetching masajid:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch masajid data",
    });
  }
});

app.get("/masjid/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const masjid = await Masjid.findById(id);

    if (!masjid) {
      return res.status(404).json({
        success: false,
        error: "Masjid not found",
      });
    }

    console.log(masjid)
    res.status(200).json({
      success: true,
      count: 1,
      data: [masjid],
    });
  } catch (error) {
    console.error("Error fetching masajid:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch masajid data",
    });
  }
});

// wrapper func for SHA-256 password hashing
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

// JWT helper functions
function generateToken(userId: string, email: string, admin: string[]): string {
  return jwt.sign(
    {
      userId,
      email,
      admin,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

function verifyToken(
  token: string,
): { userId: string; email: string; admin: string[] } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      admin: string[];
    };
  } catch (_error) {
    return null;
  }
}

// JWT Middleware
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    admin: string[];
  };
}

function authenticateToken(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token required",
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({
      success: false,
      error: "Invalid or expired token",
    });
  }

  (req as AuthenticatedRequest).user = decoded;
  next();
}

// Signup route
app.post("/auth/signup", async (req: Request, res: Response) => {
  const { name, email, password, admin = [] } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    const passwordHash = await hashPassword(password);
    const newUser = new User({
      name,
      email,
      admin,
      passwordHash,
    });
    await newUser.save();
    console.log("New user created:", email);

    // Generate JWT token
    const token = generateToken(
      newUser._id.toString(),
      newUser.email,
      newUser.admin.map((id: mongoose.Types.ObjectId) => id.toString()),
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        admin: newUser.admin,
      },
      token,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

app.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      console.log("❌ Invalid password attempt for user:", email);
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(
      user._id.toString(),
      user.email,
      user.admin.map((id: mongoose.Types.ObjectId) => id.toString()),
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        admin: user.admin,
      },
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Verify JWT token route for auto sign-in
app.get(
  "/auth/verify",
  authenticateToken,
  async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;

    try {
      // Find user to get fresh data
      const user = await User.findById(authenticatedReq.user?.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      console.log("Token verified for user:", user.email);

      res.status(200).json({
        success: true,
        message: "Token is valid",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          admin: user.admin,
        },
      });
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

app.post("/event", (_req: Request, res: Response) => {
  res.status(402).json({ err: "not implemeneted" });
});

// Helper function to calculate distance using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in miles
  return Math.round(distance * 10000) / 10000; // Round to 2 decimal places
}

app.post("/masjid/distances", (req: Request, res: Response) => {
  const { userLatitude, userLongitude, masajid } = req.body;

  try {
    if (typeof userLatitude !== "number" || typeof userLongitude !== "number") {
      return res.status(400).json({
        success: false,
        error: "User latitude and longitude are required as numbers",
      });
    }

    if (!Array.isArray(masajid) || masajid.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Masajid array is required and cannot be empty",
      });
    }

    console.log(
      `Calculating distances from user location (${userLatitude}, ${userLongitude}) to ${masajid.length} masajid`,
    );

    const masajidWithDistances = masajid.map((masjid) => {
      if (
        !masjid.id || typeof masjid.latitude !== "number" ||
        typeof masjid.longitude !== "number"
      ) {
        console.warn("Invalid masjid data:", masjid);
        return {
          id: masjid.id,
          distance: null,
          error: "Invalid masjid coordinates",
        };
      }

      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        masjid.latitude,
        masjid.longitude,
      );

      return {
        id: masjid.id,
        distance: distance,
      };
    });

    res.status(200).json(masajidWithDistances);
  } catch (error) {
    console.error("Error calculating distances:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Update masjid route
app.put(
  "/masjid/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      name,
      address,
      latitude,
      longitude,
      calculationMethod,
      description,
      phone,
      email,
      services,
      prayerTimes,
    } = req.body;

    try {
      const updateData: Partial<{
        name: string;
        address: string;
        latitude: number;
        longitude: number;
        calculationMethod: string;
        description: string;
        phone: string;
        email: string;
        services: string[];
        prayerTimes: {
          fajr?: string;
          dhuhr?: string;
          asr?: string;
          maghrib?: string;
          isha?: string;
        };
      }> = {};

      if (name !== undefined) updateData.name = name;
      if (address !== undefined) updateData.address = address;
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;
      if (calculationMethod !== undefined) {
        updateData.calculationMethod = calculationMethod;
      }
      if (description !== undefined) updateData.description = description;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email;
      if (services !== undefined) updateData.services = services;
      if (prayerTimes !== undefined) updateData.prayerTimes = prayerTimes;

      const updatedMasjid = await Masjid.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true },
      );

      if (!updatedMasjid) {
        return res.status(404).json({
          success: false,
          error: "Masjid not found",
        });
      }

      console.log("✅ Masjid updated:", updatedMasjid.name);

      res.status(200).json({
        success: true,
        message: "Masjid updated successfully",
        data: updatedMasjid,
      });
    } catch (error) {
      console.error("Error updating masjid:", error);

      // Handle Mongoose validation errors
      if (error instanceof Error && error.name === "ValidationError") {
        const validationError = error as mongoose.Error.ValidationError;
        const errors = Object.values(validationError.errors).map((err) =>
          err.message
        );
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors,
        });
      }

      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

mongoose.connect(MONGODB_URI).then(() => {
  console.log("Connected to Database");
  app.listen(
    PORT,
    () => console.log(`Server running on http://localhost:${PORT}`),
  );
}).catch((e: Error) => {
  console.error("Error connecting to the DB: ", e.message);
});

export default app;
