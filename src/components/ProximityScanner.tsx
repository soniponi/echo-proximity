
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProximityScannerProps {
  isVisible: boolean;
  nearbyUsers: any[];
  onShowInterest: (userId: string) => void;
}

const ProximityScanner: React.FC<ProximityScannerProps> = ({ isVisible, nearbyUsers }) => {
  return (
    <Card className="p-6 mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="text-center">
        <div className="relative mb-4">
          <div className={`w-20 h-20 mx-auto rounded-full border-4 ${
            isVisible ? 'border-green-500' : 'border-gray-300'
          } flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100`}>
            <div className={`w-12 h-12 rounded-full ${
              isVisible ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
          </div>
          
          {isVisible && (
            <>
              <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-green-400 animate-ping opacity-30" />
              <div className="absolute inset-0 w-24 h-24 mx-auto -mt-2 -ml-2 rounded-full border-2 border-green-300 animate-ping opacity-20 animation-delay-150" />
              <div className="absolute inset-0 w-28 h-28 mx-auto -mt-4 -ml-4 rounded-full border-2 border-green-200 animate-ping opacity-10 animation-delay-300" />
            </>
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          {isVisible ? 'Scanning for nearby people...' : 'Scanner inactive'}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          {isVisible 
            ? 'Looking for others within 50 meters'
            : 'Turn on visibility to start discovering people nearby'
          }
        </p>
        
        {isVisible && (
          <div className="flex justify-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Bluetooth Active
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              GPS Ready
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProximityScanner;
