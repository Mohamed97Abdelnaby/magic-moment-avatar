import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KioskScreenTextScope } from "@/components/kiosk/KioskThemeWrapper";
import ScreenAppearanceEditor from "@/components/ScreenAppearanceEditor";
import QuoteDisplay from "@/components/QuoteDisplay";
import AIRobotDrawing from "@/components/AIRobotDrawing";
import { ScreenAppearance } from "@/lib/kioskSettings";
import { HSLColor } from "@/lib/colorUtils";
import { useState } from "react";

const ParticleField = ({ count = 15 }: { count?: number }) => {
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

const loadingQuotes = [
  "Creating your digital twin...",
  "Adding Egyptian magic...",
  "Channeling ancient artistry...",
  "Weaving pixels into perfection...",
  "Your avatar is taking shape!"
];

interface SetupLoadingScreenProps {
  screenSettings: ScreenAppearance;
  onScreenChange: (changes: Partial<ScreenAppearance>) => void;
  primaryColor: HSLColor;
  secondaryColor?: HSLColor;
  backgroundStyle: 'solid' | 'gradient' | 'default';
  eventName?: string;
}

const SetupLoadingScreen = ({
  screenSettings,
  onScreenChange,
  primaryColor,
  secondaryColor,
  backgroundStyle,
  eventName
}: SetupLoadingScreenProps) => {
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
                Loading Screen
              </h3>
              <div className="space-y-6">
                <ScreenAppearanceEditor
                  label="loading"
                  value={screenSettings}
                  onChange={onScreenChange}
                  showTitle={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ParticleField count={15} />
      
      {/* Main Kiosk Screen Content */}
      <KioskScreenTextScope 
        color={screenSettings.textColorHex} 
        backgroundColor={screenSettings.backgroundColor} 
        className="relative z-10"
      >
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
          {/* Title */}
          <div className="mb-12 animate-fade-in-up">
            <h1 className="text-7xl font-bold mb-6 animate-breathe">
              {screenSettings.title || 'Creating Magic...'}
            </h1>
          </div>

          {/* AI Robot Drawing */}
          <div className="mb-12 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <AIRobotDrawing selectedStyle="pixar" />
          </div>

          {/* Quote Display */}
          <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <QuoteDisplay quotes={loadingQuotes} />
          </div>

          {/* Loading Progress */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="w-96 h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div className="h-full bg-gradient-to-r from-primary to-secondary animate-loading-bar rounded-full"></div>
            </div>
            <p className="text-2xl mt-8 opacity-80 animate-pulse">
              Please wait while we generate your avatar...
            </p>
          </div>

          {/* Status Messages */}
          <div className="mt-12 space-y-4 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center justify-center gap-4 text-lg opacity-70">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span>Analyzing your photo...</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-lg opacity-70">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <span>Applying artistic style...</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-lg opacity-70">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <span>Adding final touches...</span>
            </div>
          </div>
        </div>
      </KioskScreenTextScope>
    </div>
  );
};

export default SetupLoadingScreen;