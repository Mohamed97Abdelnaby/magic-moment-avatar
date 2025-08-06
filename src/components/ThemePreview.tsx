import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, Sparkles, User } from "lucide-react";
import { HSLColor, hslToHex } from "@/lib/colorUtils";

interface ThemePreviewProps {
  primaryColor: HSLColor;
  secondaryColor?: HSLColor;
  backgroundStyle: 'solid' | 'gradient' | 'default';
}

const ThemePreview = ({ primaryColor, secondaryColor, backgroundStyle }: ThemePreviewProps) => {
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

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader>
        <CardTitle className="text-lg">Live Preview</CardTitle>
        <p className="text-sm text-muted-foreground">See how your kiosk will look</p>
      </CardHeader>
      <CardContent>
        <div 
          className={`p-6 rounded-lg border-2 border-border min-h-[300px] ${getBackgroundClass()}`}
          style={previewStyle}
        >
          {/* Mini Kiosk Interface Preview */}
          <div className="space-y-4">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div 
                  className="p-2 rounded-lg shadow-soft"
                  style={{ backgroundColor: `hsl(var(--preview-primary))` }}
                >
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <span 
                  className="text-lg font-bold"
                  style={{ color: `hsl(var(--preview-primary))` }}
                >
                  AvatarMoment
                </span>
              </div>
              <h3 
                className="text-xl font-bold mb-1"
                style={{ color: `hsl(var(--preview-primary))` }}
              >
                Choose Your Style
              </h3>
              <p className="text-sm opacity-75">Select an avatar style for your photo</p>
            </div>

            {/* Style Options Preview */}
            <div className="grid grid-cols-2 gap-3">
              {['Pixar Style', 'Cyberpunk'].map((style, index) => (
                <button
                  key={style}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    index === 0 
                      ? 'shadow-md' 
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
                  <h4 className="font-semibold text-sm">{style}</h4>
                  <p className="text-xs opacity-75">3D animated style</p>
                </button>
              ))}
            </div>

            {/* Buttons Preview */}
            <div className="flex gap-2 justify-center">
              <button
                className="px-4 py-2 rounded-lg font-medium text-white shadow-soft transition-all hover:shadow-md"
                style={{ backgroundColor: `hsl(var(--preview-primary))` }}
              >
                <Camera className="h-4 w-4 mr-2 inline" />
                Start Camera
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium border-2 transition-all hover:shadow-sm"
                style={{ 
                  borderColor: `hsl(var(--preview-primary))`,
                  color: `hsl(var(--preview-primary))`,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }}
              >
                <User className="h-4 w-4 mr-2 inline" />
                Settings
              </button>
            </div>

            {/* Status Badge */}
            <div className="text-center">
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: `hsl(var(--preview-secondary))` }}
              >
                <Sparkles className="h-3 w-3" />
                Ready to capture
              </span>
            </div>
          </div>
        </div>

        {/* Color Info */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Primary:</span>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border border-border"
                style={{ backgroundColor: primaryHex }}
              />
              <span className="font-mono">{primaryHex}</span>
            </div>
          </div>
          {secondaryColor && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Secondary:</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border border-border"
                  style={{ backgroundColor: secondaryHex }}
                />
                <span className="font-mono">{secondaryHex}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemePreview;