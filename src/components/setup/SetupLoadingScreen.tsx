import { useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Settings, X } from "lucide-react";
import { KioskScreenTextScope } from "@/components/kiosk/KioskThemeWrapper";
import ScreenAppearanceEditor from "@/components/ScreenAppearanceEditor";
import QuoteDisplay from "@/components/QuoteDisplay";
import AIRobotDrawing from "@/components/AIRobotDrawing";
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

interface SetupLoadingScreenProps {
  screenSettings: ScreenAppearance;
  onScreenChange: (changes: Partial<ScreenAppearance>) => void;
  primaryColor: HSLColor;
  secondaryColor?: HSLColor;
  backgroundStyle: 'solid' | 'gradient' | 'default';
}

const SetupLoadingScreen = memo(({
  screenSettings,
  onScreenChange,
  primaryColor,
  secondaryColor,
  backgroundStyle
}: SetupLoadingScreenProps) => {
  const [showCustomization, setShowCustomization] = useState(false);

  const handleScreenUpdate = useCallback((changes: Partial<ScreenAppearance>) => {
    onScreenChange(changes);
  }, [onScreenChange]);

  const loadingQuotes = [
    "Your masterpiece is taking shape...",
    "Bringing your vision to life...", 
    "Creating something truly unique...",
    "Almost there, magic in progress..."
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
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

      <ParticleField count={12} />
      
      <KioskScreenTextScope 
        color={screenSettings.textColorHex} 
        backgroundColor={screenSettings.backgroundColor} 
        className="relative z-10 text-center"
      >
        {/* Header Controls */}
        <div className="fixed top-4 right-4 z-50">
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

        <div className="space-y-12">
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-5xl font-light">
              {screenSettings.title || 'Crafting your vision...'}
            </h1>
            
            <QuoteDisplay 
              quotes={loadingQuotes}
              className="mb-8"
              interval={3000}
              textColor={screenSettings.textColorHex}
            />
          </div>

          <div className="flex justify-center">
            <AIRobotDrawing selectedStyle="demo" />
          </div>

          <div className="text-2xl font-light animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <div className="flex items-center justify-center gap-3">
              <span>AI is working its magic</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </KioskScreenTextScope>

      {/* Floating Customization Panel */}
      {showCustomization && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="bg-black/50 backdrop-blur-sm flex-1" onClick={() => setShowCustomization(false)} />
          <div className="w-96 bg-card/95 backdrop-blur border-l border-border p-6 overflow-y-auto animate-slide-in-right">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Customize Loading Screen</h3>
              <Button
                onClick={() => setShowCustomization(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ScreenAppearanceEditor
              label="loading"
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

export default SetupLoadingScreen;