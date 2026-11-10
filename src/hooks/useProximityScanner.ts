import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { locationService, LocationData, NearbyUser } from '@/services/locationService';
import { useToast } from '@/hooks/use-toast';

export type { NearbyUser };

const SEARCH_RADIUS_METERS = 100;
/** Ogni quanto rinnovare la posizione sul server (il TTL lato server è 2 minuti). */
const HEARTBEAT_MS = 30_000;
/** Spostamento minimo che forza un aggiornamento immediato. */
const MIN_MOVE_METERS = 25;

/** Distanza approssimata in metri tra due coordinate (haversine). */
const distanceMeters = (a: LocationData, b: LocationData): number => {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export const useProximityScanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const latestLocationRef = useRef<LocationData | null>(null);
  const lastPushedRef = useRef<LocationData | null>(null);
  const scanningRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check initial permission status
  useEffect(() => {
    const checkInitialPermission = async () => {
      try {
        const permissionStatus = await locationService.checkLocationPermission();
        setLocationPermission(permissionStatus === 'granted');
      } catch (error) {
        console.error('Error checking initial permission:', error);
        setLocationPermission(false);
      }
    };

    checkInitialPermission();
  }, []);

  const requestLocationPermission = useCallback(async () => {
    try {
      const hasPermission = await locationService.requestPermissions();
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
      console.error('Error requesting location permission:', error);
      setLocationPermission(false);
      toast({
        title: "Errore permessi",
        description: "Impossibile richiedere i permessi di localizzazione. Controlla le impostazioni del dispositivo.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const scanForNearbyUsers = useCallback(async () => {
    if (!user || !scanningRef.current) return;
    try {
      const users = await locationService.findNearbyUsers(SEARCH_RADIUS_METERS);
      if (scanningRef.current) setNearbyUsers(users);
    } catch (error) {
      console.error('Error scanning for nearby users:', error);
    }
  }, [user]);

  /** Invia la posizione più recente al server e aggiorna la lista. */
  const pushLocationAndScan = useCallback(async () => {
    const location = latestLocationRef.current;
    if (!location || !scanningRef.current) return;
    const ok = await locationService.updateMyLocation(location);
    if (ok) lastPushedRef.current = location;
    await scanForNearbyUsers();
  }, [scanForNearbyUsers]);

  const teardown = useCallback(async () => {
    scanningRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    await locationService.stopLocationTracking();
    latestLocationRef.current = null;
    lastPushedRef.current = null;
  }, []);

  const startScanning = useCallback(async () => {
    if (!user || isScanning || isStarting) return false;

    setIsStarting(true);
    try {
      let hasPermission = (await locationService.checkLocationPermission()) === 'granted';
      if (!hasPermission) {
        hasPermission = await requestLocationPermission();
      }
      if (!hasPermission) return false;

      // Get current location with retry logic for iOS
      let location: LocationData | null = null;
      for (let attempt = 1; attempt <= 3 && !location; attempt++) {
        try {
          location = await locationService.getCurrentLocation();
        } catch (error) {
          console.error(`Location attempt ${attempt} failed:`, error);
          if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!location) {
        toast({
          title: "Errore localizzazione",
          description: "Impossibile ottenere la tua posizione. Controlla le impostazioni del GPS.",
          variant: "destructive"
        });
        return false;
      }

      scanningRef.current = true;
      latestLocationRef.current = location;

      if (!(await locationService.updateMyLocation(location))) {
        await teardown();
        toast({
          title: "Errore",
          description: "Impossibile salvare la tua posizione. Riprova.",
          variant: "destructive"
        });
        return false;
      }
      lastPushedRef.current = location;

      setCurrentLocation(location);
      setIsScanning(true);
      await scanForNearbyUsers();

      // Segui gli spostamenti: aggiorna subito il server se ti muovi abbastanza
      locationService.startWatchingPosition(
        (loc) => {
          if (!scanningRef.current) return;
          latestLocationRef.current = loc;
          setCurrentLocation(loc);
          const last = lastPushedRef.current;
          if (!last || distanceMeters(last, loc) >= MIN_MOVE_METERS) {
            void pushLocationAndScan();
          }
        },
        (error) => console.error('Watch position error:', error)
      );

      toast({
        title: "Scansione avviata",
        description: "Cerco persone nelle vicinanze. Sarai avvisato quando qualcuno viene trovato.",
      });
      return true;
    } catch (error) {
      console.error('Error starting proximity scanning:', error);
      await teardown();
      setIsScanning(false);
      toast({
        title: "Errore",
        description: "Impossibile avviare la scansione di prossimità. Riprova.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsStarting(false);
    }
  }, [user, isScanning, isStarting, requestLocationPermission, toast, scanForNearbyUsers, pushLocationAndScan, teardown]);

  const stopScanning = useCallback(async () => {
    const wasScanning = scanningRef.current;
    await teardown();
    if (wasScanning) {
      await locationService.clearMyLocation();
    }
    setIsScanning(false);
    setIsStarting(false);
    setNearbyUsers([]);
    setCurrentLocation(null);

    if (wasScanning) {
      toast({
        title: "Scansione interrotta",
        description: "Non sei più visibile alle persone nelle vicinanze.",
      });
    }
  }, [teardown, toast]);

  // Heartbeat: rinnova la visibilità sul server e aggiorna la lista
  useEffect(() => {
    if (!isScanning || !user) return;

    intervalRef.current = setInterval(() => {
      void pushLocationAndScan();
    }, HEARTBEAT_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isScanning, user, pushLocationAndScan]);

  // Cleanup on unmount (il server farà comunque scadere la posizione entro 2 minuti)
  useEffect(() => {
    return () => {
      if (scanningRef.current) {
        void locationService.clearMyLocation();
      }
      void teardown();
    };
  }, [teardown]);

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
