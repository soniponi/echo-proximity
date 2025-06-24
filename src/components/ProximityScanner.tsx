
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Satellite, Wifi, AlertCircle } from 'lucide-react';
import { LocationData } from '@/services/locationService';

interface ProximityScannerProps {
  isVisible: boolean;
  nearbyUsers: any[];
  onShowInterest: (userId: string) => void;
  hasLocationPermission?: boolean | null;
  currentLocation?: LocationData | null;
}

const ProximityScanner: React.FC<ProximityScannerProps> = ({ 
  isVisible, 
  nearbyUsers, 
  hasLocationPermission,
  currentLocation 
}) => {
  const getStatusMessage = () => {
    if (!hasLocationPermission) {
      return 'Location permission required to scan';
    }
    if (!isVisible) {
      return 'Scanner inactive - turn on visibility to start';
    }
    if (!currentLocation) {
      return 'Getting your location...';
    }
    return 'Scanning for people nearby using GPS';
  };

  const getAccuracyColor = (accuracy?: number) => {
    if (!accuracy) return 'gray';
    if (accuracy <= 10) return 'green';
    if (accuracy <= 50) return 'yellow';
    return 'orange';
  };

  return (
    <Card className="p-6 mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="text-center">
        <div className="relative mb-4">
          <div className={`w-20 h-20 mx-auto rounded-full border-4 ${
            isVisible && hasLocationPermission ? 'border-green-500' : 'border-gray-300'
          } flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100`}>
            {hasLocationPermission === false ? (
              <AlertCircle className="w-8 h-8 text-red-500" />
            ) : !currentLocation && isVisible ? (
              <MapPin className="w-8 h-8 text-blue-500 animate-pulse" />
            ) : (
              <div className={`w-12 h-12 rounded-full ${
                isVisible && currentLocation ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
            )}
          </div>
          
          {isVisible && hasLocationPermission && currentLocation && (
            <>
              <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-green-400 animate-ping opacity-30" />
              <div className="absolute inset-0 w-24 h-24 mx-auto -mt-2 -ml-2 rounded-full border-2 border-green-300 animate-ping opacity-20 animation-delay-150" />
              <div className="absolute inset-0 w-28 h-28 mx-auto -mt-4 -ml-4 rounded-full border-2 border-green-200 animate-ping opacity-10 animation-delay-300" />
            </>
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          {getStatusMessage()}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          {isVisible && currentLocation
            ? `Looking for others within 100 meters`
            : hasLocationPermission === false
            ? 'Enable location services in your device settings'
            : 'Turn on visibility to start discovering people nearby'
          }
        </p>
        
        {currentLocation && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center mt-2">
              <Badge 
                variant="secondary" 
                className={`bg-${getAccuracyColor(currentLocation.accuracy)}-100 text-${getAccuracyColor(currentLocation.accuracy)}-800`}
              >
                ±{Math.round(currentLocation.accuracy)}m accuracy
              </Badge>
            </div>
          </div>
        )}
        
        {isVisible && hasLocationPermission && (
          <div className="flex justify-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Satellite className="w-3 h-3 mr-1" />
              GPS Active
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Wifi className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProximityScanner;
