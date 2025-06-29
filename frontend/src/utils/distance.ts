/**
 * Distance calculation utilities for geographic coordinates
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate the distance between two points using the Haversine formula
 * @param coord1 First coordinate point
 * @param coord2 Second coordinate point
 * @returns Distance in kilometers
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(coord2.latitude - coord1.latitude);
  const dLon = deg2rad(coord2.longitude - coord1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coord1.latitude)) * Math.cos(deg2rad(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
};

/**
 * Convert degrees to radians
 */
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Format distance with appropriate units
 * @param distance Distance in miles
 * @returns Formatted distance string
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}mi`;
  } else {
    return `${Math.round(distance)}mi`;
  }
};

/**
 * Sort an array of objects by distance from a reference point
 * @param items Array of items with latitude and longitude properties
 * @param referencePoint Reference coordinates to calculate distance from
 * @returns Sorted array with distance property added
 */
export const sortByDistance = <T extends Coordinates>(
  items: T[],
  referencePoint: Coordinates
): (T & { distance: number })[] => {
  return items
    .map(item => ({
      ...item,
      distance: calculateDistance(referencePoint, item)
    }))
    .sort((a, b) => a.distance - b.distance);
};
