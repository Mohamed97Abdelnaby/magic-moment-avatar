import { useMemo, memo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import ColorPicker from "@/components/ColorPicker";
import { HSLColor, hexToHsl, hslToHex } from "@/lib/colorUtils";
import type { ScreenAppearance } from "@/lib/kioskSettings";

interface ScreenAppearanceEditorProps {
  label: string;
  value: ScreenAppearance;
  onChange: (next: ScreenAppearance) => void;
  showTitle?: boolean;
}

const parseHslString = (str?: string): HSLColor => {
  if (!str) return { h: 0, s: 0, l: 100 };
  try {
    const [h, s, l] = str.split(" ");
    return { h: parseFloat(h), s: parseFloat(s), l: parseFloat(l) };
  } catch {
    return { h: 0, s: 0, l: 100 };
  }
};

const ScreenAppearanceEditor = memo(({ label, value, onChange, showTitle = true }: ScreenAppearanceEditorProps) => {
  const currentHsl = useMemo<HSLColor>(() => {
    if (value.textColorHex) return hexToHsl(value.textColorHex);
    return parseHslString(value.textColorHsl);
  }, [value.textColorHex, value.textColorHsl]);

  // Memoized event handlers
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, title: e.target.value });
  }, [value, onChange]);

  const handleColorChange = useCallback((hsl: HSLColor) => {
    onChange({
      ...value,
      textColorHex: hslToHex(hsl),
      textColorHsl: `${hsl.h} ${hsl.s}% ${hsl.l}%`,
    });
  }, [value, onChange]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ ...value, backgroundImageDataUrl: reader.result as string });
    reader.readAsDataURL(file);
  }, [value, onChange]);

  const handleRemoveImage = useCallback(() => {
    onChange({ ...value, backgroundImageDataUrl: null });
  }, [value, onChange]);

  const handleOpacityChange = useCallback((vals: number[]) => {
    onChange({ ...value, overlayOpacity: Math.max(0, Math.min(0.8, (vals?.[0] ?? 0) / 100)) });
  }, [value, onChange]);

  const handleBackgroundColorChange = useCallback((hsl: HSLColor) => {
    onChange({ ...value, backgroundColor: hslToHex(hsl) });
  }, [value, onChange]);

  const currentBackgroundHsl = useMemo<HSLColor>(() => {
    return value.backgroundColor ? hexToHsl(value.backgroundColor) : { h: 225, s: 30, l: 15 };
  }, [value.backgroundColor]);

  return (
    <div className="space-y-6">
        {showTitle && (
          <div>
            <Label htmlFor={`${label}-title`}>Title</Label>
            <Input
              id={`${label}-title`}
              value={value.title || ""}
              onChange={handleTitleChange}
              placeholder={label}
              className="bg-input/50 border-border"
            />
          </div>
        )}

        <div>
          <ColorPicker
            value={currentHsl}
            onChange={handleColorChange}
            label="Text Color"
            showAccessibilityCheck={true}
            contrastBackground={value.backgroundColor ? hexToHsl(value.backgroundColor) : currentBackgroundHsl}
          />
        </div>

        {!value.backgroundImageDataUrl && (
          <div>
            <ColorPicker
              value={currentBackgroundHsl}
              onChange={handleBackgroundColorChange}
              label="Background Color"
              showAccessibilityCheck={false}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Background Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="bg-input/50 border-border"
            />
            {value.backgroundImageDataUrl && (
              <div className="relative">
                <img
                  src={value.backgroundImageDataUrl}
                  alt={`${label} background preview`}
                  className="w-full h-40 object-cover rounded-md border border-border"
                />
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" onClick={handleRemoveImage}>
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Overlay Opacity</Label>
            <div className="px-1">
              <Slider
                value={[Math.round(((value.overlayOpacity ?? 0.45) * 100))]}
                max={80}
                min={0}
                step={1}
                onValueChange={handleOpacityChange}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(((value.overlayOpacity ?? 0.45) * 100))}%
            </div>
          </div>
        </div>
    </div>
  );
});

export default ScreenAppearanceEditor;
