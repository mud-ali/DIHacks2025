/**
 * Masjid-specific utility functions
 */

import { generateSlug } from './slug';
import { formatDistance } from './distance';

export interface Masjid {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  address: string;
  calculationMethod?: string;
  distance?: number;
}

/**
 * Generate a masjid-specific slug that includes the ID for uniqueness
 * @param masjid The masjid object
 * @returns URL-friendly slug with ID
 */
export const generateMasjidSlug = (masjid: Masjid): string => {
//   const nameSlug = generateSlug(masjid.name);
  return `${masjid.id}`;
};

/**
 * Extract masjid ID from a slug
 * @param slug The slug containing the ID at the end
 * @returns The masjid ID or null if not found
 */
export const extractMasjidIdFromSlug = (slug: string): number | null => {
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  const id = parseInt(lastPart, 10);
  return isNaN(id) ? null : id;
};

/**
 * Format masjid distance for display
 * @param distance Distance in kilometers (optional)
 * @returns Formatted distance string
 */
export const formatMasjidDistance = (distance?: number): string => {
  if (!distance) return "—";
  return formatDistance(distance);
};

/**
 * Sort masajid by different criteria
 * @param masajid Array of masajid
 * @param sortBy Sort criteria
 * @returns Sorted array
 */
export const sortMasajid = (masajid: Masjid[], sortBy: 'name' | 'address' | 'distance'): Masjid[] => {
  return [...masajid].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'address':
        return a.address.localeCompare(b.address);
      case 'distance':
        return (a.distance || 0) - (b.distance || 0);
      default:
        return 0;
    }
  });
};
