/**
 * Authentication utilities for JWT token management and user session handling
 */

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TokenPayload {
  user: User;
  exp: number;
  iat: number;
}

/**
 * Decode JWT token without verification (for client-side use only)
 * @param token JWT token string
 * @returns Decoded token payload or null if invalid
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded as TokenPayload;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 * @param token JWT token string
 * @returns True if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

/**
 * Get user information from JWT token
 * @param token JWT token string
 * @returns User object or null if token is invalid
 */
export const getUserFromToken = (token: string): User | null => {
  const decoded = decodeToken(token);
  return decoded?.user || null;
};

/**
 * Check if token will expire within a certain time frame
 * @param token JWT token string
 * @param minutesFromNow Number of minutes to check ahead
 * @returns True if token will expire within the specified time
 */
export const willTokenExpireSoon = (token: string, minutesFromNow: number = 5): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const expirationThreshold = currentTime + (minutesFromNow * 60);
  return decoded.exp < expirationThreshold;
};

/**
 * Get token expiration time as Date object
 * @param token JWT token string
 * @returns Date object of expiration time or null if invalid
 */
export const getTokenExpirationDate = (token: string): Date | null => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  return new Date(decoded.exp * 1000);
};

/**
 * Validate token format (basic structure check)
 * @param token JWT token string
 * @returns True if token has valid JWT structure
 */
export const isValidTokenFormat = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};
