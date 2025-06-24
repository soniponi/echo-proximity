
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LocationService, LocationData } from '@/services/locationService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NearbyUser {
  id: string;
  name: string;
  bio: string;
  photo: string;
  interests: string[];
  distance_meters: number;
  last_seen: string;
}

export const useProximityScanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isStarting, setIsStarting] = useState(false); // Prevent multiple simultaneous starts
  const locationService = LocationService.getInstance();

  const requestLocationPermission = useCallback(async () => {
    console.log('Requesting location permission...');
    const hasPermission = await locationService.requestPermissions();
    setLocationPermission(hasPermission);
    
    if (!hasPermission) {
      toast({
        title: "Location Permission Required",
        description: "Please enable location services to find people nearby.",
        variant: "destructive"
      });
    }
    
    return hasPermission;
  }, [locationService, toast]);

  const startScanning = useCallback(async () => {
    if (!user || isScanning || isStarting) {
      console.log('Cannot start scanning:', { user: !!user, isScanning, isStarting });
      return false;
    }

    setIsStarting(true);
    console.log('Starting proximity scanning...');
    
    try {
      // Request location permission first
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setIsStarting(false);
        return false;
      }

      // Get current location
      const location = await locationService.getCurrentLocation();
      if (!location) {
        toast({
          title: "Location Error",
          description: "Unable to get your current location. Please check your settings.",
          variant: "destructive"
        });
        setIsStarting(false);
        return false;
      }

      setCurrentLocation(location);
      setIsScanning(true);

      // Start location tracking
      const trackingStarted = await locationService.startLocationTracking(user.id);
      if (!trackingStarted) {
        setIsScanning(false);
        setIsStarting(false);
        return false;
      }

      // Initial scan for nearby users
      await scanForNearbyUsers(location);

      toast({
        title: "Scanning Started",
        description: "Looking for people nearby. You'll be notified when someone is found.",
      });

      setIsStarting(false);
      return true;
    } catch (error) {
      console.error('Error starting proximity scanning:', error);
      setIsScanning(false);
      setIsStarting(false);
      toast({
        title: "Error",
        description: "Failed to start proximity scanning. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, isScanning, isStarting, locationService, requestLocationPermission, toast]);

  const stopScanning = useCallback(async () => {
    console.log('Stopping proximity scanning...');
    
    await locationService.stopLocationTracking();
    setIsScanning(false);
    setNearbyUsers([]);
    setCurrentLocation(null);

    toast({
      title: "Scanning Stopped",
      description: "You're no longer visible to others nearby.",
    });
  }, [locationService, toast]);

  const scanForNearbyUsers = useCallback(async (location?: LocationData) => {
    if (!user) return;

    const scanLocation = location || currentLocation;
    if (!scanLocation) return;

    try {
      const users = await locationService.findNearbyUsers(user.id, scanLocation, 100);
      console.log('Found nearby users:', users);
      setNearbyUsers(users);
    } catch (error) {
      console.error('Error scanning for nearby users:', error);
    }
  }, [user, currentLocation, locationService]);

  // Set up real-time subscription for nearby users
  useEffect(() => {
    if (!isScanning || !user) return;

    // Subscribe to profile changes for real-time updates
    const channel = supabase
      .channel('proximity-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `is_visible=eq.true`
        },
        () => {
          // Re-scan when profiles change
          scanForNearbyUsers();
        }
      )
      .subscribe();

    // Periodic scanning every 30 seconds
    const interval = setInterval(() => {
      scanForNearbyUsers();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [isScanning, user, scanForNearbyUsers]);

  return {
    isScanning,
    nearbyUsers,
    currentLocation,
    locationPermission,
    startScanning,
    stopScanning,
    requestLocationPermission,
    scanForNearbyUsers
  };
};
