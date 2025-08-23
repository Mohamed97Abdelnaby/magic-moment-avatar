import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, ArrowRight, Heart, Settings } from "lucide-react";
import { KioskScreenTextScope } from "@/components/kiosk/KioskThemeWrapper";
import ScreenAppearanceEditor from "@/components/ScreenAppearanceEditor";
import { ScreenAppearance } from "@/lib/kioskSettings";
import { HSLColor } from "@/lib/colorUtils";
import { useState } from "react";

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
  eventName?: string;
}

const SetupStyleSelection = ({
  screenSettings,
  onScreenChange,
  primaryColor,
  secondaryColor,
  backgroundStyle,
  eventName
}: SetupStyleSelectionProps) => {
  const [showCustomization, setShowCustomization] = useState(false);
  
  const avatarStyles = [
    { id: "farmer", name: "Egyptian Farmer", description: "Traditional Rural Life", preview: "🌾" },
    { id: "pharaonic", name: "Ancient Pharaoh", description: "Royal Dynasty Style", preview: "👑" },
    { id: "basha", name: "El Basha Style", description: "Elite Noble Fashion", preview: "🎩" },
    { id: "beach", name: "Beach Vibes", description: "Summer Mediterranean", preview: "🏖️" },
    { id: "pixar", name: "Pixar Style", description: "3D Animated Magic", preview: "🎭" },
  ];

  // Mock handlers for demonstration
  const handleStyleSelect = (styleId: string) => {
    console.log('Selected style:', styleId);
  };

  const handleStartCamera = () => {
    console.log('Starting camera');
  };

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
                Style Selection Screen
              </h3>
              <div className="space-y-6">
                <ScreenAppearanceEditor
                  label="styles"
                  value={screenSettings}
                  onChange={onScreenChange}
                  showTitle={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Kiosk Screen Content */}
      <KioskScreenTextScope 
        color={screenSettings.textColorHex} 
        backgroundColor={screenSettings.backgroundColor} 
        className="relative z-10 text-center"
      >
        <ParticleField count={15} />
        
        <div className="animate-fade-in-up pt-32">
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
                onClick={() => handleStyleSelect(style.id)}
                className="w-full p-8 rounded-3xl border-4 transition-all duration-500 transform-3d magnetic relative overflow-hidden border-border hover:border-primary/50 hover:shadow-3d glass"
              >
                <div className="relative z-10">
                  <div className="text-8xl mb-6 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                    {style.preview}
                  </div>
                  <h3 className="text-3xl font-bold mb-2">{style.name}</h3>
                  <p className="text-lg opacity-70">{style.description}</p>
                </div>
              </button>
            </div>
          ))}
        </div>
        
        <div className="animate-scale-in">
          <Button 
            variant="ghost"
            size="lg" 
            onClick={handleStartCamera}
            className="text-3xl px-20 py-10 rounded-2xl backdrop-blur-md bg-white/15 hover:bg-white/25 border-2 border-white/30 hover:border-white/50 shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105"
            style={{ 
              borderColor: screenSettings.textColorHex ? `${screenSettings.textColorHex.replace(')', ' / 0.4)')}` : 'rgba(255,255,255,0.4)',
              backgroundColor: screenSettings.textColorHex ? `${screenSettings.textColorHex.replace(')', ' / 0.1)')}` : 'rgba(255,255,255,0.1)'
            }}
          >
            <Camera className="h-10 w-10 mr-6" />
            Begin Your Journey
            <ArrowRight className="h-10 w-10 ml-6" />
            <Heart className="h-8 w-8 ml-4 animate-pulse-soft" />
          </Button>
        </div>
      </KioskScreenTextScope>
    </div>
  );
};

export default SetupStyleSelection;