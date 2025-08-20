import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, ArrowRight, CheckCircle2, Image, Palette, Play, Sparkles, Eye } from "lucide-react";
import ColorPicker from "@/components/ColorPicker";
import ThemePreview from "@/components/ThemePreview";
import ScreenAppearanceEditor from "@/components/ScreenAppearanceEditor";
import SplitScreenStep from "@/components/SplitScreenStep";
import SetupProgress from "@/components/SetupProgress";
import EventDetailsForm from "@/components/EventDetailsForm";
import { HSLColor, applyDynamicTheme } from "@/lib/colorUtils";
import { getDefaultScreenSettings, loadScreenSettings, saveScreenSettings, type ScreenKey, type ScreenSettings, type ScreenAppearance } from "@/lib/kioskSettings";

const calmBlue: HSLColor = { h: 217, s: 90, l: 61 };

const stepLabels = [
  "Welcome",
  "Event", 
  "Colors",
  "Styles Screen",
  "Camera Screen",
  "Countdown Screen", 
  "Loading Screen",
  "Result Screen",
  "Finish",
];

const StepsTotal = stepLabels.length;

type Dir = "forward" | "backward";

const AnimatedBackdrop = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 gradient-subtle" />
    <div className="absolute inset-0 gradient-hero opacity-60 mix-blend-screen" />
    <div className="particles">
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="particle" style={{ left: `${(i * 7) % 100}%`, animationDuration: `${6 + (i % 5)}s`, animationDelay: `${i * 0.4}s` }} />
      ))}
    </div>
  </div>
);

const SetupWizard = () => {
  const navigate = useNavigate();

  // SEO title
  useEffect(() => {
    document.title = "Event Setup Wizard – Calm Dark Blue";
  }, []);

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<Dir>("forward");

  // Core state (mirrors EventSetup to preserve functionality)
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [primaryColor, setPrimaryColor] = useState<HSLColor>(calmBlue);
  const [secondaryColor, setSecondaryColor] = useState<HSLColor | null>(null);
  const [backgroundStyle, setBackgroundStyle] = useState<'solid' | 'gradient' | 'default'>("default");
  const [screenSettings, setScreenSettings] = useState<ScreenSettings>(getDefaultScreenSettings());
  const [previewScreen, setPreviewScreen] = useState<ScreenKey>('styles');

  // Apply theme live
  useEffect(() => {
    applyDynamicTheme(primaryColor, secondaryColor || undefined);
  }, [primaryColor, secondaryColor]);

  // Load saved screen settings
  useEffect(() => {
    setScreenSettings(loadScreenSettings());
  }, []);

  // Debounced localStorage save
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const screenSettingsRef = useRef(screenSettings);
  screenSettingsRef.current = screenSettings;

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveScreenSettings(screenSettingsRef.current);
    }, 300);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Memoized screen change handler
  const handleScreenChange = useCallback((screenKey: ScreenKey, next: ScreenAppearance) => {
    setScreenSettings(prev => ({ ...prev, [screenKey]: next }));
    debouncedSave();
  }, [debouncedSave]);

  const next = () => { setDir("forward"); setStep((s) => Math.min(StepsTotal - 1, s + 1)); };
  const back = () => { setDir("backward"); setStep((s) => Math.max(0, s - 1)); };

  const avatarStyles = [
    { id: "pixar", name: "Pixar Style", description: "3D animated character style" },
    { id: "cyberpunk", name: "Cyberpunk", description: "Futuristic neon aesthetic" },
    { id: "cartoon", name: "90s Cartoon", description: "Classic hand-drawn animation" },
    { id: "sketch", name: "Sketch Art", description: "Pencil drawing style" },
    { id: "oil", name: "Oil Painting", description: "Classical painted portrait" },
    { id: "anime", name: "Anime", description: "Japanese animation style" },
  ];

  const toggleStyle = useCallback((styleId: string) => {
    setSelectedStyles((prev) => prev.includes(styleId) ? prev.filter((id) => id !== styleId) : [...prev, styleId]);
  }, []);

  // Handle event details changes from form component
  const handleEventDetailsChange = useCallback((name: string, location: string) => {
    setEventName(name);
    setEventLocation(location);
  }, []);

  const canFinish = eventName.trim().length > 0 && selectedStyles.length > 0;

  const handleFinish = useCallback(() => {
    // Save complete setup configuration
    const setupConfig = {
      eventName,
      eventLocation,
      selectedStyles,
      primaryColor,
      secondaryColor,
      backgroundStyle,
      screenSettings,
      setupCompleted: true,
      setupDate: new Date().toISOString()
    };
    
    localStorage.setItem('kioskSetupConfig', JSON.stringify(setupConfig));
    
    // Navigate to kiosk
    navigate('/kiosk');
  }, [eventName, eventLocation, selectedStyles, primaryColor, secondaryColor, backgroundStyle, screenSettings, navigate]);

  const StepContainer = ({ children }: { children: React.ReactNode }) => (
    <section
      className={`relative transition-all duration-500 ${dir === 'forward' ? 'animate-fade-in' : 'animate-fade-in'}`}
    >
      {children}
    </section>
  );

  const Welcome = () => (
    <StepContainer>
      <div className="text-center py-10">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-secondary/60 border border-border shadow-soft animate-[pulse-soft_3s_ease-in-out_infinite]">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm">A calm, animated setup experience</span>
        </div>
        <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent gradient-primary">Setup Your Event</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Guided steps with smooth animations inspired by Apple and Frame.io.
        </p>
      </div>
      <div className="flex justify-center">
        <Button size="lg" variant="hero" onClick={next} className="px-10">
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </StepContainer>
  );

  const EventDetails = React.memo(() => (
    <StepContainer>
      <EventDetailsForm
        initialEventName={eventName}
        initialEventLocation={eventLocation}
        onEventDetailsChange={handleEventDetailsChange}
      />
    </StepContainer>
  ));

  const ThemeColors = () => (
    <StepContainer>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ColorPicker value={primaryColor} onChange={setPrimaryColor} label="Primary Color" showAccessibilityCheck contrastBackground={{ h: 0, s: 0, l: 100 }} />

        <div className="space-y-4">
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Palette className="h-5 w-5" />Secondary Color (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="useSecondary" checked={secondaryColor !== null} onChange={(e) => setSecondaryColor(e.target.checked ? calmBlue : null)} className="rounded border-border" />
                <Label htmlFor="useSecondary">Use secondary color for gradients</Label>
              </div>
              {secondaryColor && (
                <ColorPicker value={secondaryColor} onChange={setSecondaryColor} label="" showAccessibilityCheck contrastBackground={primaryColor} />
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader><CardTitle className="text-lg">Background Style</CardTitle></CardHeader>
            <CardContent>
              <Select value={backgroundStyle} onValueChange={(v: 'solid' | 'gradient' | 'default') => setBackgroundStyle(v)}>
                <SelectTrigger className="bg-input/50 border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Theme</SelectItem>
                  <SelectItem value="solid">Solid Color</SelectItem>
                  <SelectItem value="gradient" disabled={!secondaryColor}>Gradient {!secondaryColor && '(Enable secondary color)'}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    </StepContainer>
  );

  // Individual Screen Steps - Memoized for performance
  const StylesScreen = useMemo(() => (
    <SplitScreenStep
      screenKey="styles"
      screenSettings={screenSettings.styles}
      onScreenChange={(next) => handleScreenChange('styles', next)}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor || undefined}
      backgroundStyle={backgroundStyle}
      title="Avatar Styles Screen"
      description="Customize how the avatar selection screen looks and feels"
    />
  ), [screenSettings.styles, handleScreenChange, primaryColor, secondaryColor, backgroundStyle]);

  const CameraScreen = useMemo(() => (
    <SplitScreenStep
      screenKey="camera"
      screenSettings={screenSettings.camera}
      onScreenChange={(next) => handleScreenChange('camera', next)}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor || undefined}
      backgroundStyle={backgroundStyle}
      title="Camera Screen"
      description="Design the camera interface where users take their photos"
    />
  ), [screenSettings.camera, handleScreenChange, primaryColor, secondaryColor, backgroundStyle]);

  const CountdownScreen = useMemo(() => (
    <SplitScreenStep
      screenKey="countdown"
      screenSettings={screenSettings.countdown}
      onScreenChange={(next) => handleScreenChange('countdown', next)}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor || undefined}
      backgroundStyle={backgroundStyle}
      title="Countdown Screen"
      description="Customize the countdown timer that prepares users for their photo"
    />
  ), [screenSettings.countdown, handleScreenChange, primaryColor, secondaryColor, backgroundStyle]);

  const LoadingScreen = useMemo(() => (
    <SplitScreenStep
      screenKey="loading"
      screenSettings={screenSettings.loading}
      onScreenChange={(next) => handleScreenChange('loading', next)}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor || undefined}
      backgroundStyle={backgroundStyle}
      title="Loading Screen"
      description="Style the AI generation screen that creates the avatar"
    />
  ), [screenSettings.loading, handleScreenChange, primaryColor, secondaryColor, backgroundStyle]);

  const ResultScreen = useMemo(() => (
    <SplitScreenStep
      screenKey="result"
      screenSettings={screenSettings.result}
      onScreenChange={(next) => handleScreenChange('result', next)}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor || undefined}
      backgroundStyle={backgroundStyle}
      title="Result Screen"
      description="Design how users see and share their final avatar"
    />
  ), [screenSettings.result, handleScreenChange, primaryColor, secondaryColor, backgroundStyle]);


  const StylesAndFinish = useMemo(() => (
    <StepContainer>
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
                  selectedStyles.includes(style.id) ? 'border-accent shadow-medium bg-accent/10' : 'border-border hover:border-muted-foreground'
                }`}
              >
                <h4 className="font-semibold mb-1">{style.name}</h4>
                <p className="text-sm text-muted-foreground">{style.description}</p>
              </button>
            ))}
          </div>

          <div className="text-center space-y-4 mt-8">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              Live preview updates as you customize colors
            </div>
            <Button 
              variant="hero" 
              size="lg" 
              className="text-xl px-12 py-6" 
              disabled={!canFinish}
              onClick={handleFinish}
            >
              Create Event Kiosk
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
            {!canFinish && (
              <p className="text-sm text-muted-foreground">Please fill in event details and select at least one avatar style</p>
            )}
          </div>
        </CardContent>
      </Card>
    </StepContainer>
  ), [selectedStyles, toggleStyle, canFinish, handleFinish]);

  const renderStep = () => {
    switch (step) {
      case 0: return <Welcome />;
      case 1: return <EventDetails />;
      case 2: return <ThemeColors />;
      case 3: return StylesScreen;
      case 4: return CameraScreen;
      case 5: return CountdownScreen;
      case 6: return LoadingScreen;
      case 7: return ResultScreen;
      case 8: return StylesAndFinish;
      default: return null;
    }
  };

  return (
    <main className="min-h-screen bg-background relative">
      <AnimatedBackdrop />
      <div className="container mx-auto px-6 py-10 max-w-5xl">
        <SetupProgress total={StepsTotal} current={step} labels={stepLabels} />

        {renderStep()}

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            {step < StepsTotal - 1 ? (
              <Button onClick={next}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button disabled={!canFinish} className="gap-2">
                Finish <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default SetupWizard;
