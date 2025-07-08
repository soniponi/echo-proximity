
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

interface AppHeaderProps {
  onSignOut: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onSignOut }) => {
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
