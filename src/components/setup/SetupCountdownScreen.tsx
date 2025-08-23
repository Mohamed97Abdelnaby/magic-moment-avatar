import { useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Settings, X } from "lucide-react";
import { KioskScreenTextScope } from "@/components/kiosk/KioskThemeWrapper";
import ScreenAppearanceEditor from "@/components/ScreenAppearanceEditor";
import QuoteDisplay from "@/components/QuoteDisplay";
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

interface SetupCountdownScreenProps {
  screenSettings: ScreenAppearance;
  onScreenChange: (changes: Partial<ScreenAppearance>) => void;
  primaryColor: HSLColor;
  secondaryColor?: HSLColor;
  backgroundStyle: 'solid' | 'gradient' | 'default';
}

const SetupCountdownScreen = memo(({
  screenSettings,
  onScreenChange,
  primaryColor,
  secondaryColor,
  backgroundStyle
}: SetupCountdownScreenProps) => {
  const [showCustomization, setShowCustomization] = useState(false);

  const handleScreenUpdate = useCallback((changes: Partial<ScreenAppearance>) => {
    onScreenChange(changes);
  }, [onScreenChange]);

  const countdownQuotes = [
    "Take a deep breath and let your authentic self shine...",
    "In stillness, we find our truest expression...",
    "Every moment of pause is a moment of possibility...",
    "Breathe in confidence, breathe out perfection..."
  ];

  return (
    <div className="text-center relative min-h-screen flex items-center justify-center">
      {screenSettings.backgroundImageDataUrl && (
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: `url(${screenSettings.backgroundImageDataUrl})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }} 
        />
      )}
      {typeof screenSettings.overlayOpacity === 'number' && screenSettings.backgroundImageDataUrl && (
        <div className="absolute inset-0" style={{ background: `hsla(0 0% 0% / ${screenSettings.overlayOpacity})` }} />
      )}
      <ParticleField count={8} />
      
      <div className="absolute inset-0 gradient-subtle opacity-30" />
      
      <KioskScreenTextScope 
        color={screenSettings.textColorHex} 
        backgroundColor={screenSettings.backgroundColor} 
        className="relative z-10 space-y-12"
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

        <div className="space-y-8 animate-fade-in-up">
          <h1 className="text-5xl font-light mb-8">
            {screenSettings.title || 'Take a moment...'}
          </h1>
          
          <QuoteDisplay 
            quotes={countdownQuotes}
            className="mb-12"
            interval={2500}
            textColor={screenSettings.textColorHex}
          />
        </div>
        
        <div className="relative">
          <div 
            className="text-[8rem] font-light transition-all duration-1000 ease-out animate-breathe"
            style={{ opacity: 0.8 }}
          >
            3
          </div>
        </div>
        
        <p 
          className="text-2xl font-light"
          style={{ opacity: 0.7 }}
        >
          When you're ready... 🌸
        </p>
      </KioskScreenTextScope>

      {/* Floating Customization Panel */}
      {showCustomization && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="bg-black/50 backdrop-blur-sm flex-1" onClick={() => setShowCustomization(false)} />
          <div className="w-96 bg-card/95 backdrop-blur border-l border-border p-6 overflow-y-auto animate-slide-in-right">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Customize Countdown Screen</h3>
              <Button
                onClick={() => setShowCustomization(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ScreenAppearanceEditor
              label="countdown"
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

export default SetupCountdownScreen;