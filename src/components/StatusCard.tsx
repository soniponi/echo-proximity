
import React from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { MapPin, Wifi, Eye, EyeOff } from 'lucide-react';
import { LocationData } from '@/services/locationService';

interface StatusCardProps {
  isScanning: boolean;
  currentLocation: LocationData | null;
  nearbyUsersCount: number;
  onVisibilityToggle: (checked: boolean) => void;
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  isScanning, 
  currentLocation, 
  nearbyUsersCount,
  onVisibilityToggle 
}) => {
  return (
    <Card className="p-4 mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600">Your Status</p>
          <p className="font-semibold text-lg flex items-center gap-2">
            {isScanning ? (
              <>
                <span className="text-green-600">Visible and Scanning</span>
                <MapPin className="w-4 h-4 text-green-600" />
              </>
            ) : (
              <span className="text-gray-500">Hidden</span>
            )}
          </p>
          {currentLocation && isScanning && (
            <p className="text-xs text-gray-500">
              Accuracy: {Math.round(currentLocation.accuracy)}m
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Nearby People</p>
          <p className="font-bold text-2xl text-purple-600 flex items-center gap-1">
            {nearbyUsersCount}
            {isScanning && <Wifi className="w-4 h-4 text-green-500" />}
          </p>
        </div>
      </div>
      
      {/* Visibility toggle row - centered and accessible */}
      <div className="flex items-center justify-center space-x-3 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 shadow-sm">
        {isScanning ? <Eye className="w-5 h-5 text-green-500" /> : <EyeOff className="w-5 h-5 text-gray-400" />}
        <Switch 
          checked={isScanning} 
          onCheckedChange={onVisibilityToggle}
          className="data-[state=checked]:bg-green-500"
        />
        <span className="text-sm font-medium text-gray-700">
          {isScanning ? 'Visible' : 'Hidden'}
        </span>
      </div>
    </Card>
  );
};

export default StatusCard;
