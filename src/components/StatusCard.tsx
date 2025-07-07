
import React from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Wifi } from 'lucide-react';
import { LocationData } from '@/services/locationService';

interface StatusCardProps {
  isScanning: boolean;
  currentLocation: LocationData | null;
  nearbyUsersCount: number;
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  isScanning, 
  currentLocation, 
  nearbyUsersCount 
}) => {
  return (
    <Card className="p-4 mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Il tuo stato</p>
          <p className="font-semibold text-lg flex items-center gap-2">
            {isScanning ? (
              <>
                <span className="text-green-600">Visibile e Scansionando</span>
                <MapPin className="w-4 h-4 text-green-600" />
              </>
            ) : (
              <span className="text-gray-500">Nascosto</span>
            )}
          </p>
          {currentLocation && isScanning && (
            <p className="text-xs text-gray-500">
              Precisione: {Math.round(currentLocation.accuracy)}m
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Persone vicine</p>
          <p className="font-bold text-2xl text-purple-600 flex items-center gap-1">
            {nearbyUsersCount}
            {isScanning && <Wifi className="w-4 h-4 text-green-500" />}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default StatusCard;
