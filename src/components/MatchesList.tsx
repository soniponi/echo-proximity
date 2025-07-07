
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle } from 'lucide-react';

interface Match {
  id: string;
  match_id: string;
  name: string;
  bio: string;
  photo: string;
}

interface MatchesListProps {
  matches: Match[];
  onStartChat: (match: Match) => void;
}

const MatchesList: React.FC<MatchesListProps> = ({ matches, onStartChat }) => {
  if (matches.length === 0) {
    return (
      <Card className="p-8 text-center bg-white/80 backdrop-blur-sm">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nessun match ancora</p>
        <p className="text-sm text-gray-500 mt-2">
          Attiva la visibilità e mostra interesse alle persone vicine per iniziare a fare match!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">I tuoi Match</h2>
      {matches.map((match) => (
        <Card key={match.id} className="p-4 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={match.photo} />
                <AvatarFallback>{match.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{match.name}</p>
                <p className="text-sm text-gray-600">{match.bio}</p>
              </div>
            </div>
            <Button 
              size="sm"
              onClick={() => onStartChat(match)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Chat
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MatchesList;
