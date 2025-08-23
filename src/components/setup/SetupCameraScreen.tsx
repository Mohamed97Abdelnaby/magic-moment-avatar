import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, ArrowLeft, Settings, RefreshCw } from "lucide-react";
import { KioskScreenTextScope } from "@/components/kiosk/KioskThemeWrapper";
import ScreenAppearanceEditor from "@/components/ScreenAppearanceEditor";
import { ScreenAppearance } from "@/lib/kioskSettings";
import { HSLColor } from "@/lib/colorUtils";
import { useState } from "react";

const ParticleField = ({ count = 10 }: { count?: number }) => {
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
  eventName?: string;
}

const SetupCameraScreen = ({
  screenSettings,
  onScreenChange,
  primaryColor,
  secondaryColor,
  backgroundStyle,
  eventName
}: SetupCameraScreenProps) => {
  const [showCustomization, setShowCustomization] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
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
        <div 
          className="absolute inset-0" 
          style={{ background: `hsla(0 0% 0% / ${screenSettings.overlayOpacity})` }} 
        />
      )}

      {/* Customization Toggle */}
      <div className="fixed top-8 right-8 z-50">
        <Button
          onClick={() => setShowCustomization(!showCustomization)}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300"
        >
          <Settings className="h-4 w-4" />
          {showCustomization ? 'Hide' : 'Show'} Customization
        </Button>
      </div>

      {/* Customization Panel */}
      {showCustomization && (
        <div className="fixed top-8 left-8 bottom-8 w-96 z-40">
          <Card className="h-full bg-card/90 backdrop-blur border-border shadow-soft">
            <CardContent className="p-6 h-full overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Camera Screen
              </h3>
              <div className="space-y-6">
                <ScreenAppearanceEditor
                  label="camera"
                  value={screenSettings}
                  onChange={onScreenChange}
                  showTitle={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ParticleField count={10} />
      
      {/* Main Kiosk Screen Content */}
      <KioskScreenTextScope 
        color={screenSettings.textColorHex} 
        backgroundColor={screenSettings.backgroundColor} 
        className="relative z-10"
      >
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-7xl font-bold mb-6 animate-breathe">
              {screenSettings.title || 'Strike Your Pose!'}
            </h1>
            <p className="text-3xl opacity-80 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Get ready for your avatar transformation
            </p>
          </div>

          {/* Mock Camera Interface */}
          <div className="relative animate-scale-in" style={{ animationDelay: '0.4s' }}>
            {/* Camera Viewfinder */}
            <div className="w-96 h-96 rounded-3xl border-4 border-white/30 backdrop-blur-sm bg-white/10 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-4 border-2 border-dashed border-white/40 rounded-2xl"></div>
              <Camera className="h-24 w-24 opacity-60" />
              
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-white/60"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-white/60"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-white/60"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-white/60"></div>
            </div>

            {/* Pulse Ring */}
            <div className="absolute inset-0 rounded-3xl border-4 border-white/20 animate-pulse-ring"></div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-8 mt-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Button
              variant="ghost"
              size="lg"
              className="text-2xl px-12 py-8 rounded-2xl backdrop-blur-md bg-white/15 hover:bg-white/25 border-2 border-white/30 hover:border-white/50 transition-all duration-500"
              style={{ 
                borderColor: screenSettings.textColorHex ? `${screenSettings.textColorHex.replace(')', ' / 0.4)')}` : 'rgba(255,255,255,0.4)',
              }}
            >
              <ArrowLeft className="h-8 w-8 mr-4" />
              Back to Styles
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="text-2xl px-12 py-8 rounded-2xl backdrop-blur-md bg-white/15 hover:bg-white/25 border-2 border-white/30 hover:border-white/50 transition-all duration-500"
              style={{ 
                borderColor: screenSettings.textColorHex ? `${screenSettings.textColorHex.replace(')', ' / 0.4)')}` : 'rgba(255,255,255,0.4)',
              }}
            >
              <RefreshCw className="h-8 w-8 mr-4" />
              Retake Photo
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <p className="text-xl opacity-70">
              Position yourself in the frame and press the capture button
            </p>
          </div>
        </div>
      </KioskScreenTextScope>
    </div>
  );
};

export default SetupCameraScreen;