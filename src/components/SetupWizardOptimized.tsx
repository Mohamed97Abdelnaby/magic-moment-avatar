import { useEffect, useMemo, useState, useCallback, useRef, memo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, CheckCircle2, Palette, Sparkles, Eye, AlertTriangle } from "lucide-react";
import ColorPicker from "@/components/ColorPicker";
import ScreenAppearanceEditor from "@/components/ScreenAppearanceEditor";
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

// Memoized animated backdrop
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
AnimatedBackdrop.displayName = "AnimatedBackdrop";

// Optimized state persistence hook
const useStateWithPersistence = <T,>(key: string, defaultValue: T, debounceMs = 300) => {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = sessionStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const setStateWithPersistence = useCallback((newState: T | ((prev: T) => T)) => {
    setState(prev => {
      const nextState = typeof newState === 'function' ? (newState as (prev: T) => T)(prev) : newState;
      
      // Debounced save to sessionStorage
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        try {
          sessionStorage.setItem(key, JSON.stringify(nextState));
        } catch (error) {
          console.warn('Failed to save to sessionStorage:', error);
        }
      }, debounceMs);
      
      return nextState;
    });
  }, [key, debounceMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return [state, setStateWithPersistence] as const;
};

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

  // Optimized state with persistence
  const [step, setStep] = useStateWithPersistence('setupWizard_step', 0);
  const [dir, setDir] = useState<Dir>("forward");
  const [loading, setLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Core state with persistence for better UX
  const [eventName, setEventName] = useStateWithPersistence('setupWizard_eventName', "");
  const [eventLocation, setEventLocation] = useStateWithPersistence('setupWizard_eventLocation', "");
  const [startDate, setStartDate] = useStateWithPersistence<Date | undefined>('setupWizard_startDate', undefined);
  const [endDate, setEndDate] = useStateWithPersistence<Date | undefined>('setupWizard_endDate', undefined);
  const [selectedStyles, setSelectedStyles] = useStateWithPersistence<string[]>('setupWizard_selectedStyles', []);
  const [primaryColor, setPrimaryColor] = useStateWithPersistence<HSLColor>('setupWizard_primaryColor', calmBlue);
  const [secondaryColor, setSecondaryColor] = useStateWithPersistence<HSLColor | null>('setupWizard_secondaryColor', null);
  const [backgroundStyle, setBackgroundStyle] = useStateWithPersistence<'solid' | 'gradient' | 'default'>('setupWizard_backgroundStyle', "default");
  const [screenSettings, setScreenSettings] = useStateWithPersistence<ScreenSettings>('setupWizard_screenSettings', getDefaultScreenSettings());
  const [previewScreen, setPreviewScreen] = useStateWithPersistence<ScreenKey>('setupWizard_previewScreen', 'styles');

  // Stable memoized validation
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

  // Load existing event data when editing (optimized)
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

        // Batch state updates to prevent multiple re-renders
        setEventName(eventData.name);
        setEventLocation(eventData.location || "");
        
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
  }, [eventId, user, initialLoadComplete, navigate, toast, setEventName, setEventLocation, setStartDate, setEndDate, setSelectedStyles, setPrimaryColor, setSecondaryColor, setBackgroundStyle, setScreenSettings]);

  // Load saved screen settings for new events
  useEffect(() => {
    if (!isEditing && !initialLoadComplete) {
      setScreenSettings(loadScreenSettings());
      setInitialLoadComplete(true);
    }
  }, [isEditing, initialLoadComplete, setScreenSettings]);

  // Optimized localStorage save for screen settings
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

  // Optimized screen change handler
  const handleScreenChange = useCallback((screenKey: ScreenKey, next: ScreenAppearance) => {
    setScreenSettings(prev => ({ ...prev, [screenKey]: next }));
    debouncedSave();
  }, [debouncedSave, setScreenSettings]);

  // Stable navigation handlers
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
    setStep(s => Math.min(StepsTotal - 1, s + 1));
  }, [currentStepValidation, toast, setStep]);
  
  const back = useCallback(() => { 
    setDir("backward"); 
    setStep(s => Math.max(0, s - 1)); 
  }, [setStep]);

  // Avatar styles (memoized)
  const avatarStyles = useMemo(() => [
    { id: "farmer", name: "Egyptian Farmer", description: "Traditional Rural Life", preview: "🌾" },
    { id: "pharaonic", name: "Ancient Pharaoh", description: "Royal Dynasty Style", preview: "👑" },
    { id: "basha", name: "El Basha Style", description: "Elite Noble Fashion", preview: "🎩" },
    { id: "beach", name: "Beach Vibes", description: "Summer Mediterranean", preview: "🏖️" },
    { id: "pixar", name: "Pixar Style", description: "3D Animated Magic", preview: "🎭" },
  ], []);

  const toggleStyle = useCallback((styleId: string) => {
    setSelectedStyles(prev => prev.includes(styleId) ? prev.filter(id => id !== styleId) : [...prev, styleId]);
  }, [setSelectedStyles]);

  // Event details update handlers - stable callbacks
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

      // Clear session storage after successful save
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('setupWizard_')) {
          sessionStorage.removeItem(key);
        }
      });

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

  // Memoized step container
  const StepContainer = memo(({ children }: { children: React.ReactNode }) => (
    <section className={`relative transition-all duration-500 ${dir === 'forward' ? 'animate-fade-in' : 'animate-fade-in'}`}>
      {children}
    </section>
  ));
  StepContainer.displayName = "StepContainer";

  // Memoized welcome component
  const Welcome = memo(() => (
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
  ));
  Welcome.displayName = "Welcome";

  // Memoized event details component
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

  // Memoized theme colors component
  const ThemeColors = memo(() => (
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
                <input
                  type="checkbox"
                  id="useSecondaryColor"
                  checked={!!secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.checked ? { ...primaryColor } : null)}
                  className="rounded"
                />
                <Label htmlFor="useSecondaryColor">Enable secondary color</Label>
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
              <CardTitle className="flex items-center gap-2 text-lg"><Eye className="h-5 w-5" />Background Style</CardTitle>
              <CardDescription>Choose how colors blend in the background</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={backgroundStyle} onValueChange={(value) => setBackgroundStyle(value as 'solid' | 'gradient' | 'default')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="solid">Solid Color</SelectItem>
                  <SelectItem value="gradient">Gradient</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    </StepContainer>
  ));
  ThemeColors.displayName = "ThemeColors";

  // Memoized styles and finish component
  const StylesAndFinish = memo(() => (
    <StepContainer>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Choose Avatar Styles</h2>
          <p className="text-muted-foreground">Select the styles you want available in your kiosk</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {avatarStyles.map((style) => (
            <Card 
              key={style.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedStyles.includes(style.id) 
                  ? 'ring-2 ring-primary shadow-glow bg-primary/5' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => toggleStyle(style.id)}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{style.preview}</div>
                <h3 className="font-semibold mb-1">{style.name}</h3>
                <p className="text-sm text-muted-foreground">{style.description}</p>
                {selectedStyles.includes(style.id) && (
                  <CheckCircle2 className="h-5 w-5 text-primary mt-2 mx-auto" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            size="lg" 
            variant="hero" 
            onClick={handleFinish} 
            disabled={!canFinish || loading}
            className="px-10"
          >
            {loading ? "Saving..." : isEditing ? "Update Event" : "Create Event"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </StepContainer>
  ));
  StylesAndFinish.displayName = "StylesAndFinish";

  // Memoized step renderer
  const renderStep = useCallback(() => {
    switch (step) {
      case 0: return <Welcome />;
      case 1: return EventDetails;
      case 2: return <ThemeColors />;
      case 3: return (
        <SplitScreenStep
          title="Styles Screen"
          screenKey="styles"
          description="Customize how the style selection screen appears"
          screenSettings={screenSettings.styles}
          allScreenSettings={screenSettings}
          onScreenChange={(changes) => handleScreenChange('styles', { ...screenSettings.styles, ...changes })}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          backgroundStyle={backgroundStyle}
          eventName={eventName}
        />
      );
      case 4: return (
        <SplitScreenStep
          title="Camera Screen"
          screenKey="camera"
          description="Customize how the camera screen appears"
          screenSettings={screenSettings.camera}
          allScreenSettings={screenSettings}
          onScreenChange={(changes) => handleScreenChange('camera', { ...screenSettings.camera, ...changes })}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          backgroundStyle={backgroundStyle}
          eventName={eventName}
        />
      );
      case 5: return (
        <SplitScreenStep
          title="Countdown Screen"
          screenKey="countdown"
          description="Customize how the countdown screen appears"
          screenSettings={screenSettings.countdown}
          allScreenSettings={screenSettings}
          onScreenChange={(changes) => handleScreenChange('countdown', { ...screenSettings.countdown, ...changes })}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          backgroundStyle={backgroundStyle}
          eventName={eventName}
        />
      );
      case 6: return (
        <SplitScreenStep
          title="Loading Screen"
          screenKey="loading"
          description="Customize how the loading screen appears"
          screenSettings={screenSettings.loading}
          allScreenSettings={screenSettings}
          onScreenChange={(changes) => handleScreenChange('loading', { ...screenSettings.loading, ...changes })}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          backgroundStyle={backgroundStyle}
          eventName={eventName}
        />
      );
      case 7: return (
        <SplitScreenStep
          title="Result Screen"
          screenKey="result"
          description="Customize how the result screen appears"
          screenSettings={screenSettings.result}
          allScreenSettings={screenSettings}
          onScreenChange={(changes) => handleScreenChange('result', { ...screenSettings.result, ...changes })}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          backgroundStyle={backgroundStyle}
          eventName={eventName}
        />
      );
      case 8: return <StylesAndFinish />;
      default: return <Welcome />;
    }
  }, [step, EventDetails, screenSettings, handleScreenChange, primaryColor, secondaryColor, backgroundStyle, eventName]);

  // Show loading state during auth check
  if (authLoading || (!isEditing && !initialLoadComplete)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleStepClick = useCallback((stepIndex: number) => {
    setStep(stepIndex);
  }, [setStep]);

  return (
    <main className="min-h-screen relative bg-background">
      <AnimatedBackdrop />
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        <SetupProgress 
          total={StepsTotal} 
          current={step} 
          labels={stepLabels} 
          onStepClick={handleStepClick}
        />
        
        <div className="max-w-4xl mx-auto">
          {renderStep()}
          
          {!currentStepValidation.canProceed && currentStepValidation.errors.length > 0 && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {currentStepValidation.errors[0]}
              </AlertDescription>
            </Alert>
          )}
          
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
            
            {step < StepsTotal - 1 && (
              <Button onClick={next} className="flex items-center gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            
            {step === StepsTotal - 1 && (
              <Button 
                onClick={handleFinish} 
                disabled={!canFinish || loading}
                className="flex items-center gap-2"
              >
                {loading ? "Saving..." : isEditing ? "Update Event" : "Finish"}
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default SetupWizardOptimized;