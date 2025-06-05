
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState({
    proximityRange: [30],
    autoHide: true,
    notifications: true,
    bluetoothMode: 'auto',
    privacyMode: false
  });
  const { toast } = useToast();

  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
    toast({
      title: "Setting updated",
      description: "Your preferences have been saved."
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h2 className="text-xl font-semibold mb-6">Privacy & Detection</h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium">Detection Range</label>
              <span className="text-sm text-gray-600">{settings.proximityRange[0]}m</span>
            </div>
            <Slider
              value={settings.proximityRange}
              onValueChange={(value) => updateSetting('proximityRange', value)}
              max={50}
              min={10}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">How close someone needs to be to appear in your nearby list</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Auto-hide after 15 minutes</label>
              <p className="text-xs text-gray-500">Automatically turn off visibility for privacy</p>
            </div>
            <Switch
              checked={settings.autoHide}
              onCheckedChange={(value) => updateSetting('autoHide', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Enhanced Privacy Mode</label>
              <p className="text-xs text-gray-500">Only show your profile to mutual connections</p>
            </div>
            <Switch
              checked={settings.privacyMode}
              onCheckedChange={(value) => updateSetting('privacyMode', value)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h2 className="text-xl font-semibold mb-6">Detection Method</h2>
        
        <div className="space-y-4">
          <div>
            <label className="font-medium mb-3 block">Bluetooth Mode</label>
            <Select value={settings.bluetoothMode} onValueChange={(value) => updateSetting('bluetoothMode', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Recommended)</SelectItem>
                <SelectItem value="low-power">Low Power</SelectItem>
                <SelectItem value="high-accuracy">High Accuracy</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Auto mode balances battery life and detection accuracy
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h2 className="text-xl font-semibold mb-6">Notifications</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Push Notifications</label>
              <p className="text-xs text-gray-500">Get notified of new matches and messages</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(value) => updateSetting('notifications', value)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h2 className="text-xl font-semibold mb-6">Data & Storage</h2>
        
        <div className="space-y-4">
          <Button variant="outline" className="w-full">
            Clear Encounter History
          </Button>
          <Button variant="outline" className="w-full">
            Export My Data
          </Button>
          <Button variant="destructive" className="w-full">
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPanel;
