import { useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Camera, Settings, X } from "lucide-react";
import { KioskScreenTextScope } from "@/components/kiosk/KioskThemeWrapper";
import ScreenAppearanceEditor from "@/components/ScreenAppearanceEditor";
import { HSLColor } from "@/lib/colorUtils";
import { ScreenAppearance } from "@/lib/kioskSettings";

const ParticleField = ({ count = 12 }: { count?: number }) => {
  return (
    <div className="particles">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: 'hsl(var(--gradient-particle))',
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
            animation: 'float 8s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  );
};

interface SetupCameraScreenProps {
  screenSettings: ScreenAppearance;
  onScreenChange: (changes: Partial<ScreenAppearance>) => void;
  primaryColor: HSLColor;
  secondaryColor?: HSLColor;
  backgroundStyle: 'solid' | 'gradient' | 'default';
}

const SetupCameraScreen = memo(({
  screenSettings,
  onScreenChange,
  primaryColor,
  secondaryColor,
  backgroundStyle
}: SetupCameraScreenProps) => {
  const [showCustomization, setShowCustomization] = useState(false);

  const handleScreenUpdate = useCallback((changes: Partial<ScreenAppearance>) => {
    onScreenChange(changes);
  }, [onScreenChange]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {screenSettings.backgroundImageDataUrl && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${screenSettings.backgroundImageDataUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      {typeof screenSettings.overlayOpacity === 'number' && screenSettings.backgroundImageDataUrl && (
        <div className="absolute inset-0" style={{ background: `hsla(0 0% 0% / ${screenSettings.overlayOpacity})` }} />
      )}

      <ParticleField count={10} />
      
      <KioskScreenTextScope 
        color={screenSettings.textColorHex} 
        backgroundColor={screenSettings.backgroundColor} 
        className="relative z-10"
      >
        {/* Header Controls */}
        <div className="fixed top-4 left-4 right-4 z-50 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={() => setShowCustomization(!showCustomization)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300"
          >
            <Settings className="h-4 w-4" />
            Customize
          </Button>
        </div>

        {/* Camera Interface - Demo Version */}
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold mb-4 animate-fade-in-up">
              {screenSettings.title || 'Strike Your Pose!'}
            </h1>
            <p className="text-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Get ready for your close-up
            </p>
          </div>

          {/* Mock Camera View */}
          <div className="relative max-w-3xl mx-auto mb-8">
            <Card className="p-6 shadow-glow glass border-4 border-primary/20 relative overflow-hidden">
              <div className="absolute inset-0 gradient-glow animate-pulse-glow opacity-30" />
              
              <div className="relative z-10">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-3d flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-24 w-24 mx-auto mb-4 opacity-50" />
                    <p className="text-xl opacity-70">Camera Preview</p>
                    <p className="text-sm opacity-50 mt-2">This shows how the camera interface will look</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Camera Controls */}
          <div className="flex gap-6 justify-center">
            <Button 
              variant="outline" 
              size="lg"
              className="text-2xl px-8 py-6 rounded-2xl glass hover:shadow-3d transition-all duration-500"
            >
              <ArrowLeft className="h-6 w-6 mr-4" />
              Back
            </Button>
            
            <Button 
              size="lg"
              className="text-2xl px-12 py-6 rounded-2xl shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105"
            >
              <Camera className="h-8 w-8 mr-4" />
              Capture Photo
            </Button>
          </div>
        </div>
      </KioskScreenTextScope>

      {/* Floating Customization Panel */}
      {showCustomization && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="bg-black/50 backdrop-blur-sm flex-1" onClick={() => setShowCustomization(false)} />
          <div className="w-96 bg-card/95 backdrop-blur border-l border-border p-6 overflow-y-auto animate-slide-in-right">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Customize Camera Screen</h3>
              <Button
                onClick={() => setShowCustomization(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ScreenAppearanceEditor
              label="camera"
              value={screenSettings}
              onChange={handleScreenUpdate}
              showTitle={true}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default SetupCameraScreen;