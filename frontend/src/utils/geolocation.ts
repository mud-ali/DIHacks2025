/**
 * Geolocation utilities for getting user location and handling location-related operations
 */

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface GeolocationError {
  code: number;
  message: string;
  type: 'permission_denied' | 'position_unavailable' | 'timeout' | 'unknown';
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * Get the user's current location with comprehensive error handling and fallback options
 */
export const getCurrentLocation = async (): Promise<UserLocation> => {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser.',
        type: 'unknown'
      } as GeolocationError);
      return;
    }

    // Different option sets to try in order
    const options: GeolocationOptions[] = [
      // First try: High accuracy, long timeout
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      },
      // Second try: Lower accuracy, medium timeout
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      },
      // Third try: Any cached position
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 600000
      }
    ];

    let currentAttempt = 0;

    const tryGeolocation = () => {
      if (currentAttempt >= options.length) {
        reject({
          code: 3,
          message: 'Failed to get location after multiple attempts.',
          type: 'timeout'
        } as GeolocationError);
        return;
      }

      const currentOptions = options[currentAttempt];
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          // If it's a timeout or position unavailable, try next option
          if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
            currentAttempt++;
            tryGeolocation();
            return;
          }
          
          // For other errors, reject immediately
          let errorType: GeolocationError['type'] = 'unknown';
          let errorMessage = error.message;
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorType = 'permission_denied';
              errorMessage = 'Location access denied. Please check your browser permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorType = 'position_unavailable';
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorType = 'timeout';
              errorMessage = 'Location request timed out.';
              break;
          }
          
          reject({
            code: error.code,
            message: errorMessage,
            type: errorType
          } as GeolocationError);
        },
        currentOptions
      );
    };

    tryGeolocation();
  });
};

/**
 * Check geolocation permission status
 */
export const checkGeolocationPermission = async (): Promise<PermissionState | null> => {
  if (!('permissions' in navigator)) {
    return null;
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state;
  } catch (error) {
    console.warn('Failed to check geolocation permission:', error);
    return null;
  }
};

/**
 * Get detailed geolocation debug information
 */
export const getGeolocationDebugInfo = () => {
  return {
    geolocationSupported: !!navigator.geolocation,
    userAgent: navigator.userAgent,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    port: window.location.port,
    fullUrl: window.location.href,
    isSecureContext: window.isSecureContext,
    timestamp: new Date().toISOString()
  };
};
