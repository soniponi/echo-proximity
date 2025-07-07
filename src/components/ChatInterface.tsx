
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface ChatInterfaceProps {
  user: {
    id: string;
    name: string;
    photo?: string;
    match_id: string;
  };
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onClose }) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.match_id) {
      loadMessages();
      subscribeToMessages();
    }
  }, [user.match_id]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', user.match_id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Errore",
          description: "Non è stato possibile caricare i messaggi.",
          variant: "destructive"
        });
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages-${user.match_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${user.match_id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentUser) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: user.match_id,
          sender_id: currentUser.id,
          content: message.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Errore",
          description: "Non è stato possibile inviare il messaggio.",
          variant: "destructive"
        });
        return;
      }

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto nell'invio del messaggio.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="text-white">Caricamento chat...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <Card className="w-full h-[80vh] bg-white rounded-t-2xl border-0 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 border-b bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-2xl">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Avatar className="w-8 h-8 mx-3">
            <AvatarImage src={user.photo} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-xs opacity-90">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>Nessun messaggio ancora</p>
              <p className="text-sm">Inizia la conversazione!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                  msg.sender_id === currentUser?.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender_id === currentUser?.id ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {new Date(msg.created_at).toLocaleTimeString('it-IT', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t flex space-x-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Scrivi un messaggio..."
            onKeyPress={handleKeyPress}
            className="flex-1"
            maxLength={500}
          />
          <Button 
            onClick={sendMessage} 
            disabled={!message.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ChatInterface;
