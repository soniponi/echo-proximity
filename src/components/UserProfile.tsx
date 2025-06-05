
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfileProps {
  user: any;
  onUpdateUser: (user: any) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser }) => {
  const { user: authUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [newInterest, setNewInterest] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!authUser) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editedUser.name,
          bio: editedUser.bio,
          interests: editedUser.interests,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive"
        });
        return;
      }

      onUpdateUser(editedUser);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !editedUser.interests.includes(newInterest.trim())) {
      setEditedUser({
        ...editedUser,
        interests: [...editedUser.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setEditedUser({
      ...editedUser,
      interests: editedUser.interests.filter((i: string) => i !== interest)
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="text-center mb-6">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage src={editedUser.photo} />
            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-2xl">
              {editedUser.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          {isEditing ? (
            <div className="space-y-4">
              <Input
                value={editedUser.name}
                onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                placeholder="Your name"
                className="text-center text-xl font-semibold"
              />
              <Textarea
                value={editedUser.bio}
                onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                placeholder="Tell others about yourself..."
                className="text-center"
              />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
              <p className="text-gray-600">{user.bio}</p>
            </>
          )}
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {editedUser.interests?.map((interest: string) => (
              <Badge 
                key={interest} 
                variant="secondary" 
                className={`${isEditing ? 'cursor-pointer hover:bg-red-100' : ''}`}
                onClick={() => isEditing && removeInterest(interest)}
              >
                {interest} {isEditing && '×'}
              </Badge>
            ))}
          </div>
          
          {isEditing && (
            <div className="flex space-x-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest"
                onKeyPress={(e) => e.key === 'Enter' && addInterest()}
              />
              <Button onClick={addInterest} variant="outline">Add</Button>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <Button 
                onClick={handleSave} 
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                onClick={() => {
                  setIsEditing(false);
                  setEditedUser(user);
                }} 
                variant="outline" 
                className="flex-1"
                disabled={saving}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)} 
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;
