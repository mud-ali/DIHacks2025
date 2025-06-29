'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import { getCurrentLocation, getGeolocationDebugInfo, GeolocationError, UserLocation } from "@/utils/geolocation";
import { generateMasjidSlug, sortMasajid, formatMasjidDistance } from "@/utils/masjid";
import { createSuccessMessage, createErrorMessage, createInfoMessage, getMessageClasses, Message } from "@/utils/ui";
import { fetchMasajid, calculateMasajidDistances } from "@/utils/api";
import { openInGoogleMaps } from "@/utils/maps";
import type { Masjid } from "@/utils/masjid";

export default function FindMasjid() {
  const searchParams = useSearchParams();
  const [masajid, setMasajid] = useState<Masjid[]>([]);
  const [filteredMasajid, setFilteredMasajid] = useState<Masjid[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'distance' | 'address'>('name');
  const [message, setMessage] = useState<Message | null>(null);

  // Fetch masajid on component mount
  useEffect(() => {
    loadMasajid();
  }, []);

  // Check for success messages from URL params
  useEffect(() => {
    if (searchParams.get('deleted') === 'true') {
      setMessage(createSuccessMessage("Masjid deleted successfully"));
      // Clear the URL parameter
      window.history.replaceState({}, '', '/find');
    }
  }, [searchParams]);

  // Filter masajid based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMasajid(masajid);
    } else {
      const filtered = masajid.filter(
        (masjid) =>
          masjid.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          masjid.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMasajid(filtered);
    }
  }, [searchQuery, masajid]);

  const loadMasajid = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMasajid();
      setMasajid(data);
    } catch (error) {
      console.error("Error fetching masajid:", error);
      setMessage(createErrorMessage("Failed to fetch masajid. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationAndCalculateDistances = async () => {
    setIsGettingLocation(true);
    setMessage(createInfoMessage("Getting your location to calculate distances..."));

    // Log debug info
    const debugInfo = getGeolocationDebugInfo();
    console.log("=== Geolocation Debug Info ===", debugInfo);

    try {
      const location = await getCurrentLocation();
      console.log("Successfully got location:", location);
      
      setUserLocation(location);
      await calculateDistances(location);
    } catch (error) {
      const geoError = error as GeolocationError;
      console.error("Geolocation failed:", geoError);
      
      let errorMessage = "Failed to get your location.";
      
      switch (geoError.type) {
        case 'permission_denied':
          errorMessage = "Location access denied. Please check your browser permissions:\n1. Click the location icon in the address bar\n2. Select 'Always allow' for location\n3. Refresh the page and try again";
          break;
        case 'position_unavailable':
          errorMessage = "Location information unavailable. Please check that:\n1. Location services are enabled on your system\n2. You have an internet connection\n3. Try again in a moment";
          break;
        case 'timeout':
          errorMessage = "Location request timed out. Please try again.";
          break;
        default:
          errorMessage = geoError.message || "An unknown error occurred while getting your location.";
      }
      
      setMessage(createErrorMessage(errorMessage));
    } finally {
      setIsGettingLocation(false);
    }
  };

  const calculateDistances = async (location: UserLocation) => {
    try {
      // Use the API utility for server-side distance calculation
      const masajidWithDistances = await calculateMasajidDistances(location, masajid);
      
      setMasajid(masajidWithDistances);
      setMessage(createSuccessMessage("Distances calculated! You can now sort by distance."));
      setSortBy('distance'); // Auto-sort by distance
    } catch (error) {
      console.error("Error calculating distances:", error);
      setMessage(createErrorMessage("Failed to calculate distances. Please try again."));
    }
  };

  return (
    <div className="min-h-screen text-white p-6">
      <Header />
      <BackButton />
      
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Find Center
          </h1>
          <p className="text-slate-300 text-center mb-8">
            Search for masajid in your area
          </p>

          {message && (
            <div className={getMessageClasses(message.type)}>
              {message.text}
            </div>
          )}

          {/* Search and Controls */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search masajid by name or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-400 transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-slate-300 text-sm">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'distance' | 'address')}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="name">Name</option>
                  <option value="address">Address</option>
                  <option value="distance" disabled={!userLocation}>
                    Distance {!userLocation && "(location required)"}
                  </option>
                </select>
              </div>

              <button
                onClick={getLocationAndCalculateDistances}
                disabled={isGettingLocation}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600/50 hover:bg-emerald-600 disabled:bg-slate-600/50 border border-emerald-500 disabled:border-slate-600 rounded-lg transition-all text-sm text-emerald-300 disabled:text-slate-400 hover:text-white"
              >
                {isGettingLocation ? (
                  <div className="w-4 h-4 border-2 border-emerald-300/20 border-t-emerald-300 rounded-full animate-spin"></div>
                ) : (
                  <svg
                    className="w-4 h-4"
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
                )}
                {isGettingLocation ? "Getting Location..." : "Sort by Distance"}
              </button>
            </div>
          </div>

          {/* Masajid Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <span className="ml-3 text-slate-300">Loading masajid...</span>
              </div>
            ) : filteredMasajid.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                {searchQuery ? "No masajid found matching your search." : "No masajid available."}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Address</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Prayer Time Calculation Method</th>
                    {userLocation && (
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Distance</th>
                    )}
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortMasajid(filteredMasajid, sortBy).map((masjid) => (
                    <tr
                      key={masjid.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <Link 
                          href={`/masjid/${generateMasjidSlug(masjid)}`}
                          className="text-white font-medium hover:text-emerald-400 transition-colors"
                        >
                          {masjid.name}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-slate-300">{masjid.address}</td>
                      <td className="py-4 px-4 text-slate-400 text-sm">
                        {masjid.calculationMethod || "Default"}
                      </td>
                      {userLocation && (
                        <td className="py-4 px-4 text-emerald-400 font-medium">
                          {formatMasjidDistance(masjid.distance)}
                        </td>
                      )}
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/masjid/${generateMasjidSlug(masjid)}`}
                            className="px-3 py-1 bg-emerald-600/50 hover:bg-emerald-600 border border-emerald-500 rounded text-emerald-300 hover:text-white text-sm transition-all"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => {
                              openInGoogleMaps(
                                { 
                                  latitude: masjid.latitude, 
                                  longitude: masjid.longitude,
                                  address: masjid.address,
                                  name: masjid.name
                                },
                                userLocation
                              );
                            }}
                            className="px-3 py-1 bg-blue-600/50 hover:bg-blue-600 border border-blue-500 rounded text-blue-300 hover:text-white text-sm transition-all"
                          >
                            {userLocation ? "Get Directions" : "View Map"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {filteredMasajid.length > 0 && (
            <div className="mt-6 text-center text-slate-400 text-sm">
              Showing {filteredMasajid.length} of {masajid.length} masajid{masajid.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
