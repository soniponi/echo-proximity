
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface LocationPermissionAlertProps {
  onRequestPermission: () => void;
}

const LocationPermissionAlert: React.FC<LocationPermissionAlertProps> = ({ 
  onRequestPermission 
}) => {
  return (
    <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
      <div className="flex items-center space-x-3">
        <MapPin className="w-5 h-5 text-yellow-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800">Location Permission Required</p>
          <p className="text-xs text-yellow-700">Enable location services to find nearby people</p>
        </div>
        <Button 
          size="sm" 
          onClick={onRequestPermission}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          Enable
        </Button>
      </div>
    </Card>
  );
};

export default LocationPermissionAlert;
