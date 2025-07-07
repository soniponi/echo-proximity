
import React, { useState, useEffect } from 'react';
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
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          user1_profile:profiles!matches_user1_id_fkey(id, name, bio, photo),
          user2_profile:profiles!matches_user2_id_fkey(id, name, bio, photo)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error) {
        console.error('Error loading matches:', error);
        return;
      }

      // Transform matches to show the other user's profile
      const transformedMatches = data?.map(match => {
        const otherUser = match.user1_id === user.id ? match.user2_profile : match.user1_profile;
        return {
          id: match.id,
          match_id: match.id,
          name: otherUser?.name || '',
          bio: otherUser?.bio || '',
          photo: otherUser?.photo || ''
        };
      }) || [];

      setMatches(transformedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const subscribeToMatches = () => {
    const channel = supabase
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
            title: "Nuovo Match! 🎉",
            description: "Hai un nuovo match! Vai alla sezione Match per iniziare a chattare."
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
            title: "Nuovo Match! 🎉",
            description: "Hai un nuovo match! Vai alla sezione Match per iniziare a chattare."
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
          title: "Sei ora visibile!",
          description: "Gli altri nelle vicinanze possono ora vedere il tuo profilo. Scansione GPS attiva."
        });
      }
    } else {
      // Stop scanning and hide
      await stopScanning();
      await updateVisibility(false);
      toast({
        title: "Sei ora nascosto",
        description: "Il tuo profilo non è più visibile agli altri nelle vicinanze."
      });
    }
  };

  // Auto-hide after 15 minutes
  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        handleVisibilityToggle(false);
        toast({
          title: "Visibilità disattivata",
          description: "Sei stato automaticamente nascosto per privacy. Attiva la visibilità per continuare a conoscere persone."
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
          title: "Errore",
          description: "Non è stato possibile inviare l'interesse. Riprova.",
          variant: "destructive"
        });
        return;
      }

      // Handle the response properly with type assertion
      const result = data as { type: string; message: string };
      
      if (result.type === 'match') {
        toast({
          title: "È un match! 🎉",
          description: result.message
        });
        // Reload matches to show the new match
        loadMatches();
      } else {
        toast({
          title: "Interesse inviato",
          description: result.message
        });
      }
    } catch (error) {
      console.error('Error handling interest:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto. Riprova.",
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
          <p className="text-gray-600">Caricamento...</p>
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
        <AppHeader 
          isScanning={isScanning}
          onVisibilityToggle={handleVisibilityToggle}
          onSignOut={handleSignOut}
        />

        <StatusCard 
          isScanning={isScanning}
          currentLocation={currentLocation}
          nearbyUsersCount={nearbyUsers.length}
        />

        {locationPermission === false && (
          <LocationPermissionAlert onRequestPermission={requestLocationPermission} />
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="discover">Scopri</TabsTrigger>
            <TabsTrigger value="matches">Match</TabsTrigger>
            <TabsTrigger value="profile">Profilo</TabsTrigger>
            <TabsTrigger value="settings">Impostazioni</TabsTrigger>
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
