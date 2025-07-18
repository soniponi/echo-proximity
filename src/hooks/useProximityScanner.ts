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

  // Check initial permission status
  useEffect(() => {
    const checkInitialPermission = async () => {
      console.log('🔍 Checking initial permission status...');
      try {
        const permissionStatus = await locationService.checkLocationPermission();
        const hasPermission = permissionStatus === 'granted';
        console.log('📋 Initial permission status:', permissionStatus, '→', hasPermission);
        setLocationPermission(hasPermission);
      } catch (error) {
        console.error('💥 Error checking initial permission:', error);
        setLocationPermission(false);
      }
    };

    checkInitialPermission();
  }, []);

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
    console.log('🔐 Requesting location permission...');
    try {
      const hasPermission = await locationService.requestPermissions();
      console.log('📝 Permission result:', hasPermission);
      setLocationPermission(hasPermission);
      
      if (!hasPermission) {
        toast({
          title: "Permesso di localizzazione richiesto",
          description: "Per favore abilita i servizi di localizzazione per trovare persone nelle vicinanze.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Permesso concesso",
          description: "Ora puoi attivare la visibilità per trovare persone nelle vicinanze.",
        });
      }
      
      return hasPermission;
    } catch (error) {
      console.error('💥 Error requesting location permission:', error);
      setLocationPermission(false);
      toast({
        title: "Errore permessi",
        description: "Impossibile richiedere i permessi di localizzazione. Controlla le impostazioni del dispositivo.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const scanForNearbyUsers = useCallback(async (location?: LocationData) => {
    if (!user) return;

    const scanLocation = location || currentLocation;
    if (!scanLocation) return;

    try {
      console.log('🔍 Scanning for nearby users at:', scanLocation);
      const users = await locationService.findNearbyUsers(user.id, scanLocation, 100);
      console.log('👥 Found nearby users:', users.length);
      setNearbyUsers(users);
    } catch (error) {
      console.error('💥 Error scanning for nearby users:', error);
    }
  }, [user, currentLocation]);

  const startScanning = useCallback(async () => {
    if (!user || isScanning || isStarting) {
      console.log('⏸️ Cannot start scanning:', { user: !!user, isScanning, isStarting });
      return false;
    }

    console.log('🚀 Starting proximity scanning...');
    setIsStarting(true);

    // Set a timeout to reset isStarting if the process takes too long
    startingTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Starting timeout - resetting isStarting');
      setIsStarting(false);
    }, 15000); // 15 second timeout for iOS
    
    try {
      // Check current permission status first
      const currentPermissionStatus = await locationService.checkLocationPermission();
      console.log('📋 Current permission status:', currentPermissionStatus);
      
      let hasPermission = currentPermissionStatus === 'granted';
      
      // If permission is not granted, request it
      if (!hasPermission) {
        console.log('🔐 Permission not granted, requesting...');
        hasPermission = await requestLocationPermission();
      }
      
      if (!hasPermission) {
        console.log('❌ Permission denied, cannot start scanning');
        if (startingTimeoutRef.current) clearTimeout(startingTimeoutRef.current);
        setIsStarting(false);
        return false;
      }

      console.log('✅ Permission granted, getting location...');
      
      // Get current location with retry logic for iOS
      let location: LocationData | null = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!location && attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`📍 Getting location (attempt ${attempts}/${maxAttempts})...`);
          location = await locationService.getCurrentLocation();
          console.log('✅ Location obtained:', location);
        } catch (error: any) {
          console.error(`❌ Location attempt ${attempts} failed:`, error);
          if (attempts === maxAttempts) {
            toast({
              title: "Errore localizzazione",
              description: "Impossibile ottenere la tua posizione. Controlla le impostazioni del GPS.",
              variant: "destructive"
            });
            if (startingTimeoutRef.current) clearTimeout(startingTimeoutRef.current);
            setIsStarting(false);
            return false;
          }
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!location) {
        console.log('❌ Could not get location after all attempts');
        if (startingTimeoutRef.current) clearTimeout(startingTimeoutRef.current);
        setIsStarting(false);
        return false;
      }

      setCurrentLocation(location);
      setIsScanning(true);

      // Start location tracking
      console.log('📡 Starting location tracking...');
      const trackingStarted = await locationService.startLocationTracking(user.id);
      if (!trackingStarted) {
        console.log('❌ Failed to start location tracking');
        setIsScanning(false);
        if (startingTimeoutRef.current) clearTimeout(startingTimeoutRef.current);
        setIsStarting(false);
        return false;
      }

      // Initial scan for nearby users
      await scanForNearbyUsers(location);

      toast({
        title: "Scansione avviata",
        description: "Cerco persone nelle vicinanze. Sarai avvisato quando qualcuno viene trovato.",
      });

      if (startingTimeoutRef.current) clearTimeout(startingTimeoutRef.current);
      setIsStarting(false);
      console.log('🎉 Scanning started successfully');
      return true;
    } catch (error) {
      console.error('💥 Error starting proximity scanning:', error);
      setIsScanning(false);
      if (startingTimeoutRef.current) clearTimeout(startingTimeoutRef.current);
      setIsStarting(false);
      toast({
        title: "Errore",
        description: "Impossibile avviare la scansione di prossimità. Riprova.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, isScanning, isStarting, requestLocationPermission, toast, scanForNearbyUsers]);

  const stopScanning = useCallback(async () => {
    console.log('🛑 Stopping proximity scanning...');
    
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
      title: "Scansione interrotta",
      description: "Non sei più visibile alle persone nelle vicinanze.",
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
      console.log('📡 Creating new Supabase channel subscription');
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
            console.log('📡 Profile change detected, re-scanning...');
            scanForNearbyUsers();
          }
        )
        .subscribe((status) => {
          console.log('📡 Subscription status:', status);
        });
    }

    // Set up periodic scanning if not already running
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        console.log('🔄 Periodic scan triggered');
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
