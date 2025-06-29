/**
 * Maps utilities for generating Google Maps URLs
 */

import type { UserLocation } from "./geolocation";

export interface MapLocation {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

/**
 * Generate a Google Maps search URL for a location
 * @param location The location to search for
 * @returns Google Maps search URL
 */
export const getMapSearchUrl = (location: MapLocation): string => {
  // Use address if available, otherwise fall back to coordinates
  const query = location.address 
    ? encodeURIComponent(location.address)
    : `${location.latitude},${location.longitude}`;
  
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

/**
 * Generate a Google Maps directions URL
 * @param destination The destination location
 * @param origin Optional origin location (if not provided, uses user's current location)
 * @returns Google Maps directions URL
 */
export const getMapDirectionsUrl = (
  destination: MapLocation,
  origin?: UserLocation
): string => {
  // Use address if available for destination, otherwise coordinates
  const destinationQuery = destination.address 
    ? encodeURIComponent(destination.address)
    : `${destination.latitude},${destination.longitude}`;
  
  if (origin) {
    // When origin is provided, use coordinates for origin and address/coords for destination
    return `https://www.google.com/maps/dir/${origin.latitude},${origin.longitude}/${destinationQuery}`;
  } else {
    // Let Google Maps use user's current location as origin
    return `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}`;
  }
};

/**
 * Open a location in Google Maps (search or directions based on user location availability)
 * @param destination The destination location
 * @param userLocation Optional user location for directions
 */
export const openInGoogleMaps = (
  destination: MapLocation,
  userLocation?: UserLocation | null
): void => {
  const url = userLocation 
    ? getMapDirectionsUrl(destination, userLocation)
    : getMapSearchUrl(destination);
  
  window.open(url, '_blank');
};
