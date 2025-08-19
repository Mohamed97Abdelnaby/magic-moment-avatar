import { Card, CardContent } from "@/components/ui/card";
import ScreenAppearanceEditor from "@/components/ScreenAppearanceEditor";
import ThemePreview from "@/components/ThemePreview";
import { HSLColor } from "@/lib/colorUtils";
import { ScreenAppearance, ScreenKey } from "@/lib/kioskSettings";

interface SplitScreenStepProps {
  screenKey: ScreenKey;
  screenSettings: ScreenAppearance;
  onScreenChange: (settings: ScreenAppearance) => void;
  primaryColor: HSLColor;
  secondaryColor?: HSLColor;
  backgroundStyle: 'solid' | 'gradient' | 'default';
  title: string;
  description: string;
}

const getScreenDisplayName = (screenKey: ScreenKey): string => {
  const names = {
    styles: "Choose Avatar",
    camera: "Camera",
    countdown: "Countdown", 
    loading: "Generating",
    result: "Result"
  };
  return names[screenKey];
};

const SplitScreenStep = ({
  screenKey,
  screenSettings,
  onScreenChange,
  primaryColor,
  secondaryColor,
  backgroundStyle,
  title,
  description
}: SplitScreenStepProps) => {
  return (
    <div className="relative transition-all duration-500 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border shadow-soft mb-4">
          <span className="text-sm font-medium">{getScreenDisplayName(screenKey)} Screen</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">{title}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        {/* Left Panel - Customization */}
        <div className="space-y-6">
          <Card className="bg-card/80 backdrop-blur border-border shadow-soft">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                Customize Appearance
              </h3>
              <div className="space-y-6">
                <ScreenAppearanceEditor
                  label={screenKey}
                  value={screenSettings}
                  onChange={onScreenChange}
                  showTitle={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="lg:sticky lg:top-8 lg:h-fit">
          <ThemePreview
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            backgroundStyle={backgroundStyle}
            title={screenSettings.title}
            textColorHex={screenSettings.textColorHex}
            backgroundImageDataUrl={screenSettings.backgroundImageDataUrl || undefined}
            overlayOpacity={screenSettings.overlayOpacity}
          />
        </div>
      </div>
    </div>
  );
};

export default SplitScreenStep;