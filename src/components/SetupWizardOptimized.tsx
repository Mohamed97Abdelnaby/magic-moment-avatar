import { useEffect, useMemo, useState, useCallback, useRef, memo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useStatePersistence } from "@/hooks/useStatePersistence";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, CheckCircle2, Palette, Sparkles, Eye, AlertTriangle } from "lucide-react";
import ColorPicker from "@/components/ColorPicker";
import SplitScreenStep from "@/components/SplitScreenStep";
import SetupProgress from "@/components/SetupProgress";
import EventDetailsForm from "@/components/EventDetailsForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HSLColor, hexToHsl } from "@/lib/colorUtils";
import { getDefaultScreenSettings, loadScreenSettings, saveScreenSettings, type ScreenKey, type ScreenSettings, type ScreenAppearance } from "@/lib/kioskSettings";
import { getStepValidation, type StepValidation } from "@/lib/validation";

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

// Memoized components outside main component to prevent recreation
const AnimatedBackdrop = memo(() => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 gradient-subtle" />
    <div className="absolute inset-0 gradient-hero opacity-60 mix-blend-screen" />
    <div className="particles">
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="particle" style={{ left: `${(i * 7) % 100}%`, animationDuration: `${6 + (i % 5)}s`, animationDelay: `${i * 0.4}s` }} />
      ))}
    </div>
  </div>
));

const StepContainer = memo(({ children }: { children: React.ReactNode }) => (
  <section className="relative transition-all duration-500 animate-fade-in">
    {children}
  </section>
));

const Welcome = memo(({ onNext }: { onNext: () => void }) => (
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
      <Button size="lg" variant="hero" onClick={onNext} className="px-10">
        Get Started
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  </StepContainer>
));

const ThemeColors = memo(({ 
  primaryColor, 
  setPrimaryColor, 
  secondaryColor, 
  setSecondaryColor, 
  backgroundStyle, 
  setBackgroundStyle 
}: {
  primaryColor: HSLColor;
  setPrimaryColor: (color: HSLColor) => void;
  secondaryColor: HSLColor | null;
  setSecondaryColor: (color: HSLColor | null) => void;
  backgroundStyle: 'solid' | 'gradient' | 'default';
  setBackgroundStyle: (style: 'solid' | 'gradient' | 'default') => void;
}) => (
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
              <Label htmlFor="secondary-toggle" className="text-sm">Enable secondary color</Label>
              <input
                id="secondary-toggle"
                type="checkbox"
                checked={!!secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.checked ? { h: 150, s: 70, l: 50 } : null)}
                className="rounded"
              />
            </div>
            {secondaryColor && (
              <ColorPicker 
                value={secondaryColor} 
                onChange={setSecondaryColor} 
                label="Secondary Color" 
                showAccessibilityCheck 
                contrastBackground={{ h: 0, s: 0, l: 100 }}
              />
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader>
            <CardTitle className="text-lg">Background Style</CardTitle>
            <CardDescription>Choose how colors are applied to your kiosk background</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={backgroundStyle} onValueChange={(value: 'solid' | 'gradient' | 'default') => setBackgroundStyle(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Theme</SelectItem>
                <SelectItem value="solid">Solid Primary Color</SelectItem>
                <SelectItem value="gradient">Gradient (Primary + Secondary)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  </StepContainer>
));

const StylesAndFinish = memo(({ 
  selectedStyles, 
  toggleStyle, 
  canFinish, 
  handleFinish, 
  loading, 
  isEditing 
}: {
  selectedStyles: string[];
  toggleStyle: (styleId: string) => void;
  canFinish: boolean;
  handleFinish: () => void;
  loading: boolean;
  isEditing: boolean;
}) => {
  const avatarStyles = [
    { id: "farmer", name: "Egyptian Farmer", description: "Traditional Rural Life", preview: "🌾" },
    { id: "pharaonic", name: "Ancient Pharaoh", description: "Royal Dynasty Style", preview: "👑" },
    { id: "basha", name: "El Basha Style", description: "Elite Noble Fashion", preview: "🎩" },
    { id: "beach", name: "Beach Vibes", description: "Summer Mediterranean", preview: "🏖️" },
    { id: "pixar", name: "Pixar Style", description: "3D Animated Magic", preview: "🎭" },
  ];

  return (
    <StepContainer>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Choose Avatar Styles</h2>
        <p className="text-muted-foreground">Select the art styles available in your kiosk</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {avatarStyles.map((style) => (
          <Card 
            key={style.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedStyles.includes(style.id) 
                ? 'border-primary shadow-soft bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => toggleStyle(style.id)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">{style.preview}</div>
              <h3 className="font-semibold mb-1">{style.name}</h3>
              <p className="text-sm text-muted-foreground">{style.description}</p>
              {selectedStyles.includes(style.id) && (
                <CheckCircle2 className="h-5 w-5 text-primary mx-auto mt-3" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button 
          size="lg" 
          onClick={handleFinish} 
          disabled={!canFinish || loading}
          className="px-8"
        >
          {loading ? "Saving..." : (isEditing ? "Update Event" : "Create Event")}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </StepContainer>
  );
});

const SetupWizardOptimized = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Get event ID from URL params for editing
  const eventId = searchParams.get('event');
  const isEditing = !!eventId;

  // SEO title
  useEffect(() => {
    document.title = isEditing ? "Edit Event – Calm Dark Blue" : "Event Setup Wizard – Calm Dark Blue";
  }, [isEditing]);

  // Persistent state using session storage
  const [step, setStep] = useStatePersistence('setup-wizard-step', 0);
  const [dir, setDir] = useState<Dir>("forward");
  const [loading, setLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Core state with persistence
  const [eventName, setEventName] = useStatePersistence('setup-event-name', "");
  const [eventLocation, setEventLocation] = useStatePersistence('setup-event-location', "");
  const [startDate, setStartDate] = useStatePersistence<Date | undefined>('setup-start-date', undefined, {
    serialize: (date) => date ? date.toISOString() : '',
    deserialize: (str) => str ? new Date(str) : undefined
  });
  const [endDate, setEndDate] = useStatePersistence<Date | undefined>('setup-end-date', undefined, {
    serialize: (date) => date ? date.toISOString() : '',
    deserialize: (str) => str ? new Date(str) : undefined
  });
  const [selectedStyles, setSelectedStyles] = useStatePersistence<string[]>('setup-selected-styles', []);
  const [primaryColor, setPrimaryColor] = useStatePersistence<HSLColor>('setup-primary-color', calmBlue);
  const [secondaryColor, setSecondaryColor] = useStatePersistence<HSLColor | null>('setup-secondary-color', null);
  const [backgroundStyle, setBackgroundStyle] = useStatePersistence<'solid' | 'gradient' | 'default'>('setup-background-style', "default");
  const [screenSettings, setScreenSettings] = useStatePersistence<ScreenSettings>('setup-screen-settings', getDefaultScreenSettings());

  // Get current step validation
  const currentStepValidation: StepValidation = useMemo(() => 
    getStepValidation(step, eventName, eventLocation, selectedStyles),
    [step, eventName, eventLocation, selectedStyles]
  );

  // Authentication check and redirect
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create or edit events",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [authLoading, user, navigate, toast]);

  // Load existing event data when editing
  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId || !user || initialLoadComplete) return;
      
      setLoading(true);
      try {
        // Load event data
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .eq('user_id', user.id)
          .single();

        if (eventError) {
          toast({
            title: "Event Not Found",
            description: "Event not found or you don't have permission to edit it",
            variant: "destructive"
          });
          navigate('/my-events');
          return;
        }

        // Populate form with event data
        setEventName(eventData.name);
        setEventLocation(eventData.location || "");
        
        // Parse dates if they exist
        if (eventData.start_date) {
          setStartDate(new Date(eventData.start_date));
        }
        if (eventData.end_date) {
          setEndDate(new Date(eventData.end_date));
        }
        
        setSelectedStyles(eventData.avatar_styles || []);
        setPrimaryColor({
          h: parseInt(eventData.primary_color.split(',')[0]),
          s: parseInt(eventData.primary_color.split(',')[1]),
          l: parseInt(eventData.primary_color.split(',')[2])
        });
        
        if (eventData.secondary_color) {
          setSecondaryColor({
            h: parseInt(eventData.secondary_color.split(',')[0]),
            s: parseInt(eventData.secondary_color.split(',')[1]),
            l: parseInt(eventData.secondary_color.split(',')[2])
          });
        }
        
        setBackgroundStyle(eventData.background_style as 'solid' | 'gradient' | 'default' || 'default');

        // Load screen settings
        const { data: screenData, error: screenError } = await supabase
          .from('event_screen_settings')
          .select('*')
          .eq('event_id', eventId);

        if (!screenError && screenData) {
          const loadedSettings = { ...getDefaultScreenSettings() };
          screenData.forEach(setting => {
            if (setting.screen_key in loadedSettings) {
              const textColorHex = setting.text_color || '#ffffff';
              const hslColor = hexToHsl(textColorHex);
              
              loadedSettings[setting.screen_key as ScreenKey] = {
                textColorHex,
                textColorHsl: `${hslColor.h} ${hslColor.s}% ${hslColor.l}%`,
                backgroundColor: setting.background_color || '#1a1a2e',
                backgroundImageDataUrl: setting.background_image || null,
                overlayOpacity: Number(setting.overlay_opacity) || 0.6,
                title: setting.title || ''
              };
            }
          });
          setScreenSettings(loadedSettings);
        }

        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error loading event:', error);
        toast({
          title: "Load Failed",
          description: "Failed to load event data",
          variant: "destructive"
        });
        navigate('/my-events');
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId, user, initialLoadComplete, navigate, toast]);

  // Load saved screen settings for new events
  useEffect(() => {
    if (!isEditing && !initialLoadComplete) {
      setScreenSettings(loadScreenSettings());
      setInitialLoadComplete(true);
    }
  }, [isEditing, initialLoadComplete]);

  // Stable callback handlers
  const handleScreenChange = useCallback((screenKey: ScreenKey, changes: Partial<ScreenAppearance>) => {
    setScreenSettings(prev => ({ 
      ...prev, 
      [screenKey]: { ...prev[screenKey], ...changes }
    }));
  }, [setScreenSettings]);

  const next = useCallback(() => {
    if (!currentStepValidation.canProceed) {
      toast({
        title: "Please complete required fields",
        description: currentStepValidation.errors[0],
        variant: "destructive"
      });
      return;
    }
    
    setDir("forward");
    setStep(Math.min(StepsTotal - 1, step + 1));
  }, [currentStepValidation, step, setStep, toast]);
  
  const back = useCallback(() => { 
    setDir("backward"); 
    setStep(Math.max(0, step - 1)); 
  }, [step, setStep]);

  const toggleStyle = useCallback((styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId) 
        : [...prev, styleId]
    );
  }, [setSelectedStyles]);

  // Event details update handlers
  const handleEventNameChange = useCallback((newEventName: string) => {
    setEventName(newEventName);
  }, [setEventName]);

  const handleEventLocationChange = useCallback((newEventLocation: string) => {
    setEventLocation(newEventLocation);
  }, [setEventLocation]);

  const handleStartDateChange = useCallback((date: Date | undefined) => {
    setStartDate(date);
  }, [setStartDate]);

  const handleEndDateChange = useCallback((date: Date | undefined) => {
    setEndDate(date);
  }, [setEndDate]);

  const canFinish = eventName.trim().length > 0 && selectedStyles.length > 0;

  const handleFinish = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your event",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Validate unique event name
      const { validateEventNameUnique } = await import("@/lib/validation");
      const uniqueValidation = await validateEventNameUnique(eventName, user.id, isEditing ? eventId : undefined);
      
      if (!uniqueValidation.isValid) {
        toast({
          title: "Event Name Already Exists",
          description: uniqueValidation.errors[0],
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Prepare event data
      const eventData = {
        name: eventName,
        location: eventLocation,
        start_date: startDate ? startDate.toISOString().split('T')[0] : null,
        end_date: endDate ? endDate.toISOString().split('T')[0] : null,
        primary_color: `${primaryColor.h},${primaryColor.s},${primaryColor.l}`,
        secondary_color: secondaryColor ? `${secondaryColor.h},${secondaryColor.s},${secondaryColor.l}` : null,
        background_style: backgroundStyle,
        avatar_styles: selectedStyles,
        user_id: user.id
      };

      let savedEventId = eventId;

      if (isEditing) {
        // Update existing event
        const { error: updateError } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', eventId)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
        toast({
          title: "Success",
          description: "Event updated successfully!"
        });
      } else {
        // Create new event
        const { data: newEvent, error: insertError } = await supabase
          .from('events')
          .insert([eventData])
          .select('id')
          .single();

        if (insertError) throw insertError;
        savedEventId = newEvent.id;
        toast({
          title: "Success",
          description: "Event created successfully!"
        });
      }

      // Save screen settings
      await saveScreenSettingsToDatabase(savedEventId, screenSettings);

      // Also save to localStorage for kiosk functionality
      const setupConfig = {
        eventName,
        eventLocation,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        selectedStyles,
        primaryColor,
        secondaryColor,
        backgroundStyle,
        screenSettings,
        setupCompleted: true,
        setupDate: new Date().toISOString(),
        eventId: savedEventId
      };
      
      localStorage.setItem('kioskSetupConfig', JSON.stringify(setupConfig));
      
      // Clear session storage when successfully completed
      sessionStorage.clear();
      
      // Navigate to kiosk with event context
      navigate(`/kiosk?event=${savedEventId}`);
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Save Failed",
        description: isEditing ? "Failed to update event" : "Failed to create event",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [eventName, eventLocation, startDate, endDate, selectedStyles, primaryColor, secondaryColor, backgroundStyle, screenSettings, navigate, user, toast, isEditing, eventId]);

  const saveScreenSettingsToDatabase = async (eventId: string, settings: ScreenSettings) => {
    // Delete existing screen settings for this event
    await supabase
      .from('event_screen_settings')
      .delete()
      .eq('event_id', eventId);

    // Insert new screen settings
    const screenSettingsData = Object.entries(settings).map(([screenKey, setting]) => ({
      event_id: eventId,
      screen_key: screenKey,
      text_color: setting.textColorHex,
      background_color: setting.backgroundColor,
      background_image: setting.backgroundImageDataUrl || null,
      overlay_opacity: setting.overlayOpacity,
      title: setting.title || null
    }));

    if (screenSettingsData.length > 0) {
      const { error } = await supabase
        .from('event_screen_settings')
        .insert(screenSettingsData);

      if (error) throw error;
    }
  };

  const EventDetails = useMemo(() => (
    <StepContainer>
      <EventDetailsForm
        initialEventName={eventName}
        initialEventLocation={eventLocation}
        onEventNameChange={handleEventNameChange}
        onEventLocationChange={handleEventLocationChange}
        initialStartDate={startDate}
        initialEndDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
      />
    </StepContainer>
  ), [eventName, eventLocation, startDate, endDate, handleEventNameChange, handleEventLocationChange, handleStartDateChange, handleEndDateChange]);

  const StylesScreen = useMemo(() => (
    <SplitScreenStep
      screenKey="styles"
      screenSettings={screenSettings.styles}
      allScreenSettings={screenSettings}
      onScreenChange={(changes) => handleScreenChange('styles', changes)}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      backgroundStyle={backgroundStyle}
      title="Customize Avatar Selection Screen"
      description="Design how users choose their avatar style"
      eventName={eventName}
    />
  ), [screenSettings, handleScreenChange, primaryColor, secondaryColor, backgroundStyle, eventName]);

  const CameraScreen = useMemo(() => (
    <SplitScreenStep
      screenKey="camera"
      screenSettings={screenSettings.camera}
      allScreenSettings={screenSettings}
      onScreenChange={(changes) => handleScreenChange('camera', changes)}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      backgroundStyle={backgroundStyle}
      title="Customize Camera Screen"
      description="Style the photo capture interface"
      eventName={eventName}
    />
  ), [screenSettings, handleScreenChange, primaryColor, secondaryColor, backgroundStyle, eventName]);

  const CountdownScreen = useMemo(() => (
    <SplitScreenStep
      screenKey="countdown"
      screenSettings={screenSettings.countdown}
      allScreenSettings={screenSettings}
      onScreenChange={(changes) => handleScreenChange('countdown', changes)}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      backgroundStyle={backgroundStyle}
      title="Customize Countdown Screen"
      description="Design the pre-photo countdown timer"
      eventName={eventName}
    />
  ), [screenSettings, handleScreenChange, primaryColor, secondaryColor, backgroundStyle, eventName]);

  const LoadingScreen = useMemo(() => (
    <SplitScreenStep
      screenKey="loading"
      screenSettings={screenSettings.loading}
      allScreenSettings={screenSettings}
      onScreenChange={(changes) => handleScreenChange('loading', changes)}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      backgroundStyle={backgroundStyle}
      title="Customize Loading Screen"
      description="Style the AI generation progress display"
      eventName={eventName}
    />
  ), [screenSettings, handleScreenChange, primaryColor, secondaryColor, backgroundStyle, eventName]);

  const ResultScreen = useMemo(() => (
    <SplitScreenStep
      screenKey="result"
      screenSettings={screenSettings.result}
      allScreenSettings={screenSettings}
      onScreenChange={(changes) => handleScreenChange('result', changes)}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      backgroundStyle={backgroundStyle}
      title="Customize Result Screen"
      description="Design how finished avatars are displayed"
      eventName={eventName}
    />
  ), [screenSettings, handleScreenChange, primaryColor, secondaryColor, backgroundStyle, eventName]);

  const renderStep = () => {
    switch (step) {
      case 0: return <Welcome onNext={next} />;
      case 1: return EventDetails;
      case 2: return <ThemeColors 
        primaryColor={primaryColor}
        setPrimaryColor={setPrimaryColor}
        secondaryColor={secondaryColor}
        setSecondaryColor={setSecondaryColor}
        backgroundStyle={backgroundStyle}
        setBackgroundStyle={setBackgroundStyle}
      />;
      case 3: return StylesScreen;
      case 4: return CameraScreen;
      case 5: return CountdownScreen;
      case 6: return LoadingScreen;
      case 7: return ResultScreen;
      case 8: return <StylesAndFinish
        selectedStyles={selectedStyles}
        toggleStyle={toggleStyle}
        canFinish={canFinish}
        handleFinish={handleFinish}
        loading={loading}
        isEditing={isEditing}
      />;
      default: return <Welcome onNext={next} />;
    }
  };

  const handleStepClick = useCallback((targetStep: number) => {
    if (targetStep <= step || currentStepValidation.canProceed) {
      setStep(targetStep);
    }
  }, [step, currentStepValidation, setStep]);

  // Show loading while auth is checking or initial data is loading
  if (authLoading || (isEditing && !initialLoadComplete)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackdrop />
      
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SetupProgress 
            current={step} 
            total={StepsTotal} 
            labels={stepLabels}
            onStepClick={handleStepClick}
          />
          
          <div className="mt-8">
            {renderStep()}
          </div>

          {/* Validation Messages */}
          {!currentStepValidation.canProceed && currentStepValidation.errors.length > 0 && (
            <Alert className="mt-6 border-amber-500/20 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                {currentStepValidation.errors[0]}
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={back}
              disabled={step === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Step {step + 1} of {StepsTotal}
            </div>
            
            {step < StepsTotal - 1 ? (
              <Button onClick={next} className="flex items-center gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleFinish} 
                disabled={!canFinish || loading}
                className="flex items-center gap-2"
              >
                {loading ? "Saving..." : (isEditing ? "Update" : "Finish")}
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizardOptimized;