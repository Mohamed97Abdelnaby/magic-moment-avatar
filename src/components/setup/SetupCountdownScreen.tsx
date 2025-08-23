import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KioskScreenTextScope } from "@/components/kiosk/KioskThemeWrapper";
import ScreenAppearanceEditor from "@/components/ScreenAppearanceEditor";
import QuoteDisplay from "@/components/QuoteDisplay";
import { ScreenAppearance } from "@/lib/kioskSettings";
import { HSLColor } from "@/lib/colorUtils";
import { useState } from "react";

const ParticleField = ({ count = 8 }: { count?: number }) => {
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

const countdownQuotes = [
  "Great photos start with great poses!",
  "Confidence is your best accessory.",
  "Ready to create magic?",
  "Your avatar journey begins now!",
  "Strike a pose that tells your story!"
];

interface SetupCountdownScreenProps {
  screenSettings: ScreenAppearance;
  onScreenChange: (changes: Partial<ScreenAppearance>) => void;
  primaryColor: HSLColor;
  secondaryColor?: HSLColor;
  backgroundStyle: 'solid' | 'gradient' | 'default';
  eventName?: string;
}

const SetupCountdownScreen = ({
  screenSettings,
  onScreenChange,
  primaryColor,
  secondaryColor,
  backgroundStyle,
  eventName
}: SetupCountdownScreenProps) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const mockCountdown = 3; // Fixed countdown for preview

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
                Countdown Screen
              </h3>
              <div className="space-y-6">
                <ScreenAppearanceEditor
                  label="countdown"
                  value={screenSettings}
                  onChange={onScreenChange}
                  showTitle={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ParticleField count={8} />
      
      {/* Main Kiosk Screen Content */}
      <KioskScreenTextScope 
        color={screenSettings.textColorHex} 
        backgroundColor={screenSettings.backgroundColor} 
        className="relative z-10"
      >
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
          {/* Title */}
          <div className="mb-12 animate-fade-in-up">
            <h1 className="text-6xl font-bold mb-6 animate-breathe">
              {screenSettings.title || 'Get Ready!'}
            </h1>
          </div>

          {/* Quote Display */}
          <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <QuoteDisplay quotes={countdownQuotes} />
          </div>

          {/* Countdown Circle */}
          <div className="relative mb-16 animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <div className="w-80 h-80 rounded-full border-8 border-white/20 flex items-center justify-center relative backdrop-blur-sm bg-white/5">
              {/* Animated progress ring */}
              <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-white/60 animate-spin-slow"></div>
              
              {/* Countdown number */}
              <div className="text-9xl font-bold animate-breathe">
                {mockCountdown}
              </div>

              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-full border-4 border-white/10 animate-pulse-ring"></div>
              <div className="absolute inset-4 rounded-full border-2 border-white/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>

          {/* Ready message */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <p className="text-4xl opacity-80 animate-breathe">
              When you're ready...
            </p>
          </div>
        </div>
      </KioskScreenTextScope>
    </div>
  );
};

export default SetupCountdownScreen;