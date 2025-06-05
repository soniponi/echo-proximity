
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft } from 'lucide-react';

interface ChatInterfaceProps {
  user: any;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! Nice to meet you 😊",
      sender: user.id,
      timestamp: new Date()
    }
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        text: message,
        sender: 'user_123',
        timestamp: new Date()
      }]);
      setMessage('');
    }
  };

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
            <p className="text-xs opacity-90">Active now</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user_123' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                msg.sender === 'user_123' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t flex space-x-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1"
          />
          <Button onClick={sendMessage} className="bg-gradient-to-r from-purple-500 to-pink-500">
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ChatInterface;
