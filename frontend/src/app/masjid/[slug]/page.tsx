"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentLocation, UserLocation } from "@/utils/geolocation";
import { formatMasjidDistance } from "@/utils/masjid";
import { fetchMasjidById, calculateMasajidDistances } from "@/utils/api";
import { getMapSearchUrl, getMapDirectionsUrl } from "@/utils/maps";
import api from "@/lib/api";

interface MasjidDetails {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  address: string;
  calculationMethod?: string;
  phone?: string;
  email?: string;
  services?: string[];
  prayerTimes?: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
}

export default function MasjidPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isAuthenticated, user } = useAuth();

  const [masjid, setMasjid] = useState<MasjidDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (slug) {
        await fetchMasjidDetails(slug);
      }
    };
    fetchData();
  }, [slug]);

  useEffect(() => {
    // Check if user is admin for this masjid
    if (isAuthenticated && user && masjid) {
      checkAdminStatus(masjid.id);
    }
    // Try to get user location for distance calculation
    const getLocationForDistance = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);

        // Calculate distance if we have both location and masjid data
        if (masjid && location) {
          const masajidWithDistance = await calculateMasajidDistances(
            location,
            [masjid],
          );
          if (masajidWithDistance.length > 0) {
            setDistance(masajidWithDistance[0].distance || null);
          }
        }
      } catch (error) {
        // Silently fail - distance is optional
        console.log(
          "Could not get user location for distance calculation:",
          error,
        );
      }
    };

    if (masjid) {
      getLocationForDistance();
    }
  }, [masjid, isAuthenticated, user]);

  const checkAdminStatus = async (masjidId: number) => {
    try {
      const response = await api.get(`/api/masjid/${masjidId}/admin-check`);
      setIsAdmin(response.data.isAdmin || false);
    } catch (error) {
      console.log("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const fetchMasjidDetails = async (masjidId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchMasjidById(masjidId);
      setMasjid(data.data[0]);
      console.log(data, masjid);
    } catch (error: unknown) {
      console.error("Error fetching masjid details:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          setError("Masjid not found");
        } else {
          setError("Failed to load masjid details. Please try again.");
        }
      } else {
        setError("Failed to load masjid details. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openInMaps = () => {
    if (masjid) {
      const url = getMapSearchUrl({
        latitude: masjid.latitude,
        longitude: masjid.longitude,
        address: masjid.address,
        name: masjid.name,
      });
      window.open(url, "_blank");
    }
  };

  const getDirections = () => {
    if (masjid) {
      const url = getMapDirectionsUrl(
        {
          latitude: masjid.latitude,
          longitude: masjid.longitude,
          address: masjid.address,
          name: masjid.name,
        },
        userLocation || undefined,
      );
      window.open(url, "_blank");
    }
  };

  const handleEdit = () => {
    if (masjid) {
      router.push(`/masjid/${slug}/edit`);
    }
  };

  const handleDelete = async () => {
    if (
      !masjid ||
      !window.confirm(
        "Are you sure you want to delete this masjid? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/api/masjid/${masjid.id}`);
      router.push("/find?deleted=true");
    } catch (error) {
      console.error("Error deleting masjid:", error);
      alert("Failed to delete masjid. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <span className="text-slate-300">Loading masjid details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <Header />
        <BackButton href="/find" label="Find Another Masjid" />

        <div className="max-w-2xl mx-auto text-center mt-20">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-red-300 mb-4">Error</h1>
            <p className="text-red-200 mb-6">{error}</p>
            <button
              onClick={() => router.push("/find")}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
            >
              Find Another Masjid
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!masjid) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <Header />
        <BackButton href="/find" label="Find Another Masjid" />

        <div className="max-w-2xl mx-auto text-center mt-20">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-slate-300 mb-4">
              Masjid Not Found
            </h1>
            <p className="text-slate-400 mb-6">
              The masjid you&apos;re looking for could not be found.
            </p>
            <button
              onClick={() => router.push("/find")}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
            >
              Find Another Masjid
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <Header />
      <BackButton href="/find" label="Find Another Masjid" />

      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {masjid.name}
            </h1>
            <p className="text-slate-300 text-lg">{masjid.address}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <button
              onClick={openInMaps}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600/50 hover:bg-blue-600 border border-blue-500 rounded-lg transition-all text-blue-300 hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              View on Map
            </button>

            <button
              onClick={getDirections}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600/50 hover:bg-emerald-600 border border-emerald-500 rounded-lg transition-all text-emerald-300 hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              Get Directions
            </button>

            {/* Admin Controls */}
            {isAdmin && (
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-600/50 hover:bg-amber-600 border border-amber-500 rounded-lg transition-all text-amber-300 hover:text-white"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Masjid
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600/50 hover:bg-red-600 border border-red-500 rounded-lg transition-all text-red-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-red-300/20 border-t-red-300 rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                  {isDeleting ? "Deleting..." : "Delete Masjid"}
                </button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="bg-slate-700/30 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-emerald-400 mb-4">
                  Basic Information
                </h2>

                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 text-sm">Address:</span>
                    <p className="text-white">{masjid.address}</p>
                  </div>

                  {masjid.calculationMethod && (
                    <div>
                      <span className="text-slate-400 text-sm">
                        Prayer Calculation Method:
                      </span>
                      <p className="text-white">{masjid.calculationMethod}</p>
                    </div>
                  )}

                  {distance !== null && (
                    <div>
                      <span className="text-slate-400 text-sm">
                        Distance from you:
                      </span>
                      <p className="text-white">
                        {formatMasjidDistance(distance)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              {(masjid.phone || masjid.email) && (
                <div className="bg-slate-700/30 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-emerald-400 mb-4">
                    Contact Information
                  </h2>

                  <div className="space-y-3">
                    {masjid.phone && (
                      <div>
                        <span className="text-slate-400 text-sm">Phone:</span>
                        <p className="text-white">
                          <a
                            href={`tel:${masjid.phone}`}
                            className="hover:text-emerald-400 transition-colors"
                          >
                            {masjid.phone}
                          </a>
                        </p>
                      </div>
                    )}

                    {masjid.email && (
                      <div>
                        <span className="text-slate-400 text-sm">Email:</span>
                        <p className="text-white">
                          <a
                            href={`mailto:${masjid.email}`}
                            className="hover:text-emerald-400 transition-colors"
                          >
                            {masjid.email}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Prayer Times and Services */}
            <div className="space-y-6">
              {/* Prayer Times */}
              {masjid.prayerTimes && (
                <div className="bg-slate-700/30 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-emerald-400 mb-4">
                    Today&apos;s Prayer Times
                  </h2>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-600/50">
                      <span className="text-slate-300">Fajr</span>
                      <span className="text-white font-semibold">
                        {masjid.prayerTimes.fajr}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-600/50">
                      <span className="text-slate-300">Dhuhr</span>
                      <span className="text-white font-semibold">
                        {masjid.prayerTimes.dhuhr}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-600/50">
                      <span className="text-slate-300">Asr</span>
                      <span className="text-white font-semibold">
                        {masjid.prayerTimes.asr}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-600/50">
                      <span className="text-slate-300">Maghrib</span>
                      <span className="text-white font-semibold">
                        {masjid.prayerTimes.maghrib}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-300">Isha</span>
                      <span className="text-white font-semibold">
                        {masjid.prayerTimes.isha}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Services */}
              {masjid.services && masjid.services.length > 0 && (
                <div className="bg-slate-700/30 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-emerald-400 mb-4">
                    Services & Facilities
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {masjid.services.map((service, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-emerald-600/20 border border-emerald-600/30 rounded-full text-emerald-300 text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Actions */}
          {isAdmin && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">
                Admin Actions
              </h2>

              <div className="flex gap-4">
                <button
                  onClick={handleEdit}
                  className="flex-1 px-6 py-3 bg-blue-600/50 hover:bg-blue-600 border border-blue-500 rounded-lg transition-all text-blue-300 hover:text-white"
                >
                  Edit Masjid
                </button>

                <button
                  onClick={handleDelete}
                  className="flex-1 px-6 py-3 bg-red-600/50 hover:bg-red-600 border border-red-500 rounded-lg transition-all text-red-300 hover:text-white"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </div>
                  ) : (
                    "Delete Masjid"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
