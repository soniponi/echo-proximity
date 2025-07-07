
import { Geolocation } from '@capacitor/geolocation';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
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

class LocationServiceClass {
  private static instance: LocationServiceClass;
  private watchId: string | null = null;
  private isTracking = false;

  static getInstance(): LocationServiceClass {
    if (!LocationServiceClass.instance) {
      LocationServiceClass.instance = new LocationServiceClass();
    }
    return LocationServiceClass.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await Geolocation.requestPermissions();
      return permissions.location === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async startLocationTracking(userId: string): Promise<boolean> {
    if (this.isTracking) {
      return true;
    }

    try {
      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 60000
        },
        (position) => {
          console.log('Location updated:', position);
          this.updateLocationInDatabase(userId, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          console.error('Location tracking error:', error);
        }
      );

      this.isTracking = true;
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  async stopLocationTracking(): Promise<void> {
    if (this.watchId) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
    this.isTracking = false;
  }

  private async updateLocationInDatabase(userId: string, location: LocationData): Promise<void> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      await supabase
        .from('profiles')
        .update({
          current_lat: location.latitude,
          current_lng: location.longitude,
          location_accuracy: location.accuracy,
          location_updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating location in database:', error);
    }
  }

  async findNearbyUsers(userId: string, location: LocationData, radiusMeters: number = 100): Promise<NearbyUser[]> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
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
}

export const locationService = LocationServiceClass.getInstance();
export { LocationServiceClass as LocationService };
