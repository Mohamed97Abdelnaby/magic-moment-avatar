import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Image, ArrowRight, Eye } from "lucide-react";
import ColorPicker from "@/components/ColorPicker";
import ThemePreview from "@/components/ThemePreview";
import { HSLColor, applyDynamicTheme, hslToHex, hexToHsl } from "@/lib/colorUtils";

const EventSetup = () => {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [primaryColor, setPrimaryColor] = useState<HSLColor>({ h: 220, s: 100, l: 60 });
  const [secondaryColor, setSecondaryColor] = useState<HSLColor | null>(null);
  const [backgroundStyle, setBackgroundStyle] = useState<'solid' | 'gradient' | 'default'>('default');
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  // Choose Avatar Screen settings
  const [stylesTitle, setStylesTitle] = useState<string>("Choose your Avatar");
  const [stylesTextColor, setStylesTextColor] = useState<HSLColor>({ h: 0, s: 0, l: 100 });
  const [backgroundImageDataUrl, setBackgroundImageDataUrl] = useState<string | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(45); // 0-80 (percent)

  // Apply theme changes in real-time
  useEffect(() => {
    applyDynamicTheme(primaryColor, secondaryColor || undefined);
  }, [primaryColor, secondaryColor]);

  // Load saved Choose Avatar screen settings
  useEffect(() => {
    const raw = localStorage.getItem('kiosk:styleSelection');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.title) setStylesTitle(data.title);
      if (data.textColorHex) setStylesTextColor(hexToHsl(data.textColorHex));
      if (typeof data.overlayOpacity === 'number') setOverlayOpacity(Math.round(data.overlayOpacity * 100));
      if (data.backgroundImageDataUrl) setBackgroundImageDataUrl(data.backgroundImageDataUrl);
    } catch {}
  }, []);

  // Persist Choose Avatar screen settings
  useEffect(() => {
    const payload = {
      title: stylesTitle,
      textColorHex: hslToHex(stylesTextColor),
      textColorHsl: `${stylesTextColor.h} ${stylesTextColor.s}% ${stylesTextColor.l}%`,
      backgroundImageDataUrl,
      overlayOpacity: Math.max(0, Math.min(0.8, overlayOpacity / 100)),
    };
    localStorage.setItem('kiosk:styleSelection', JSON.stringify(payload));
  }, [stylesTitle, stylesTextColor, backgroundImageDataUrl, overlayOpacity]);

  const avatarStyles = [
    { id: "pixar", name: "Pixar Style", description: "3D animated character style" },
    { id: "cyberpunk", name: "Cyberpunk", description: "Futuristic neon aesthetic" },
    { id: "cartoon", name: "90s Cartoon", description: "Classic hand-drawn animation" },
    { id: "sketch", name: "Sketch Art", description: "Pencil drawing style" },
    { id: "oil", name: "Oil Painting", description: "Classical painted portrait" },
    { id: "anime", name: "Anime", description: "Japanese animation style" },
  ];

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">
            <span className="gradient-primary bg-clip-text text-transparent">
              Setup Your Event
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Customize the theme and avatar styles for your attendees
          </p>
        </div>

        <div className="space-y-8">
          {/* Event Details */}
          <Card className="bg-card/80 backdrop-blur border-border shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-6 w-6" />
                Event Details
              </CardTitle>
              <CardDescription>Basic information about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="eventName">Event Name</Label>
                <Input 
                  id="eventName"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Tech Conference 2024"
                  className="bg-input/50 border-border"
                />
              </div>
              <div>
                <Label htmlFor="eventLocation">Location</Label>
                <Input 
                  id="eventLocation"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Convention Center Hall A"
                  className="bg-input/50 border-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Color Customization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Color Picker */}
            <ColorPicker
              value={primaryColor}
              onChange={setPrimaryColor}
              label="Primary Color"
              showAccessibilityCheck={true}
              contrastBackground={{ h: 0, s: 0, l: 100 }} // White background for contrast check
            />

            {/* Secondary Color Picker */}
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
                      onChange={(e) => setSecondaryColor(e.target.checked ? { h: 200, s: 70, l: 50 } : null)}
                      className="rounded border-border"
                    />
                    <Label htmlFor="useSecondary">Use secondary color for gradients</Label>
                  </div>
                  
                  {secondaryColor && (
                    <ColorPicker
                      value={secondaryColor}
                      onChange={setSecondaryColor}
                      label=""
                      showAccessibilityCheck={true}
                      contrastBackground={primaryColor}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Background Style */}
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Background Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={backgroundStyle} onValueChange={(value: 'solid' | 'gradient' | 'default') => setBackgroundStyle(value)}>
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

          {/* Choose Avatar Screen */}
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="text-lg">Choose Avatar Screen</CardTitle>
              <CardDescription>Customize the text color, background image, and overlay</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="stylesTitle">Title</Label>
                <Input
                  id="stylesTitle"
                  value={stylesTitle}
                  onChange={(e) => setStylesTitle(e.target.value)}
                  placeholder="Choose your Avatar"
                  className="bg-input/50 border-border"
                />
              </div>

              <div>
                <ColorPicker
                  value={stylesTextColor}
                  onChange={setStylesTextColor}
                  label="Text Color"
                  showAccessibilityCheck={!!backgroundImageDataUrl}
                  contrastBackground={backgroundImageDataUrl ? { h: 0, s: 0, l: 0 } : { h: 0, s: 0, l: 100 }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Background Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setBackgroundImageDataUrl(reader.result as string);
                      reader.readAsDataURL(file);
                    }}
                    className="bg-input/50 border-border"
                  />
                  {backgroundImageDataUrl && (
                    <div className="relative">
                      <img src={backgroundImageDataUrl} alt="Choose Avatar background preview" className="w-full h-40 object-cover rounded-md border border-border" />
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" onClick={() => setBackgroundImageDataUrl(null)}>Remove</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overlayOpacity">Overlay Opacity</Label>
                  <input
                    id="overlayOpacity"
                    type="range"
                    min={0}
                    max={80}
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground">{Math.round((overlayOpacity/100)*100)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Preview */}
          <ThemePreview 
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            backgroundStyle={backgroundStyle}
            title={stylesTitle}
            textColorHex={hslToHex(stylesTextColor)}
            backgroundImageDataUrl={backgroundImageDataUrl || undefined}
            overlayOpacity={Math.max(0, Math.min(0.8, overlayOpacity / 100))}
          />

          {/* Avatar Styles */}
          <Card className="bg-card/80 backdrop-blur border-border shadow-soft">
            <CardHeader>
              <CardTitle>Avatar Styles</CardTitle>
              <CardDescription>Select which avatar styles attendees can choose from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {avatarStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => toggleStyle(style.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-smooth ${
                      selectedStyles.includes(style.id)
                        ? 'border-accent shadow-medium bg-accent/10'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <h4 className="font-semibold mb-1">{style.name}</h4>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              Live preview updates as you customize colors
            </div>
            <Button 
              variant="hero" 
              size="lg" 
              className="text-xl px-12 py-6"
              disabled={!eventName || selectedStyles.length === 0}
            >
              Create Event Kiosk
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
            {(!eventName || selectedStyles.length === 0) && (
              <p className="text-sm text-muted-foreground">
                Please fill in event details and select at least one avatar style
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventSetup;