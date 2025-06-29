/**
 * URL slug utilities for generating and handling URL-friendly strings
 */

/**
 * Generate a URL-friendly slug from a string
 * @param text The text to convert to a slug
 * @returns URL-friendly slug
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
};

/**
 * Convert a slug back to a readable title
 * @param slug The slug to convert
 * @returns Human-readable title
 */
export const slugToTitle = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Validate if a string is a valid slug format
 * @param slug The string to validate
 * @returns True if valid slug format
 */
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Generate a unique slug by appending a number if needed
 * @param baseSlug The base slug to make unique
 * @param existingSlugs Array of existing slugs to check against
 * @returns Unique slug
 */
export const generateUniqueSlug = (baseSlug: string, existingSlugs: string[]): string => {
  const slug = generateSlug(baseSlug);
  
  if (!existingSlugs.includes(slug)) {
    return slug;
  }
  
  let counter = 1;
  let uniqueSlug = `${slug}-${counter}`;
  
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }
  
  return uniqueSlug;
};
