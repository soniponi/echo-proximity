
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Clock } from 'lucide-react';

interface NearbyUser {
  id: string;
  name: string;
  bio: string;
  photo: string;
  interests: string[];
  distance_meters: number;
  last_seen: string;
}

interface NearbyUsersProps {
  users: NearbyUser[];
  onShowInterest: (userId: string) => void;
}

const NearbyUsers: React.FC<NearbyUsersProps> = ({ users, onShowInterest }) => {
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  };

  const formatLastSeen = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  if (users.length === 0) {
    return (
      <Card className="p-8 text-center bg-white/80 backdrop-blur-sm">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No one nearby right now</p>
        <p className="text-sm text-gray-500 mt-2">
          Try moving to a busier area or check back in a few minutes!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">People Nearby</h2>
      {users.map((user) => (
        <Card key={user.id} className="p-4 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.photo} />
              <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant="outline" className="text-xs flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{formatDistance(user.distance_meters)}</span>
                  </Badge>
                  <Badge variant="secondary" className="text-xs flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatLastSeen(user.last_seen)}</span>
                  </Badge>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{user.bio}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {user.interests?.map((interest: string) => (
                  <Badge key={interest} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
              
              <Button 
                onClick={() => onShowInterest(user.id)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Show Interest
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default NearbyUsers;
