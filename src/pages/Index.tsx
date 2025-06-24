
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, MessageCircle, User, LogOut, MapPin, Wifi } from 'lucide-react';
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

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const { toast } = useToast();

  // Use the new proximity scanner hook
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
          title: "You're now visible!",
          description: "Others nearby can now see your profile. GPS scanning is active."
        });
      }
    } else {
      // Stop scanning and hide
      await stopScanning();
      await updateVisibility(false);
      toast({
        title: "You're now hidden",
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
          title: "Visibility turned off",
          description: "You've been automatically hidden for privacy. Turn on visibility to continue meeting people."
        });
      }, 15 * 60 * 1000); // 15 minutes

      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  const handleInterest = (userId: string) => {
    console.log('Showing interest in user:', userId);
    const user = nearbyUsers.find(u => u.id === userId);
    if (user) {
      // Simulate mutual interest (for demo)
      const isMutual = Math.random() > 0.5;
      if (isMutual) {
        setMatches(prev => [...prev, user]);
        toast({
          title: "It's a match! 🎉",
          description: `You and ${user.name} are both interested! Start chatting now.`
        });
      } else {
        toast({
          title: "Interest sent",
          description: `${user.name} will be notified if they're also interested in you.`
        });
      }
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              NearBy
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {isScanning ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
            <Switch 
              checked={isScanning} 
              onCheckedChange={handleVisibilityToggle}
              className="data-[state=checked]:bg-green-500"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSignOut}
              className="ml-2"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card className="p-4 mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Your status</p>
              <p className="font-semibold text-lg flex items-center gap-2">
                {isScanning ? (
                  <>
                    <span className="text-green-600">Visible & Scanning</span>
                    <MapPin className="w-4 h-4 text-green-600" />
                  </>
                ) : (
                  <span className="text-gray-500">Hidden</span>
                )}
              </p>
              {currentLocation && isScanning && (
                <p className="text-xs text-gray-500">
                  Accuracy: {Math.round(currentLocation.accuracy)}m
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Nearby people</p>
              <p className="font-bold text-2xl text-purple-600 flex items-center gap-1">
                {nearbyUsers.length}
                {isScanning && <Wifi className="w-4 h-4 text-green-500" />}
              </p>
            </div>
          </div>
        </Card>

        {/* Location Permission Alert */}
        {locationPermission === false && (
          <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">Location Permission Required</p>
                <p className="text-xs text-yellow-700">Enable location services to find people nearby</p>
              </div>
              <Button 
                size="sm" 
                onClick={requestLocationPermission}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Enable
              </Button>
            </div>
          </Card>
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
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Matches</h2>
              {matches.length === 0 ? (
                <Card className="p-8 text-center bg-white/80 backdrop-blur-sm">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No matches yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Turn on visibility and show interest in people nearby to start matching!
                  </p>
                </Card>
              ) : (
                matches.map((match) => (
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
                        onClick={() => setActiveChat(match)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Chat
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
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
