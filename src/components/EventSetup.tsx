import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Palette, Image, ArrowRight, Eye } from "lucide-react";
import ColorPicker from "@/components/ColorPicker";
import ThemePreview from "@/components/ThemePreview";
import ScreenAppearanceEditor from "@/components/ScreenAppearanceEditor";
import { HSLColor, hslToHex } from "@/lib/colorUtils";
import { supabase } from "@/integrations/supabase/client";
import { getDefaultScreenSettings, loadScreenSettings, saveScreenSettings, type ScreenKey, type ScreenSettings } from "@/lib/kioskSettings";
import { useAuth } from "@/contexts/AuthContext";

const EventSetup = () => {
  const { user } = useAuth();
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [primaryColor, setPrimaryColor] = useState<HSLColor>({ h: 220, s: 100, l: 60 });
  const [secondaryColor, setSecondaryColor] = useState<HSLColor | null>(null);
  const [backgroundStyle, setBackgroundStyle] = useState<'solid' | 'gradient' | 'default'>('default');
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventId, setEventId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Screen appearance settings
  const [screenSettings, setScreenSettings] = useState<ScreenSettings>(getDefaultScreenSettings());
  const [previewScreen, setPreviewScreen] = useState<ScreenKey>('styles');

  // Load saved screen settings (with legacy migration)
  useEffect(() => {
    setScreenSettings(loadScreenSettings());
  }, []);

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

  // Save event colors to database whenever they change
  useEffect(() => {
    const saveEventColors = async () => {
      if (eventId && (primaryColor || secondaryColor)) {
        setIsSaving(true);
        try {
          const { error } = await supabase
            .from('events')
            .update({
              primary_color: `${primaryColor.h} ${primaryColor.s}% ${primaryColor.l}%`,
              secondary_color: secondaryColor ? `${secondaryColor.h} ${secondaryColor.s}% ${secondaryColor.l}%` : null,
              background_style: backgroundStyle,
              avatar_styles: selectedStyles
            })
            .eq('id', eventId);

          if (error) {
            console.error('Error saving event colors:', error);
          }
        } catch (error) {
          console.error('Error saving event colors:', error);
        } finally {
          setIsSaving(false);
        }
      }
    };

    const debounceTimer = setTimeout(saveEventColors, 500);
    return () => clearTimeout(debounceTimer);
  }, [eventId, primaryColor, secondaryColor, backgroundStyle, selectedStyles]);

  const createEvent = async () => {
    if (!eventName || selectedStyles.length === 0 || !user?.id) return;
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          name: eventName,
          location: eventLocation,
          primary_color: `${primaryColor.h} ${primaryColor.s}% ${primaryColor.l}%`,
          secondary_color: secondaryColor ? `${secondaryColor.h} ${secondaryColor.s}% ${secondaryColor.l}%` : null,
          background_style: backgroundStyle,
          avatar_styles: selectedStyles,
          is_active: true,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating event:', error);
        return;
      }

      if (data) {
        setEventId(data.id);
        // Redirect to kiosk with event ID
        window.open(`/kiosk?event=${data.id}`, '_blank');
      }
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsSaving(false);
    }
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

          {/* Screen Appearance - per screen customization */}
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="text-lg">Screen Appearance</CardTitle>
              <CardDescription>Customize text color, background image, and overlay per screen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="styles">
                  <AccordionTrigger>Choose Avatar</AccordionTrigger>
                  <AccordionContent>
                    <ScreenAppearanceEditor
                      label="Choose Avatar"
                      value={screenSettings.styles}
                      onChange={(next) => {
                        const merged = { ...screenSettings, styles: next };
                        setScreenSettings(merged);
                        saveScreenSettings(merged);
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="camera">
                  <AccordionTrigger>Camera</AccordionTrigger>
                  <AccordionContent>
                    <ScreenAppearanceEditor
                      label="Camera"
                      value={screenSettings.camera}
                      onChange={(next) => {
                        const merged = { ...screenSettings, camera: next };
                        setScreenSettings(merged);
                        saveScreenSettings(merged);
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="countdown">
                  <AccordionTrigger>Countdown</AccordionTrigger>
                  <AccordionContent>
                    <ScreenAppearanceEditor
                      label="Countdown"
                      value={screenSettings.countdown}
                      onChange={(next) => {
                        const merged = { ...screenSettings, countdown: next };
                        setScreenSettings(merged);
                        saveScreenSettings(merged);
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="loading">
                  <AccordionTrigger>Generating</AccordionTrigger>
                  <AccordionContent>
                    <ScreenAppearanceEditor
                      label="Generating"
                      value={screenSettings.loading}
                      onChange={(next) => {
                        const merged = { ...screenSettings, loading: next };
                        setScreenSettings(merged);
                        saveScreenSettings(merged);
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="result">
                  <AccordionTrigger>Result</AccordionTrigger>
                  <AccordionContent>
                    <ScreenAppearanceEditor
                      label="Result"
                      value={screenSettings.result}
                      onChange={(next) => {
                        const merged = { ...screenSettings, result: next };
                        setScreenSettings(merged);
                        saveScreenSettings(merged);
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Theme Preview with screen selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-end gap-2">
              <Label>Preview Screen</Label>
              <Select value={previewScreen} onValueChange={(v: ScreenKey) => setPreviewScreen(v)}>
                <SelectTrigger className="w-52 bg-input/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="styles">Choose Avatar</SelectItem>
                  <SelectItem value="camera">Camera</SelectItem>
                  <SelectItem value="countdown">Countdown</SelectItem>
                  <SelectItem value="loading">Generating</SelectItem>
                  <SelectItem value="result">Result</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ThemePreview 
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              backgroundStyle={backgroundStyle}
              title={screenSettings[previewScreen]?.title}
              textColorHex={screenSettings[previewScreen]?.textColorHex}
              backgroundImageDataUrl={screenSettings[previewScreen]?.backgroundImageDataUrl || undefined}
              overlayOpacity={screenSettings[previewScreen]?.overlayOpacity}
            />
          </div>

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
              disabled={!eventName || selectedStyles.length === 0 || isSaving || !user?.id}
              onClick={createEvent}
            >
              {isSaving ? 'Creating...' : eventId ? 'Update Event' : 'Create Event Kiosk'}
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
            {(!eventName || selectedStyles.length === 0 || !user?.id) && (
              <p className="text-sm text-muted-foreground">
                {!user?.id ? 'Please log in to create an event' : 'Please fill in event details and select at least one avatar style'}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventSetup;