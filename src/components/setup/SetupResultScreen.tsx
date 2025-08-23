import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, RotateCcw, Send, Printer, Download } from "lucide-react";
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

const ConfettiExplosion = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-confetti-fall bg-primary"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
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
  eventName?: string;
}

const SetupResultScreen = ({
  screenSettings,
  onScreenChange,
  primaryColor,
  secondaryColor,
  backgroundStyle,
  eventName
}: SetupResultScreenProps) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const [showConfetti] = useState(true); // Always show confetti for demo

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

      {/* Confetti */}
      {showConfetti && <ConfettiExplosion />}

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
                Result Screen
              </h3>
              <div className="space-y-6">
                <ScreenAppearanceEditor
                  label="result"
                  value={screenSettings}
                  onChange={onScreenChange}
                  showTitle={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ParticleField count={12} />
      
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
              {screenSettings.title || 'Your Avatar is Ready!'}
            </h1>
            <p className="text-3xl opacity-80">
              Look amazing! Share your transformation
            </p>
          </div>

          {/* Avatar Preview */}
          <div className="mb-16 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <Card className="overflow-hidden shadow-neon bg-white/10 backdrop-blur border-2 border-white/20">
              <CardContent className="p-0">
                <div className="w-96 h-96 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
                  {/* Mock avatar placeholder */}
                  <div className="text-9xl animate-float">🎭</div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine"></div>
                  
                  {/* Glow border */}
                  <div className="absolute inset-0 border-4 border-white/30 animate-pulse-glow"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button
              variant="ghost"
              size="lg"
              className="text-xl px-8 py-6 rounded-2xl backdrop-blur-md bg-white/15 hover:bg-white/25 border-2 border-white/30 hover:border-white/50 transition-all duration-500"
              style={{ 
                borderColor: screenSettings.textColorHex ? `${screenSettings.textColorHex.replace(')', ' / 0.4)')}` : 'rgba(255,255,255,0.4)',
              }}
            >
              <RotateCcw className="h-6 w-6 mr-3" />
              Try Again
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="text-xl px-8 py-6 rounded-2xl backdrop-blur-md bg-white/15 hover:bg-white/25 border-2 border-white/30 hover:border-white/50 transition-all duration-500"
              style={{ 
                borderColor: screenSettings.textColorHex ? `${screenSettings.textColorHex.replace(')', ' / 0.4)')}` : 'rgba(255,255,255,0.4)',
              }}
            >
              <Send className="h-6 w-6 mr-3" />
              Send via WhatsApp
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="text-xl px-8 py-6 rounded-2xl backdrop-blur-md bg-white/15 hover:bg-white/25 border-2 border-white/30 hover:border-white/50 transition-all duration-500"
              style={{ 
                borderColor: screenSettings.textColorHex ? `${screenSettings.textColorHex.replace(')', ' / 0.4)')}` : 'rgba(255,255,255,0.4)',
              }}
            >
              <Printer className="h-6 w-6 mr-3" />
              Print Photo
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="text-xl px-8 py-6 rounded-2xl backdrop-blur-md bg-white/15 hover:bg-white/25 border-2 border-white/30 hover:border-white/50 transition-all duration-500"
              style={{ 
                borderColor: screenSettings.textColorHex ? `${screenSettings.textColorHex.replace(')', ' / 0.4)')}` : 'rgba(255,255,255,0.4)',
              }}
            >
              <Download className="h-6 w-6 mr-3" />
              Download
            </Button>
          </div>

          {/* Success Message */}
          <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <p className="text-2xl opacity-80">
              Share your amazing transformation with the world! ✨
            </p>
          </div>
        </div>
      </KioskScreenTextScope>
    </div>
  );
};

export default SetupResultScreen;