
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff, User, LogOut } from 'lucide-react';

interface AppHeaderProps {
  isScanning: boolean;
  onVisibilityToggle: (checked: boolean) => void;
  onSignOut: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  isScanning, 
  onVisibilityToggle, 
  onSignOut 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          NearBy
        </h1>
      </div>
      
      {/* Centered visibility toggle for easier mobile access */}
      <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
        {isScanning ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
        <Switch 
          checked={isScanning} 
          onCheckedChange={onVisibilityToggle}
          className="data-[state=checked]:bg-green-500"
        />
        <span className="text-sm font-medium text-gray-700">
          {isScanning ? 'Visibile' : 'Nascosto'}
        </span>
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={onSignOut}
        className="bg-white/80 backdrop-blur-sm border-white/20"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default AppHeader;
