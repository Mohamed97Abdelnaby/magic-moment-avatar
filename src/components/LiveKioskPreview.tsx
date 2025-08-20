import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KioskInterface from "@/components/KioskInterface";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HSLColor } from "@/lib/colorUtils";
import { type ScreenSettings, type ScreenKey } from "@/lib/kioskSettings";

interface LiveKioskPreviewProps {
  primaryColor: HSLColor;
  secondaryColor?: HSLColor;
  backgroundStyle: 'solid' | 'gradient' | 'default';
  screenSettings: ScreenSettings;
  eventName?: string;
}

const LiveKioskPreview = memo(({ 
  primaryColor, 
  secondaryColor, 
  backgroundStyle, 
  screenSettings,
  eventName 
}: LiveKioskPreviewProps) => {
  // Create enhanced demo settings that incorporate user customizations
  const createDemoSettings = (): ScreenSettings => {
    const baseColors = {
      textColorHsl: `${primaryColor.h} ${primaryColor.s}% ${Math.max(20, primaryColor.l - 40)}%`
    };

    return {
      styles: {
        ...screenSettings.styles,
        title: eventName ? `Welcome to ${eventName}` : screenSettings.styles.title || 'Choose Your Avatar Style',
        ...baseColors
      },
      camera: {
        ...screenSettings.camera,
        title: screenSettings.camera.title || 'Strike Your Perfect Pose!',
        ...baseColors
      },
      countdown: {
        ...screenSettings.countdown,
        title: screenSettings.countdown.title || 'Get Ready... Perfect Shot Coming!',
        ...baseColors
      },
      loading: {
        ...screenSettings.loading,
        title: screenSettings.loading.title || 'AI is Creating Your Avatar...',
        ...baseColors
      },
      result: {
        ...screenSettings.result,
        title: screenSettings.result.title || 'Amazing! Your Avatar is Ready!',
        ...baseColors
      }
    };
  };

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader>
        <CardTitle className="text-lg">Live Kiosk Preview</CardTitle>
        <p className="text-sm text-muted-foreground">Real-time preview of your kiosk interface</p>
      </CardHeader>
      <CardContent>
        {/* Real Kiosk Interface in scaled container */}
        <div className="relative rounded-lg border-2 border-border overflow-hidden bg-muted">
          <div 
            className="transform origin-top-left pointer-events-none"
            style={{
              transform: "scale(0.4)",
              width: "250%",
              height: "250%",
            }}
          >
            <div className="w-full h-screen">
              <KioskInterface 
                isDemo={true} 
                demoSettings={createDemoSettings()}
              />
            </div>
          </div>
          
          {/* Overlay indicator */}
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium z-10">
            Live Preview
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-3 text-center">
          This is the actual kiosk interface with your current settings applied
        </p>
      </CardContent>
    </Card>
  );
});

export default LiveKioskPreview;