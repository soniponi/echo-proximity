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

  async requestPermissions(): Promise<boolean> {
    try {
      console.log('🔍 Requesting location permissions...');
      
      if (Capacitor.isNativePlatform()) {
        // For native platforms (iOS/Android), use Capacitor Geolocation
        console.log('📱 Native platform detected, using Capacitor Geolocation');
        
        // First check current permissions
        const currentPermissions = await Geolocation.checkPermissions();
        console.log('📋 Current permissions:', currentPermissions);
        
        if (currentPermissions.location === 'granted') {
          console.log('✅ Location permission already granted');
          return true;
        }
        
        // Request permissions if not granted
        console.log('🔐 Requesting location permissions...');
        const permissions = await Geolocation.requestPermissions({
          permissions: ['location']
        });
        
        console.log('📝 Permission result:', permissions);
        
        const isGranted = permissions.location === 'granted';
        console.log(isGranted ? '✅ Permission granted' : '❌ Permission denied');
        
        return isGranted;
      } else {
        // For web browsers
        console.log('🌐 Web platform detected, using browser geolocation');
        try {
          await this.getCurrentPosition();
          console.log('✅ Web geolocation permission granted');
          return true;
        } catch (error) {
          console.error('❌ Web geolocation permission denied:', error);
          return false;
        }
      }
    } catch (error) {
      console.error('💥 Error requesting location permission:', error);
      return false;
    }
  }

  async getCurrentPosition(): Promise<LocationData> {
    try {
      console.log('📍 Getting current position...');
      
      if (Capacitor.isNativePlatform()) {
        // Use Capacitor Geolocation for native platforms
        console.log('📱 Using Capacitor Geolocation');
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        });
        
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        console.log('📍 Native position obtained:', locationData);
        return locationData;
      } else {
        // Use web geolocation for browsers
        console.log('🌐 Using web geolocation');
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            const error = {
              code: 1,
              message: 'Geolocation is not supported by this browser'
            };
            console.error('❌ Geolocation not supported:', error);
            reject(error);
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp
              };
              console.log('📍 Web position obtained:', locationData);
              resolve(locationData);
            },
            (error) => {
              const locationError = {
                code: error.code,
                message: error.message
              };
              console.error('❌ Web geolocation error:', locationError);
              reject(locationError);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 300000 // 5 minutes
            }
          );
        });
      }
    } catch (error: any) {
      console.error('💥 Error getting current position:', error);
      throw {
        code: error.code || 1,
        message: error.message || 'Failed to get location'
      };
    }
  }

  async getCurrentLocation(): Promise<LocationData> {
    return this.getCurrentPosition();
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
      console.log('🔍 Checking location permission status...');
      
      if (Capacitor.isNativePlatform()) {
        const permissions = await Geolocation.checkPermissions();
        const status = permissions.location;
        console.log('📱 Native permission status:', status);
        
        // Map Capacitor permission states to our expected format
        if (status === 'granted') return 'granted';
        if (status === 'denied') return 'denied';
        return 'prompt';
      } else {
        // For web browsers
        if (!navigator.permissions) {
          // Fallback for browsers that don't support permissions API
          try {
            await this.getCurrentPosition();
            console.log('🌐 Web permission: granted (fallback test)');
            return 'granted';
          } catch {
            console.log('🌐 Web permission: denied (fallback test)');
            return 'denied';
          }
        }

        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          const state = permission.state;
          console.log('🌐 Web permission status:', state);
          
          // Handle all possible PermissionState values
          if (state === 'granted') return 'granted';
          if (state === 'denied') return 'denied';
          // Map 'prompt-with-rationale' to 'prompt'
          return 'prompt';
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
      console.error('💥 Error checking location permission:', error);
      return 'denied';
    }
  }
}

export const locationService = new LocationService();
