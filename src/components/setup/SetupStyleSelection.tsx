import { useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, ArrowRight, Heart, Home, Settings, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

interface SetupStyleSelectionProps {
  screenSettings: ScreenAppearance;
  onScreenChange: (changes: Partial<ScreenAppearance>) => void;
  primaryColor: HSLColor;
  secondaryColor?: HSLColor;
  backgroundStyle: 'solid' | 'gradient' | 'default';
  avatarStyles: Array<{
    id: string;
    name: string;
    preview: string;
    description: string;
  }>;
  selectedStyles: string[];
  onStyleToggle: (styleId: string) => void;
}

const SetupStyleSelection = memo(({
  screenSettings,
  onScreenChange,
  primaryColor,
  secondaryColor,
  backgroundStyle,
  avatarStyles,
  selectedStyles,
  onStyleToggle
}: SetupStyleSelectionProps) => {
  const navigate = useNavigate();
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
        <div
          className="absolute inset-0"
          style={{ background: `hsla(0 0% 0% / ${screenSettings.overlayOpacity})` }}
        />
      )}

      <KioskScreenTextScope 
        color={screenSettings.textColorHex} 
        backgroundColor={screenSettings.backgroundColor} 
        className="relative z-10 text-center"
      >
        {/* Header Controls */}
        <div className="fixed top-4 left-4 right-4 z-50 flex justify-between">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300"
          >
            <Home className="h-4 w-4" />
            Back to Home
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

        <ParticleField count={15} />
        
        <div className="animate-fade-in-up pt-24">
          <h1 className="text-7xl font-bold mb-6 animate-scale-in">
            {screenSettings.title || 'Choose your Avatar'}
          </h1>
          <p className="text-3xl mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Select how you want your avatar to look
          </p>
        </div>
          
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {avatarStyles.map((style, index) => (
            <div
              key={style.id}
              className="animate-bounce-in card-3d"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <button
                onClick={() => onStyleToggle(style.id)}
                className={`w-full p-8 rounded-3xl border-4 transition-all duration-500 transform-3d magnetic relative overflow-hidden ${
                  selectedStyles.includes(style.id)
                    ? 'border-primary shadow-glow bg-primary/10 scale-105 neon-glow'
                    : 'border-border hover:border-primary/50 hover:shadow-3d glass'
                }`}
              >
                <div className="relative z-10">
                  <div className="text-8xl mb-6 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                    {style.preview}
                  </div>
                  <h3 className="text-3xl font-bold mb-2">{style.name}</h3>
                  <p className="text-lg opacity-70">{style.description}</p>
                </div>
                
                {selectedStyles.includes(style.id) && (
                  <div className="absolute inset-0 gradient-glow animate-pulse-glow" />
                )}
              </button>
            </div>
          ))}
        </div>
        
        {selectedStyles.length > 0 && (
          <div className="animate-scale-in mb-8">
            <Button 
              variant="ghost"
              size="lg" 
              className="text-3xl px-20 py-10 rounded-2xl backdrop-blur-md bg-white/15 hover:bg-white/25 border-2 border-white/30 hover:border-white/50 shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105"
            >
              <Camera className="h-10 w-10 mr-6" />
              Begin Your Journey
              <ArrowRight className="h-10 w-10 ml-6" />
              <Heart className="h-8 w-8 ml-4 animate-pulse-soft" />
            </Button>
          </div>
        )}
      </KioskScreenTextScope>

      {/* Floating Customization Panel */}
      {showCustomization && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="bg-black/50 backdrop-blur-sm flex-1" onClick={() => setShowCustomization(false)} />
          <div className="w-96 bg-card/95 backdrop-blur border-l border-border p-6 overflow-y-auto animate-slide-in-right">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Customize Style Selection</h3>
              <Button
                onClick={() => setShowCustomization(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ScreenAppearanceEditor
              label="styles"
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

export default SetupStyleSelection;