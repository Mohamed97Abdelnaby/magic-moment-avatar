import { useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, Download, Share2, Settings, X } from "lucide-react";
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

const ConfettiExplosion = ({ count = 15 }: { count?: number }) => {
  return (
    <div className="confetti">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded"
          style={{
            left: `${50 + (Math.random() - 0.5) * 40}%`,
            top: `${20 + Math.random() * 20}%`,
            background: `hsl(${Math.random() * 360}, 70%, 60%)`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
            animation: 'confetti-fall 4s ease-out infinite',
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
};

interface SetupResultScreenProps {
  screenSettings: ScreenAppearance;
  onScreenChange: (changes: Partial<ScreenAppearance>) => void;
  primaryColor: HSLColor;
  secondaryColor?: HSLColor;
  backgroundStyle: 'solid' | 'gradient' | 'default';
}

const SetupResultScreen = memo(({
  screenSettings,
  onScreenChange,
  primaryColor,
  secondaryColor,
  backgroundStyle
}: SetupResultScreenProps) => {
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
      <ConfettiExplosion count={12} />
      
      <KioskScreenTextScope 
        color={screenSettings.textColorHex} 
        backgroundColor={screenSettings.backgroundColor} 
        className="relative z-10"
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

        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="text-center space-y-12 max-w-4xl mx-auto">
            <div className="space-y-6">
              <h1 className="text-6xl font-bold mb-6 animate-fade-in-up">
                {screenSettings.title || 'Your masterpiece! ✨'}
              </h1>
              <p className="text-3xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Your AI avatar is ready
              </p>
            </div>

            {/* Result Card */}
            <div className="max-w-2xl mx-auto">
              <Card className="p-8 shadow-glow glass border-4 border-primary/30 relative overflow-hidden animate-scale-in">
                <div className="absolute inset-0 gradient-glow animate-pulse-glow opacity-40" />
                
                <div className="relative z-10">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl overflow-hidden shadow-3d flex items-center justify-center mb-6">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-primary/40 to-secondary/40 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-5xl">🎨</span>
                      </div>
                      <p className="text-xl opacity-70">AI Generated Avatar</p>
                      <p className="text-sm opacity-50 mt-2">Your masterpiece will appear here</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-6 justify-center">
              <Button 
                variant="outline" 
                size="lg"
                className="text-xl px-8 py-6 rounded-2xl glass hover:shadow-3d transition-all duration-500"
              >
                <RotateCcw className="h-6 w-6 mr-4" />
                Try Again
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="text-xl px-8 py-6 rounded-2xl glass hover:shadow-3d transition-all duration-500"
              >
                <Download className="h-6 w-6 mr-4" />
                Print
              </Button>
              
              <Button 
                size="lg"
                className="text-xl px-12 py-6 rounded-2xl shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105"
              >
                <Share2 className="h-6 w-6 mr-4" />
                Send via WhatsApp
              </Button>
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
              <h3 className="text-lg font-semibold">Customize Result Screen</h3>
              <Button
                onClick={() => setShowCustomization(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ScreenAppearanceEditor
              label="result"
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

export default SetupResultScreen;