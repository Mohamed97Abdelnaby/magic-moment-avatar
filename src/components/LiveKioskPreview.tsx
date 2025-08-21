import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Sparkles, User, ArrowRight, Timer, Loader2, Download, Share2 } from "lucide-react";
import { HSLColor, hslToHex } from "@/lib/colorUtils";
import { type ScreenSettings } from "@/lib/kioskSettings";

interface LiveKioskPreviewProps {
  primaryColor: HSLColor;
  secondaryColor?: HSLColor;
  backgroundStyle: 'solid' | 'gradient' | 'default';
  screenSettings: ScreenSettings;
  eventName?: string;
  currentScreenKey?: string;
}

const LiveKioskPreview = memo(({ 
  primaryColor, 
  secondaryColor, 
  backgroundStyle, 
  screenSettings,
  eventName,
  currentScreenKey = 'styles'
}: LiveKioskPreviewProps) => {
  // Get the current screen's appearance settings
  const currentScreenSettings = screenSettings[currentScreenKey] || screenSettings.styles;
  const backgroundImage = currentScreenSettings.backgroundImageDataUrl;
  const backgroundColor = currentScreenSettings.backgroundColor || '#1a1a2e';
  const textColor = currentScreenSettings.textColorHex || '#ffffff';
  const overlayOpacity = currentScreenSettings.overlayOpacity || 0.6;
  
  const primaryHex = hslToHex(primaryColor);
  const secondaryHex = secondaryColor ? hslToHex(secondaryColor) : primaryHex;
  
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

  const getScreenTitle = (screenKey: string) => {
    switch (screenKey) {
      case 'styles': return eventName ? `Welcome to ${eventName}` : 'Choose Your Style';
      case 'camera': return 'Say Cheese!';
      case 'countdown': return 'Get Ready!';
      case 'loading': return 'Creating Magic...';
      case 'result': return 'Your Avatar is Ready!';
      default: return 'Choose Your Style';
    }
  };

  const getScreenSubtitle = (screenKey: string) => {
    switch (screenKey) {
      case 'styles': return 'Select an avatar style for your photo';
      case 'camera': return 'Position yourself in the frame and smile';
      case 'countdown': return 'Photo will be taken in a few seconds';
      case 'loading': return 'AI is generating your personalized avatar';
      case 'result': return 'Share your amazing transformation with friends';
      default: return 'Select an avatar style for your photo';
    }
  };

  const renderScreenContent = (screenKey: string, textColor: string) => {
    switch (screenKey) {
      case 'styles':
        return (
          <>
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
          </>
        );

      case 'camera':
        return (
          <>
            {/* Camera Viewfinder */}
            <div className="mx-auto w-80 h-60 bg-black/20 rounded-lg border-2 border-dashed flex items-center justify-center relative overflow-hidden"
              style={{ borderColor: `hsl(var(--preview-primary))` }}>
              <div className="text-center">
                <User className="h-16 w-16 mx-auto mb-2 opacity-50" style={{ color: textColor }} />
                <p className="text-sm opacity-75" style={{ color: textColor }}>Camera Preview</p>
              </div>
              {/* Corner markers */}
              <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2" style={{ borderColor: `hsl(var(--preview-primary))` }}></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2" style={{ borderColor: `hsl(var(--preview-primary))` }}></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2" style={{ borderColor: `hsl(var(--preview-primary))` }}></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2" style={{ borderColor: `hsl(var(--preview-primary))` }}></div>
            </div>
            
            {/* Camera Button */}
            <div className="text-center mt-6">
              <button
                className="w-16 h-16 rounded-full bg-white shadow-lg border-4 flex items-center justify-center"
                style={{ borderColor: `hsl(var(--preview-primary))` }}
              >
                <div className="w-12 h-12 rounded-full" style={{ backgroundColor: `hsl(var(--preview-primary))` }}></div>
              </button>
            </div>
          </>
        );

      case 'countdown':
        return (
          <>
            {/* Countdown Display */}
            <div className="text-center">
              <div 
                className="w-32 h-32 mx-auto rounded-full border-8 flex items-center justify-center relative"
                style={{ borderColor: `hsl(var(--preview-primary))` }}
              >
                <span className="text-6xl font-bold" style={{ color: textColor }}>3</span>
                <div 
                  className="absolute inset-0 rounded-full border-8 border-transparent"
                  style={{ 
                    borderTopColor: `hsl(var(--preview-primary))`,
                    animation: 'spin 1s linear infinite'
                  }}
                ></div>
              </div>
              <p className="mt-4 text-lg font-medium" style={{ color: textColor }}>
                Keep still and smile!
              </p>
            </div>
          </>
        );

      case 'loading':
        return (
          <>
            {/* Loading Animation */}
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div 
                  className="w-32 h-32 rounded-full border-4 border-transparent animate-spin"
                  style={{ 
                    borderTopColor: `hsl(var(--preview-primary))`,
                    borderRightColor: `hsl(var(--preview-secondary))`
                  }}
                ></div>
                <Sparkles 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 animate-pulse"
                  style={{ color: `hsl(var(--preview-primary))` }}
                />
              </div>
              
              <div className="space-y-2">
                <p className="font-medium" style={{ color: textColor }}>Generating your avatar...</p>
                <div className="w-64 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
                  <div 
                    className="h-full rounded-full animate-pulse"
                    style={{ 
                      backgroundColor: `hsl(var(--preview-primary))`,
                      width: '65%'
                    }}
                  ></div>
                </div>
                <p className="text-sm opacity-75" style={{ color: textColor }}>This may take a few moments</p>
              </div>
            </div>
          </>
        );

      case 'result':
        return (
          <>
            {/* Result Display */}
            <div className="text-center">
              <div 
                className="w-48 h-48 mx-auto rounded-lg border-4 bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-6"
                style={{ borderColor: `hsl(var(--preview-primary))` }}
              >
                <div className="text-center">
                  <User className="h-20 w-20 mx-auto mb-2" style={{ color: textColor }} />
                  <p className="text-sm opacity-75" style={{ color: textColor }}>Your Avatar</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  className="px-6 py-3 rounded-lg font-medium text-white shadow-soft transition-all hover:shadow-md flex items-center gap-2"
                  style={{ backgroundColor: `hsl(var(--preview-primary))` }}
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  className="px-6 py-3 rounded-lg font-medium border-2 transition-all hover:shadow-sm flex items-center gap-2"
                  style={{ 
                    borderColor: `hsl(var(--preview-primary))`,
                    color: textColor,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

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
            backgroundColor: !backgroundImage ? backgroundColor : undefined,
            ...(backgroundImage
              ? {
                  backgroundImage: `${overlayOpacity ? `linear-gradient(hsla(0 0% 0% / ${overlayOpacity}), hsla(0 0% 0% / ${overlayOpacity})), ` : ''}url(${backgroundImage})`,
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
                {currentScreenSettings.title || getScreenTitle(currentScreenKey)}
              </h1>
              <p 
                className="text-lg opacity-90" 
                style={{ color: textColor }}
              >
                {getScreenSubtitle(currentScreenKey)}
              </p>
            </div>

            {/* Screen-Specific Content */}
            {renderScreenContent(currentScreenKey, textColor)}
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