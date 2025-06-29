/**
 * API utilities for masjid-related server operations
 */

import axios from "axios";
import type { Masjid } from "./masjid";
import type { UserLocation } from "./geolocation";

export interface DistanceCalculationRequest {
  userLatitude: number;
  userLongitude: number;
  masajid: Array<{
    id: number;
    latitude: number;
    longitude: number;
  }>;
}

export interface DistanceCalculationResponse {
  id: number;
  distance: number;
}

/**
 * Fetch all masajid from the server
 */
export const fetchMasajid = async (): Promise<Masjid[]> => {
  const response = await axios.get("/api/masjid");
  return response.data.data || [];
};

/**
 * Calculate distances for masajid using server-side calculation
 * @param userLocation User's current location
 * @param masajid Array of masajid to calculate distances for
 * @returns Promise resolving to masajid with distance data
 */
export const calculateMasajidDistances = async (
  userLocation: UserLocation,
  masajid: Masjid[]
): Promise<Masjid[]> => {
  const requestData: DistanceCalculationRequest = {
    userLatitude: userLocation.latitude,
    userLongitude: userLocation.longitude,
    masajid: masajid.map(m => ({
      id: m.id,
      latitude: m.latitude,
      longitude: m.longitude
    }))
  };

  const response = await axios.post("/api/masjid/distances", requestData);
  const distanceResults: DistanceCalculationResponse[] = response.data;

  // Merge distance data back into masajid
  return masajid.map(masjid => {
    const distanceData = distanceResults.find(d => d.id === masjid.id);
    return {
      ...masjid,
      distance: distanceData?.distance || 0
    };
  });
};

/**
 * Fetch a single masjid by slug
 */
export const fetchMasjidById = async (slug: string) => {
  const response = await axios.get(`/api/masjid/${slug}`);
  return response.data;
};
