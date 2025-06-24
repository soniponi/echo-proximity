
import { Geolocation } from '@capacitor/geolocation';
import { supabase } from '@/integrations/supabase/client';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export class LocationService {
  private static instance: LocationService;
  private watchId: string | null = null;
  private isTracking = false;
  private permissionGranted: boolean | null = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    // Return cached result if we already know the permission status
    if (this.permissionGranted !== null) {
      return this.permissionGranted;
    }

    try {
      console.log('Requesting location permissions...');
      const permissions = await Geolocation.requestPermissions();
      console.log('Location permissions result:', permissions);
      
      this.permissionGranted = permissions.location === 'granted';
      return this.permissionGranted;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      this.permissionGranted = false;
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      console.log('Getting current location...');
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000 // 1 minute
      });

      console.log('Location obtained:', position);
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async startLocationTracking(userId: string): Promise<boolean> {
    if (this.isTracking) {
      console.log('Already tracking location');
      return true;
    }

    try {
      console.log('Starting location tracking for user:', userId);
      
      // Don't request permissions again if we already have them
      if (this.permissionGranted !== true) {
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
          console.log('Location permission denied');
          return false;
        }
      }

      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 60000 // 1 minute
        },
        (position) => {
          if (position) {
            console.log('Location update received:', position);
            this.updateUserLocation(userId, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          }
        }
      );

      this.isTracking = true;
      console.log('Location tracking started with watchId:', this.watchId);
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  async stopLocationTracking(): Promise<void> {
    if (this.watchId) {
      try {
        await Geolocation.clearWatch({ id: this.watchId });
        console.log('Stopped location tracking');
      } catch (error) {
        console.error('Error stopping location tracking:', error);
      }
      this.watchId = null;
    }
    this.isTracking = false;
  }

  private async updateUserLocation(userId: string, location: LocationData): Promise<void> {
    try {
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
        console.error('Error updating user location:', error);
      } else {
        console.log('Location updated successfully');
      }
    } catch (error) {
      console.error('Error updating user location:', error);
    }
  }

  async findNearbyUsers(
    userId: string, 
    location: LocationData, 
    radiusMeters: number = 100
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('find_nearby_users', {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_meters: radiusMeters,
        requesting_user_id: userId
      });

      if (error) {
        console.error('Error finding nearby users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error finding nearby users:', error);
      return [];
    }
  }

  // Reset permission cache (useful for testing)
  resetPermissions(): void {
    this.permissionGranted = null;
  }
}
