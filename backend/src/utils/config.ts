import { load } from "dotenv";

const env = await load();

export const MONGODB_URI = env.MONGODB_URI || Deno.env.get("MONGODB_URI") || "mongodb://localhost:27017/mydb";
export const PORT = env.PORT || Deno.env.get("PORT") || "3000";
export const GEOCODE_API_KEY = env.GEOCODE_API_KEY || "";
export const JWT_SECRET = env.JWT_SECRET || Deno.env.get("JWT_SECRET") || "your-default-jwt-secret-change-this-in-production";