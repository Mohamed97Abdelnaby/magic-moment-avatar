import { useState, useEffect, useCallback } from "react";
import { HSLColor, generateColorVariants, parseHslString, hexToHsl } from "@/lib/colorUtils";
import { supabase } from "@/integrations/supabase/client";
import { ScreenSettings, loadScreenSettings, getDefaultScreenSettings } from "@/lib/kioskSettings";

interface UseKioskThemeProps {
  isDemo?: boolean;
  demoSettings?: ScreenSettings;
  eventId?: string;
}

export const useKioskTheme = ({ isDemo, demoSettings, eventId }: UseKioskThemeProps) => {
  const [eventSelectedStyles, setEventSelectedStyles] = useState<string[]>([]);
  const [eventColors, setEventColors] = useState<{
    primary: HSLColor | null;
    secondary: HSLColor | null;
  }>({
    primary: null,
    secondary: null
  });
  
  const [screens, setScreens] = useState<ScreenSettings>(() => {
    if (isDemo) {
      // DEMO MODE: Always use static Calm Dark Blue theme - no external settings allowed
      const staticDemoTheme = {
        textColorHex: "#f8fafc",
        textColorHsl: "210 40% 98%",
        backgroundColor: "hsl(222, 47%, 11%)", // Static calm dark blue background
        backgroundImageDataUrl: null,
        overlayOpacity: 0.6
      };
      
      // Return completely static demo settings - ignore demoSettings prop
      return {
        styles: {
          ...staticDemoTheme,
          title: "Choose your Avatar"
        },
        camera: {
          ...staticDemoTheme,
          title: "Strike Your Pose!"
        },
        'photo-preview': {
          ...staticDemoTheme,
          title: "Perfect Shot!"
        },
        countdown: {
          ...staticDemoTheme,
          title: "Perfect! Get ready..."
        },
        loading: {
          ...staticDemoTheme,
          title: "Creating Your Avatar..."
        },
        result: {
          ...staticDemoTheme,
          title: "Amazing! Your Avatar is Ready!"
        }
      };
    }
    return loadScreenSettings();
  });

  // Load event data and selected avatar styles - SKIP in demo mode completely
  useEffect(() => {
    if (!isDemo && eventId) {
      const loadEventData = async () => {
        try {
          console.log('Loading event data for eventId:', eventId);
          const { data: eventData, error } = await supabase
            .from('events')
            .select('avatar_styles, primary_color, secondary_color')
            .eq('id', eventId)
            .single();

          if (!error && eventData) {
            console.log('Event data loaded:', eventData);
            
            if (eventData.avatar_styles) {
              const validStyles = eventData.avatar_styles.filter((style: string) => 
                ['farmer', 'pharaonic', 'basha', 'beach', 'pixar'].includes(style)
              );
              setEventSelectedStyles(validStyles);
            }

            const primaryColor = eventData.primary_color ? parseHslString(eventData.primary_color) : null;
            const secondaryColor = eventData.secondary_color ? parseHslString(eventData.secondary_color) : null;
            console.log('Parsed colors:', { primaryColor, secondaryColor });
            setEventColors({ primary: primaryColor, secondary: secondaryColor });

            if (primaryColor) {
              setTimeout(() => {
                console.log('Applying scoped event theme...');
                applyScopedEventTheme(primaryColor, secondaryColor);
              }, 100);
            }
          }
        } catch (error) {
          console.error('Error loading event data:', error);
        }
      };
      loadEventData();
    }
  }, [isDemo, eventId]);

  // Apply event theme scoped to kiosk container only
  const applyScopedEventTheme = useCallback((primaryColor: HSLColor, secondaryColor?: HSLColor | null) => {
    const kioskContainer = document.querySelector('.kiosk-isolated');
    console.log('applyScopedEventTheme called:', { primaryColor, secondaryColor, kioskContainer });
    if (!kioskContainer) {
      console.error('No .kiosk-isolated container found!');
      return;
    }

    const primaryVariants = generateColorVariants(primaryColor);
    const secondaryVariants = secondaryColor ? generateColorVariants(secondaryColor) : primaryVariants;

    const style = kioskContainer as HTMLElement;
    
    const primaryHsl = `${primaryColor.h} ${primaryColor.s}% ${primaryColor.l}%`;
    const primaryForegroundHsl = `${primaryVariants[50].h} ${primaryVariants[50].s}% ${primaryVariants[50].l}%`;
    
    console.log('Setting kiosk theme variables:', { primaryHsl, primaryForegroundHsl });
    
    style.style.setProperty('--kiosk-primary', primaryHsl);
    style.style.setProperty('--kiosk-primary-foreground', primaryForegroundHsl);
    
    const secColor = secondaryColor || primaryColor;
    style.style.setProperty('--kiosk-secondary', `${secColor.h} ${secColor.s}% ${secColor.l}%`);
    style.style.setProperty('--kiosk-secondary-foreground', primaryForegroundHsl);
    
    style.style.setProperty('--kiosk-accent', `${primaryColor.h} ${primaryColor.s}% ${Math.min(95, primaryColor.l + 25)}%`);
    style.style.setProperty('--kiosk-accent-foreground', `${primaryColor.h} ${primaryColor.s}% ${Math.max(15, primaryColor.l - 25)}%`);
    
    style.style.setProperty('--kiosk-muted', `${primaryColor.h} ${Math.max(5, primaryColor.s - 20)}% ${Math.min(95, primaryColor.l + 30)}%`);
    style.style.setProperty('--kiosk-muted-foreground', `${primaryColor.h} ${Math.max(10, primaryColor.s - 10)}% ${Math.max(25, primaryColor.l - 20)}%`);
    
    style.style.setProperty('--kiosk-background', `${primaryColor.h} ${Math.max(2, primaryColor.s - 30)}% ${Math.min(98, primaryColor.l + 40)}%`);
    style.style.setProperty('--kiosk-foreground', `${primaryColor.h} ${Math.max(10, primaryColor.s - 10)}% ${Math.max(5, primaryColor.l - 35)}%`);
    
    style.style.setProperty('--kiosk-border', `${primaryColor.h} ${Math.max(5, primaryColor.s - 15)}% ${Math.min(90, primaryColor.l + 20)}%`);
    style.style.setProperty('--kiosk-input', `${primaryColor.h} ${Math.max(5, primaryColor.s - 25)}% ${Math.min(95, primaryColor.l + 35)}%`);
    style.style.setProperty('--kiosk-ring', `${primaryColor.h} ${primaryColor.s}% ${primaryColor.l}%`);
    
    style.style.setProperty('--kiosk-gradient-primary', `linear-gradient(135deg, hsl(${primaryColor.h} ${primaryColor.s}% ${primaryColor.l}%), hsl(${primaryVariants[300].h} ${primaryVariants[300].s}% ${primaryVariants[300].l}%))`);
    if (secondaryColor) {
      style.style.setProperty('--kiosk-gradient-secondary', `linear-gradient(135deg, hsl(${primaryColor.h} ${primaryColor.s}% ${primaryColor.l}%), hsl(${secondaryColor.h} ${secondaryColor.s}% ${secondaryColor.l}%))`);
    }
    
    console.log('Kiosk theme applied successfully');
  }, []);

  // Load per-screen settings - SKIP in demo mode completely
  useEffect(() => {
    if (!isDemo) {
      if (eventId) {
        const loadEventSettings = async () => {
          try {
            const { data: screenData, error } = await supabase
              .from('event_screen_settings')
              .select('*')
              .eq('event_id', eventId);

            if (!error && screenData) {
              const loadedSettings = { ...getDefaultScreenSettings() };
              screenData.forEach(setting => {
                if (setting.screen_key in loadedSettings) {
                  const textColorHex = setting.text_color || '#ffffff';
                  const textColorHsl = textColorHex ? hexToHsl(textColorHex) : null;
                  
                  loadedSettings[setting.screen_key as keyof ScreenSettings] = {
                    textColorHex,
                    textColorHsl: textColorHsl ? `${textColorHsl.h} ${textColorHsl.s}% ${textColorHsl.l}%` : undefined,
                    backgroundImageDataUrl: setting.background_image || null,
                    backgroundColor: setting.background_color || undefined,
                    overlayOpacity: Number(setting.overlay_opacity) || 0.6,
                    title: setting.title || ''
                  };
                }
              });
              setScreens(loadedSettings);
            } else {
              const localSettings = loadScreenSettings();
              setScreens(localSettings);
            }
          } catch (error) {
            console.error('Error loading event settings:', error);
            const localSettings = loadScreenSettings();
            setScreens(localSettings);
          }
        };
        
        loadEventSettings();
      } else {
        const localSettings = loadScreenSettings();
        setScreens(localSettings);
      }
    }
  }, [isDemo, eventId]);

  // Helper function to get text color with proper hierarchy
  const getTextColor = useCallback((screenKey: keyof ScreenSettings) => {
    const screen = screens[screenKey];
    
    // First check for HSL string format
    if (screen?.textColorHsl && screen.textColorHsl.trim() !== '') {
      return `hsl(${screen.textColorHsl})`;
    }
    
    // Then check for hex format and convert
    if (screen?.textColorHex && screen.textColorHex.trim() !== '') {
      const hslColor = hexToHsl(screen.textColorHex);
      if (hslColor) {
        return `hsl(${hslColor.h} ${hslColor.s}% ${hslColor.l}%)`;
      }
    }
    
    // Fallback to event primary color
    if (!isDemo && eventColors.primary) {
      return `hsl(${eventColors.primary.h} ${eventColors.primary.s}% ${eventColors.primary.l}%)`;
    }
    
    return undefined;
  }, [screens, isDemo, eventColors.primary]);

  const getIsolatedBackgroundStyle = useCallback((screenKey: keyof ScreenSettings | 'photo-preview') => {
    // Map photo-preview to camera screen settings
    const actualScreenKey = screenKey === 'photo-preview' ? 'camera' : screenKey;
    const currentScreen = screens[actualScreenKey] || screens.styles;
    
    if (currentScreen.backgroundImageDataUrl) {
      return {
        backgroundColor: undefined,
        backgroundImage: `url(${currentScreen.backgroundImageDataUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    
    if (currentScreen.backgroundColor && currentScreen.backgroundColor.trim() !== '') {
      return {
        backgroundColor: currentScreen.backgroundColor,
        backgroundImage: undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    
    if (!isDemo && eventColors.secondary) {
      return {
        backgroundColor: `hsl(${eventColors.secondary.h} ${eventColors.secondary.s}% ${Math.min(25, eventColors.secondary.l)}%)`,
        backgroundImage: undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    
    return {
      backgroundColor: '#1a1a2e',
      backgroundImage: undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  }, [screens, isDemo, eventColors.secondary]);

  const getBackgroundColor = useCallback((screenKey: keyof ScreenSettings) => {
    const screen = screens[screenKey];
    
    if (screen?.backgroundColor && screen.backgroundColor.trim() !== '') {
      return screen.backgroundColor;
    }
    
    if (!isDemo && eventColors.secondary) {
      return `hsl(${eventColors.secondary.h} ${eventColors.secondary.s}% ${Math.min(25, eventColors.secondary.l)}%)`;
    }
    
    return 'hsl(222 47% 11%)'; // Default calm dark blue background
  }, [screens, isDemo, eventColors.secondary]);

  return {
    eventSelectedStyles,
    eventColors,
    screens,
    getTextColor,
    getIsolatedBackgroundStyle,
    getBackgroundColor,
    applyScopedEventTheme
  };
};