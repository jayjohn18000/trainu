"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getFlags, setFlag, resetFlags, type FeatureFlags } from "@/lib/flags";

export default function DevFlags() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);

  useEffect(() => {
    setFlags(getFlags());
    
    const handleFlagsChanged = () => {
      setFlags(getFlags());
    };
    
    window.addEventListener('flags-changed', handleFlagsChanged);
    return () => window.removeEventListener('flags-changed', handleFlagsChanged);
  }, []);

  const toggleFlag = (key: keyof FeatureFlags) => {
    if (!flags) return;
    setFlag(key, !flags[key]);
    toast.success(`${key} is now ${!flags[key] ? 'enabled' : 'disabled'}`);
  };

  const handleReset = () => {
    resetFlags();
    toast.success("Feature flags reset to defaults");
  };

  if (!flags) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Developer Tools</h1>
          <p className="text-muted-foreground">Feature flags and data management</p>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Feature Flags</h2>
          {Object.entries(flags).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{key.replace(/_/g, ' ')}</p>
                <p className="text-sm text-muted-foreground">
                  {value ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={() => toggleFlag(key as keyof FeatureFlags)}
              />
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-xl font-semibold">Data Management</h2>
          <Button 
            variant="destructive" 
            className="gap-2 w-full" 
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
            Reset All Feature Flags
          </Button>
          <p className="text-sm text-muted-foreground">
            This will reset all feature flags to their default values.
          </p>
        </div>
      </Card>
    </div>
  );
}

