
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { supabase } from '@/integrations/supabase/client';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export interface NearbyUser {
  id: string;
  name: string;
  bio: string;
  photo: string;
  interests: string[];
  distance_meters: number;
  last_seen: string;
}

class LocationService {
  private watchId: string | number | null = null;

  async getCurrentPosition(): Promise<LocationData> {
    try {
      if (Capacitor.isNativePlatform()) {
        // Use Capacitor Geolocation for native platforms
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        });
        
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
      } else {
        // Use web geolocation for browsers
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject({
              code: 1,
              message: 'Geolocation is not supported by this browser'
            });
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp
              });
            },
            (error) => {
              reject({
                code: error.code,
                message: error.message
              });
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000 // 5 minutes
            }
          );
        });
      }
    } catch (error: any) {
      throw {
        code: error.code || 1,
        message: error.message || 'Failed to get location'
      };
    }
  }

  async getCurrentLocation(): Promise<LocationData> {
    return this.getCurrentPosition();
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        const permissions = await Geolocation.requestPermissions();
        return permissions.location === 'granted';
      } else {
        // For web, try to get current position to trigger permission request
        await this.getCurrentPosition();
        return true;
      }
    } catch (error) {
      console.error('Location permission denied:', error);
      return false;
    }
  }

  async requestLocationPermission(): Promise<boolean> {
    return this.requestPermissions();
  }

  async findNearbyUsers(userId: string, location: LocationData, radiusMeters: number = 100): Promise<NearbyUser[]> {
    try {
      const { data, error } = await supabase.rpc('find_nearby_users', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_meters: radiusMeters,
        requesting_user_id: userId
      });

      if (error) {
        console.error('Error finding nearby users:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in findNearbyUsers:', error);
      return [];
    }
  }

  async startLocationTracking(userId: string): Promise<boolean> {
    try {
      const location = await this.getCurrentPosition();
      
      // Update user's location in the database
      const { error } = await supabase
        .from('profiles')
        .update({
          current_lat: location.latitude,
          current_lng: location.longitude,
          location_accuracy: location.accuracy,
          location_updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating location:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  async stopLocationTracking(): Promise<void> {
    if (this.watchId !== null) {
      if (Capacitor.isNativePlatform()) {
        await Geolocation.clearWatch({ id: this.watchId as string });
      } else {
        navigator.geolocation?.clearWatch(this.watchId as number);
      }
      this.watchId = null;
    }
  }

  startWatchingPosition(
    onSuccess: (location: LocationData) => void,
    onError: (error: LocationError) => void
  ): void {
    if (Capacitor.isNativePlatform()) {
      // Use Capacitor for native platforms
      Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000
        },
        (position) => {
          if (position) {
            onSuccess({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            });
          }
        }
      ).then((watchId) => {
        this.watchId = watchId;
      }).catch((error) => {
        onError({
          code: error.code || 1,
          message: error.message || 'Watch position failed'
        });
      });
    } else {
      // Use web geolocation for browsers
      if (!navigator.geolocation) {
        onError({
          code: 1,
          message: 'Geolocation is not supported by this browser'
        });
        return;
      }

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          onSuccess({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          onError({
            code: error.code,
            message: error.message
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // 1 minute
        }
      );
    }
  }

  stopWatchingPosition(): void {
    this.stopLocationTracking();
  }

  async checkLocationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    try {
      if (Capacitor.isNativePlatform()) {
        const permissions = await Geolocation.checkPermissions();
        return permissions.location;
      } else {
        // For web browsers
        if (!navigator.permissions) {
          // Fallback for browsers that don't support permissions API
          try {
            await this.getCurrentPosition();
            return 'granted';
          } catch {
            return 'denied';
          }
        }

        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          return permission.state;
        } catch {
          // Fallback
          try {
            await this.getCurrentPosition();
            return 'granted';
          } catch {
            return 'denied';
          }
        }
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      return 'denied';
    }
  }
}

export const locationService = new LocationService();
