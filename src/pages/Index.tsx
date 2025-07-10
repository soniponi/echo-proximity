
import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useProximityScanner } from '@/hooks/useProximityScanner';
import ProximityScanner from '@/components/ProximityScanner';
import UserProfile from '@/components/UserProfile';
import NearbyUsers from '@/components/NearbyUsers';
import ChatInterface from '@/components/ChatInterface';
import SettingsPanel from '@/components/SettingsPanel';
import AppHeader from '@/components/AppHeader';
import StatusCard from '@/components/StatusCard';
import LocationPermissionAlert from '@/components/LocationPermissionAlert';
import MatchesList from '@/components/MatchesList';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const { toast } = useToast();
  const matchesChannelRef = useRef(null);

  // Use the proximity scanner hook
  const {
    isScanning,
    nearbyUsers,
    currentLocation,
    locationPermission,
    startScanning,
    stopScanning,
    requestLocationPermission
  } = useProximityScanner();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load user profile data
  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadMatches();
      subscribeToMatches();
    }

    // Cleanup function
    return () => {
      if (matchesChannelRef.current) {
        supabase.removeChannel(matchesChannelRef.current);
        matchesChannelRef.current = null;
      }
    };
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      setCurrentUser(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadMatches = async () => {
    try {
      // Fixed query: use proper joins instead of foreign key references
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error) {
        console.error('Error loading matches:', error);
        return;
      }

      if (!matchesData || matchesData.length === 0) {
        setMatches([]);
        return;
      }

      // Get profile data for each match
      const transformedMatches = [];
      for (const match of matchesData) {
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, bio, photo')
          .eq('id', otherUserId)
          .single();

        if (!profileError && profileData) {
          transformedMatches.push({
            id: match.id,
            match_id: match.id,
            name: profileData.name || '',
            bio: profileData.bio || '',
            photo: profileData.photo || ''
          });
        }
      }

      setMatches(transformedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const subscribeToMatches = () => {
    // Clean up any existing subscription first
    if (matchesChannelRef.current) {
      supabase.removeChannel(matchesChannelRef.current);
      matchesChannelRef.current = null;
    }

    // Create new channel subscription
    matchesChannelRef.current = supabase
      .channel('matches-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${user.id}`
        },
        () => {
          loadMatches();
          toast({
            title: "New Match! 🎉",
            description: "You have a new match! Go to the Matches section to start chatting."
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user2_id=eq.${user.id}`
        },
        () => {
          loadMatches();
          toast({
            title: "New Match! 🎉",
            description: "You have a new match! Go to the Matches section to start chatting."
          });
        }
      )
      .subscribe();
  };

  // Update visibility and start/stop scanning
  const updateVisibility = async (visible: boolean) => {
    if (!user) return;

    try {
      const visibilityExpiresAt = visible 
        ? new Date(Date.now() + 15 * 60 * 1000).toISOString() 
        : null;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_visible: visible,
          visibility_expires_at: visibilityExpiresAt
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating visibility:', error);
        toast({
          title: "Error",
          description: "Failed to update visibility setting.",
          variant: "destructive"
        });
        return;
      }

      setCurrentUser(prev => prev ? { ...prev, is_visible: visible } : null);
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  const handleVisibilityToggle = async (checked: boolean) => {
    if (checked) {
      // Start GPS scanning
      const scanningStarted = await startScanning();
      if (scanningStarted) {
        await updateVisibility(true);
        toast({
          title: "You are now visible!",
          description: "Others nearby can now see your profile. GPS scanning active."
        });
      }
    } else {
      // Stop scanning and hide
      await stopScanning();
      await updateVisibility(false);
      toast({
        title: "You are now hidden",
        description: "Your profile is no longer visible to others nearby."
      });
    }
  };

  // Auto-hide after 15 minutes
  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        handleVisibilityToggle(false);
        toast({
          title: "Visibility disabled",
          description: "You have been automatically hidden for privacy. Enable visibility to continue meeting people."
        });
      }, 15 * 60 * 1000); // 15 minutes

      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  const handleInterest = async (userId: string) => {
    console.log('Showing interest in user:', userId);
    
    try {
      const { data, error } = await supabase.rpc('handle_interest', {
        target_user_id: userId
      });

      if (error) {
        console.error('Error handling interest:', error);
        toast({
          title: "Error",
          description: "Could not send interest. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Handle the response properly with type assertion
      const result = data as { type: string; message: string };
      
      if (result.type === 'match') {
        toast({
          title: "It's a match! 🎉",
          description: result.message
        });
        // Reload matches to show the new match
        loadMatches();
      } else {
        toast({
          title: "Interest sent",
          description: result.message
        });
      }
    } catch (error) {
      console.error('Error handling interest:', error);
      toast({
        title: "Error",
        description: "Unexpected error. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await stopScanning(); // Stop scanning on sign out
    await signOut();
    navigate('/auth');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!user || !currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <AppHeader onSignOut={handleSignOut} />

        <StatusCard 
          isScanning={isScanning}
          currentLocation={currentLocation}
          nearbyUsersCount={nearbyUsers.length}
          onVisibilityToggle={handleVisibilityToggle}
        />

        {locationPermission === false && (
          <LocationPermissionAlert onRequestPermission={requestLocationPermission} />
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="mt-6">
            <ProximityScanner 
              isVisible={isScanning} 
              nearbyUsers={nearbyUsers}
              onShowInterest={handleInterest}
              hasLocationPermission={locationPermission}
              currentLocation={currentLocation}
            />
            <NearbyUsers 
              users={nearbyUsers} 
              onShowInterest={handleInterest}
            />
          </TabsContent>

          <TabsContent value="matches" className="mt-6">
            <MatchesList 
              matches={matches}
              onStartChat={setActiveChat}
            />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <UserProfile 
              user={currentUser} 
              onUpdateUser={setCurrentUser}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsPanel />
          </TabsContent>
        </Tabs>

        {/* Chat Interface Modal */}
        {activeChat && (
          <ChatInterface 
            user={activeChat}
            onClose={() => setActiveChat(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
