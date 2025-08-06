import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Palette, AlertTriangle } from "lucide-react";
import { 
  HSLColor, 
  hexToHsl, 
  hslToHex, 
  checkAccessibility, 
  colorPalette 
} from "@/lib/colorUtils";

interface ColorPickerProps {
  value: HSLColor;
  onChange: (color: HSLColor) => void;
  label?: string;
  showAccessibilityCheck?: boolean;
  contrastBackground?: HSLColor;
}

const ColorPicker = ({ 
  value, 
  onChange, 
  label = "Choose Color",
  showAccessibilityCheck = false,
  contrastBackground
}: ColorPickerProps) => {
  const [hexValue, setHexValue] = useState(hslToHex(value));

  useEffect(() => {
    setHexValue(hslToHex(value));
  }, [value]);

  const handleHexChange = (hex: string) => {
    setHexValue(hex);
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      onChange(hexToHsl(hex));
    }
  };

  const handlePaletteClick = (hex: string) => {
    onChange(hexToHsl(hex));
  };

  const handleSliderChange = (property: keyof HSLColor, newValue: number[]) => {
    onChange({
      ...value,
      [property]: newValue[0]
    });
  };

  // Calculate accessibility if background provided
  const accessibility = showAccessibilityCheck && contrastBackground 
    ? checkAccessibility(value, contrastBackground) 
    : null;

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-5 w-5" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Preview */}
        <div className="flex items-center gap-4">
          <div 
            className="w-20 h-20 rounded-lg border-2 border-border shadow-soft"
            style={{ backgroundColor: hslToHex(value) }}
          />
          <div className="flex-1">
            <Label htmlFor="hex-input">Hex Color</Label>
            <Input
              id="hex-input"
              value={hexValue}
              onChange={(e) => handleHexChange(e.target.value.toUpperCase())}
              placeholder="#3B82F6"
              className="font-mono bg-input/50 border-border"
            />
          </div>
        </div>

        {/* Predefined Palette */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Quick Colors</Label>
          <div className="grid grid-cols-10 gap-2">
            {colorPalette.map((color, index) => (
              <button
                key={index}
                onClick={() => handlePaletteClick(color)}
                className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform shadow-soft"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* HSL Sliders */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Hue: {value.h}°
            </Label>
            <Slider
              value={[value.h]}
              onValueChange={(v) => handleSliderChange('h', v)}
              max={360}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Saturation: {value.s}%
            </Label>
            <Slider
              value={[value.s]}
              onValueChange={(v) => handleSliderChange('s', v)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Lightness: {value.l}%
            </Label>
            <Slider
              value={[value.l]}
              onValueChange={(v) => handleSliderChange('l', v)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Accessibility Check */}
        {accessibility && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              {accessibility.aa ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ {accessibility.rating}
                </Badge>
              ) : (
                <Badge variant="destructive" className="bg-red-100 text-red-800 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {accessibility.rating}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Contrast ratio: {accessibility.contrast.toFixed(2)}:1
              {!accessibility.aa && " (Consider adjusting for better accessibility)"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ColorPicker;