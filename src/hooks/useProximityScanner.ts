
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { locationService, LocationData } from '@/services/locationService';
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
  const [isStarting, setIsStarting] = useState(false);
  const startingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear refs on unmount
  useEffect(() => {
    return () => {
      if (startingTimeoutRef.current) {
        clearTimeout(startingTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const requestLocationPermission = useCallback(async () => {
    console.log('Requesting location permission...');
    try {
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
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationPermission(false);
      return false;
    }
  }, [toast]);

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
  }, [user, currentLocation]);

  const startScanning = useCallback(async () => {
    if (!user || isScanning || isStarting) {
      console.log('Cannot start scanning:', { user: !!user, isScanning, isStarting });
      return false;
    }

    console.log('Starting proximity scanning...');
    setIsStarting(true);

    // Set a timeout to reset isStarting if the process takes too long
    startingTimeoutRef.current = setTimeout(() => {
      console.log('Starting timeout - resetting isStarting');
      setIsStarting(false);
    }, 10000); // 10 second timeout
    
    try {
      // Request location permission first
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        if (startingTimeoutRef.current) clearTimeout(startingTimeoutRef.current);
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
        if (startingTimeoutRef.current) clearTimeout(startingTimeoutRef.current);
        setIsStarting(false);
        return false;
      }

      setCurrentLocation(location);
      setIsScanning(true);

      // Start location tracking
      const trackingStarted = await locationService.startLocationTracking(user.id);
      if (!trackingStarted) {
        setIsScanning(false);
        if (startingTimeoutRef.current) clearTimeout(startingTimeoutRef.current);
        setIsStarting(false);
        return false;
      }

      // Initial scan for nearby users
      await scanForNearbyUsers(location);

      toast({
        title: "Scanning Started",
        description: "Looking for people nearby. You'll be notified when someone is found.",
      });

      if (startingTimeoutRef.current) clearTimeout(startingTimeoutRef.current);
      setIsStarting(false);
      return true;
    } catch (error) {
      console.error('Error starting proximity scanning:', error);
      setIsScanning(false);
      if (startingTimeoutRef.current) clearTimeout(startingTimeoutRef.current);
      setIsStarting(false);
      toast({
        title: "Error",
        description: "Failed to start proximity scanning. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, isScanning, isStarting, requestLocationPermission, toast, scanForNearbyUsers]);

  const stopScanning = useCallback(async () => {
    console.log('Stopping proximity scanning...');
    
    // Clear any pending timeout
    if (startingTimeoutRef.current) {
      clearTimeout(startingTimeoutRef.current);
    }
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Remove channel subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    await locationService.stopLocationTracking();
    setIsScanning(false);
    setIsStarting(false);
    setNearbyUsers([]);
    setCurrentLocation(null);

    toast({
      title: "Scanning Stopped",
      description: "You're no longer visible to others nearby.",
    });
  }, [toast]);

  // Set up real-time subscription for nearby users
  useEffect(() => {
    if (!isScanning || !user) {
      // Clean up existing subscriptions when not scanning
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Only create new subscription if one doesn't exist
    if (!channelRef.current) {
      console.log('Creating new Supabase channel subscription');
      channelRef.current = supabase
        .channel(`proximity-updates-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `is_visible=eq.true`
          },
          () => {
            console.log('Profile change detected, re-scanning...');
            scanForNearbyUsers();
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });
    }

    // Set up periodic scanning if not already running
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        console.log('Periodic scan triggered');
        scanForNearbyUsers();
      }, 30000);
    }

    return () => {
      // Cleanup will be handled by the main useEffect cleanup
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
