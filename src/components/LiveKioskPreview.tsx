import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Sparkles, User, ArrowRight } from "lucide-react";
import { HSLColor, hslToHex } from "@/lib/colorUtils";
import { type ScreenSettings } from "@/lib/kioskSettings";

interface LiveKioskPreviewProps {
  primaryColor: HSLColor;
  secondaryColor?: HSLColor;
  backgroundStyle: 'solid' | 'gradient' | 'default';
  screenSettings: ScreenSettings;
  eventName?: string;
}

const LiveKioskPreview = memo(({ 
  primaryColor, 
  secondaryColor, 
  backgroundStyle, 
  screenSettings,
  eventName 
}: LiveKioskPreviewProps) => {
  const primaryHex = hslToHex(primaryColor);
  const secondaryHex = secondaryColor ? hslToHex(secondaryColor) : primaryHex;
  const currentScreen = screenSettings.styles;
  
  // Create CSS variables for preview
  const previewStyle = {
    '--preview-primary': `${primaryColor.h} ${primaryColor.s}% ${primaryColor.l}%`,
    '--preview-primary-hex': primaryHex,
    '--preview-secondary': secondaryColor 
      ? `${secondaryColor.h} ${secondaryColor.s}% ${secondaryColor.l}%`
      : `${primaryColor.h} ${Math.max(5, primaryColor.s - 20)}% ${Math.min(95, primaryColor.l + 25)}%`,
    '--preview-accent': `${primaryColor.h} ${Math.max(5, primaryColor.s - 10)}% ${Math.min(90, primaryColor.l + 20)}%`,
    '--preview-muted': `${primaryColor.h} ${Math.max(5, primaryColor.s - 30)}% ${Math.min(95, primaryColor.l + 30)}%`,
  } as React.CSSProperties;

  const getBackgroundClass = () => {
    if (backgroundStyle === 'gradient' && secondaryColor) {
      return `bg-gradient-to-br from-[hsl(var(--preview-primary))] to-[hsl(var(--preview-secondary))]`;
    }
    if (backgroundStyle === 'solid') {
      return `bg-[hsl(var(--preview-muted))]`;
    }
    return 'bg-background';
  };

  const textColor = currentScreen.textColorHex || `hsl(var(--preview-primary))`;

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader>
        <CardTitle className="text-lg">Live Kiosk Preview</CardTitle>
        <p className="text-sm text-muted-foreground">See exactly how your kiosk will look</p>
      </CardHeader>
      <CardContent>
        <div 
          className={`p-6 rounded-lg border-2 border-border min-h-[400px] relative ${getBackgroundClass()}`}
          style={{
            ...previewStyle,
            ...(currentScreen.backgroundImageDataUrl
              ? {
                  backgroundImage: `${currentScreen.overlayOpacity ? `linear-gradient(hsla(0 0% 0% / ${currentScreen.overlayOpacity}), hsla(0 0% 0% / ${currentScreen.overlayOpacity})), ` : ''}url(${currentScreen.backgroundImageDataUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {}),
          }}
        >
          {/* Kiosk Interface Preview */}
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div 
                  className="p-2 rounded-lg shadow-soft"
                  style={{ backgroundColor: `hsl(var(--preview-primary))` }}
                >
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <span 
                  className="text-xl font-bold"
                  style={{ color: `hsl(var(--preview-primary))` }}
                >
                  AvatarMoment
                </span>
              </div>
              <h1 
                className="text-3xl font-bold mb-2"
                style={{ color: textColor }}
              >
                {eventName ? `Welcome to ${eventName}` : currentScreen.title || 'Choose Your Style'}
              </h1>
              <p 
                className="text-lg opacity-90" 
                style={{ color: textColor }}
              >
                Select an avatar style for your photo
              </p>
            </div>

            {/* Style Options Preview */}
            <div className="grid grid-cols-2 gap-4">
              {['Pixar Style', 'Cyberpunk', 'Cartoon', 'Sketch'].map((style, index) => (
                <button
                  key={style}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    index === 0 
                      ? 'shadow-md transform scale-105' 
                      : 'hover:shadow-sm'
                  }`}
                  style={{
                    borderColor: index === 0 
                      ? `hsl(var(--preview-primary))` 
                      : `hsl(var(--preview-muted))`,
                    backgroundColor: index === 0 
                      ? `hsl(var(--preview-accent))` 
                      : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <div className="text-2xl mb-2">
                    {index === 0 ? '🎭' : index === 1 ? '🤖' : index === 2 ? '🎨' : '✏️'}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{style}</h3>
                  <p className="text-xs opacity-75">
                    {index === 0 ? '3D animated' : index === 1 ? 'Futuristic' : index === 2 ? 'Retro art' : 'Hand-drawn'}
                  </p>
                </button>
              ))}
            </div>

            {/* Buttons Preview */}
            <div className="flex gap-3 justify-center mt-6">
              <button
                className="px-6 py-3 rounded-lg font-medium text-white shadow-soft transition-all hover:shadow-md flex items-center gap-2"
                style={{ backgroundColor: `hsl(var(--preview-primary))` }}
              >
                <Camera className="h-4 w-4" />
                Begin Your Journey
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Status Badge */}
            <div className="text-center mt-4">
              <span
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: `hsl(var(--preview-secondary))` }}
              >
                <Sparkles className="h-4 w-4" />
                Ready to capture your avatar
              </span>
            </div>
          </div>
        </div>

        {/* Color Info */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Theme colors:</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border border-border"
                  style={{ backgroundColor: primaryHex }}
                />
                <span className="font-mono text-xs">{primaryHex}</span>
              </div>
              {secondaryColor && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border border-border"
                    style={{ backgroundColor: secondaryHex }}
                  />
                  <span className="font-mono text-xs">{secondaryHex}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          This shows exactly how your kiosk will appear with current settings
        </p>
      </CardContent>
    </Card>
  );
});

export default LiveKioskPreview;