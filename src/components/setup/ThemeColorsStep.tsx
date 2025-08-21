import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";
import ColorPicker from "@/components/ColorPicker";
import { HSLColor } from "@/lib/colorUtils";

interface ThemeColorsStepProps {
  primaryColor: HSLColor;
  secondaryColor: HSLColor | null;
  backgroundStyle: 'solid' | 'gradient' | 'default';
  onPrimaryColorChange: (color: HSLColor) => void;
  onSecondaryColorChange: (color: HSLColor | null) => void;
  onBackgroundStyleChange: (style: 'solid' | 'gradient' | 'default') => void;
}

const ThemeColorsStep = ({
  primaryColor,
  secondaryColor,
  backgroundStyle,
  onPrimaryColorChange,
  onSecondaryColorChange,
  onBackgroundStyleChange
}: ThemeColorsStepProps) => {
  const calmBlue: HSLColor = { h: 217, s: 90, l: 61 };

  return (
    <section className="relative transition-all duration-500 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ColorPicker 
          value={primaryColor} 
          onChange={onPrimaryColorChange} 
          label="Primary Color" 
          showAccessibilityCheck 
          contrastBackground={{ h: 0, s: 0, l: 100 }} 
        />

        <div className="space-y-4">
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5" />
                Secondary Color (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="useSecondary" 
                  checked={secondaryColor !== null} 
                  onChange={(e) => onSecondaryColorChange(e.target.checked ? calmBlue : null)} 
                  className="rounded border-border" 
                />
                <Label htmlFor="useSecondary">Use secondary color for gradients</Label>
              </div>
              {secondaryColor && (
                <ColorPicker 
                  value={secondaryColor} 
                  onChange={onSecondaryColorChange} 
                  label="" 
                  showAccessibilityCheck 
                  contrastBackground={primaryColor} 
                />
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="text-lg">Background Style</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={backgroundStyle} 
                onValueChange={(v: 'solid' | 'gradient' | 'default') => onBackgroundStyleChange(v)}
              >
                <SelectTrigger className="bg-input/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Theme</SelectItem>
                  <SelectItem value="solid">Solid Color</SelectItem>
                  <SelectItem value="gradient" disabled={!secondaryColor}>
                    Gradient {!secondaryColor && '(Enable secondary color)'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ThemeColorsStep;