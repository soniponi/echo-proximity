
import { Geolocation, Position, PermissionStatus } from '@capacitor/geolocation';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

class LocationService {
  private watchId: string | null = null;
  private lastKnownPosition: LocationData | null = null;
  private listeners: Set<(location: LocationData) => void> = new Set();

  async requestPermission(): Promise<boolean> {
    try {
      console.log('Requesting location permissions...');
      const permission = await Geolocation.requestPermissions();
      console.log('Permission result:', permission);
      
      return permission.location === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  async checkPermission(): Promise<boolean> {
    try {
      const permission = await Geolocation.checkPermissions();
      return permission.location === 'granted';
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }

  async getCurrentPosition(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        console.log('No location permission available');
        return null;
      }

      console.log('Getting current position...');
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy || 0,
        timestamp: position.timestamp
      };

      this.lastKnownPosition = locationData;
      return locationData;
    } catch (error) {
      console.error('Error getting current position:', error);
      return this.lastKnownPosition;
    }
  }

  async startWatching(): Promise<boolean> {
    try {
      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        console.log('Cannot start watching: no permission');
        return false;
      }

      if (this.watchId) {
        console.log('Already watching location');
        return true;
      }

      console.log('Starting location watch...');
      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        },
        (position: Position | null, err?: any) => {
          if (err) {
            console.error('Location watch error:', err);
            return;
          }

          if (position) {
            const locationData: LocationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy || 0,
              timestamp: position.timestamp
            };

            this.lastKnownPosition = locationData;
            this.notifyListeners(locationData);
          }
        }
      );

      console.log('Location watch started with ID:', this.watchId);
      return true;
    } catch (error) {
      console.error('Error starting location watch:', error);
      return false;
    }
  }

  async stopWatching(): Promise<void> {
    if (this.watchId) {
      console.log('Stopping location watch...');
      try {
        await Geolocation.clearWatch({ id: this.watchId });
        this.watchId = null;
        console.log('Location watch stopped');
      } catch (error) {
        console.error('Error stopping location watch:', error);
      }
    }
  }

  addLocationListener(callback: (location: LocationData) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(location: LocationData): void {
    this.listeners.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Error in location listener:', error);
      }
    });
  }

  getLastKnownPosition(): LocationData | null {
    return this.lastKnownPosition;
  }

  // Request background location permission for iOS
  async requestBackgroundPermission(): Promise<boolean> {
    try {
      // First check if we have when-in-use permission
      const permission = await Geolocation.checkPermissions();
      if (permission.location !== 'granted') {
        const newPermission = await Geolocation.requestPermissions();
        if (newPermission.location !== 'granted') {
          return false;
        }
      }

      // For background location, we need to request it separately
      // This will prompt the user to change to "Always" in iOS settings
      console.log('Background location access requires "Always" permission in iOS Settings');
      return true;
    } catch (error) {
      console.error('Error requesting background permission:', error);
      return false;
    }
  }
}

export const locationService = new LocationService();
