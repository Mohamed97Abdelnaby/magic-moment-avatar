import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, ArrowLeft, ArrowRight, RotateCcw, Send, Printer, Sparkles, Heart, Home } from "lucide-react";
import AIRobotDrawing from "./AIRobotDrawing";
import QuoteDisplay from "./QuoteDisplay";
import CameraCapture from "./CameraCapture";
import PhotoPreview from "./PhotoPreview";
import { loadScreenSettings, getDefaultScreenSettings, type ScreenSettings } from "@/lib/kioskSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KioskInterfaceProps {
  isDemo?: boolean;
  demoSettings?: ScreenSettings;
  eventId?: string;
}

const ParticleField = ({ count = 12 }: { count?: number }) => {
  return (
    <div className="particles">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: 'hsl(var(--gradient-particle))',
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
            animation: 'float 8s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  );
};

const ConfettiExplosion = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-confetti-fall"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

const NeuralNetwork = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg width="100%" height="100%" className="animate-neural-pulse">
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i}>
            <circle
              cx={`${20 + (i % 4) * 20}%`}
              cy={`${30 + Math.floor(i / 4) * 20}%`}
              r="3"
              fill="hsl(var(--primary))"
              opacity="0.6"
            />
            {i < 8 && (
              <line
                x1={`${20 + (i % 4) * 20}%`}
                y1={`${30 + Math.floor(i / 4) * 20}%`}
                x2={`${20 + ((i + 1) % 4) * 20}%`}
                y2={`${30 + Math.floor((i + 1) / 4) * 20}%`}
                stroke="hsl(var(--primary))"
                strokeWidth="1"
                opacity="0.4"
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

const KioskInterface = ({ isDemo = false, demoSettings, eventId }: KioskInterfaceProps = {}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'styles' | 'camera' | 'photo-preview' | 'countdown' | 'loading' | 'result'>('styles');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [countdown, setCountdown] = useState(3);
  const [showConfetti, setShowConfetti] = useState(false);
  const [stageAnimationKey, setStageAnimationKey] = useState(0);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const [whatsappForm, setWhatsappForm] = useState({
    phoneNumber: '',
    message: 'Check out my special AI avatar gift! 🎁✨',
    instanceId: 'instance136415'
  });
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [eventSelectedStyles, setEventSelectedStyles] = useState<string[]>([]);
  const [screens, setScreens] = useState<ScreenSettings>(() => {
    if (isDemo && demoSettings) return demoSettings;
    if (isDemo) {
      // Return beautiful static demo settings
      const demoScreens = getDefaultScreenSettings();
      return {
        ...demoScreens,
        styles: {
          ...demoScreens.styles,
          title: "Welcome to AvatarMoment",
          textColorHsl: "0 0% 100%"
        },
        camera: {
          ...demoScreens.camera,
          title: "Strike Your Pose!",
          textColorHsl: "0 0% 100%"
        },
        countdown: {
          ...demoScreens.countdown,
          title: "Perfect! Get ready...",
          textColorHsl: "0 0% 100%"
        },
        loading: {
          ...demoScreens.loading,
          title: "Creating Your Avatar...",
          textColorHsl: "0 0% 100%"
        },
        result: {
          ...demoScreens.result,
          title: "Amazing! Your Avatar is Ready!",
          textColorHsl: "0 0% 100%"
        }
      };
    }
    return loadScreenSettings();
  });

  // Quote collections for different stages
  const countdownQuotes = [
    "Take a deep breath and let your authentic self shine...",
    "In stillness, we find our truest expression...",
    "Every moment of pause is a moment of possibility...",
    "Breathe in confidence, breathe out perfection..."
  ];

  const generationQuotes = [
    "Art is not what you see, but what you make others see...",
    "Every artist dips their brush in their soul...",
    "Creativity takes courage - you're being brave...",
    "Your unique story is being painted right now...",
    "In the dance of pixels and imagination, magic happens..."
  ];

  // Avatar styles with associated color themes
  const allAvatarStyles = [
    { 
      id: "farmer", 
      name: "Egyptian Farmer", 
      preview: "🌾", 
      description: "Traditional Rural Life",
      theme: {
        textColorHsl: "35 95% 85%", // Warm golden text
        backgroundColor: "#2a4d3a", // Deep green
        overlayOpacity: 0.4
      }
    },
    { 
      id: "pharaonic", 
      name: "Ancient Pharaoh", 
      preview: "👑", 
      description: "Royal Dynasty Style",
      theme: {
        textColorHsl: "45 100% 90%", // Rich golden text
        backgroundColor: "#1a1a3e", // Deep royal blue
        overlayOpacity: 0.5
      }
    },
    { 
      id: "basha", 
      name: "El Basha Style", 
      preview: "🎩", 
      description: "Elite Noble Fashion",
      theme: {
        textColorHsl: "0 0% 95%", // Elegant white
        backgroundColor: "#2d1b3d", // Deep purple
        overlayOpacity: 0.45
      }
    },
    { 
      id: "beach", 
      name: "Beach Vibes", 
      preview: "🏖️", 
      description: "Summer Mediterranean",
      theme: {
        textColorHsl: "200 100% 95%", // Light blue-white
        backgroundColor: "#1e3a8a", // Ocean blue
        overlayOpacity: 0.35
      }
    },
    { 
      id: "pixar", 
      name: "Pixar Style", 
      preview: "🎭", 
      description: "3D Animated Magic",
      theme: {
        textColorHsl: "0 0% 100%", // Pure white
        backgroundColor: "#7c3aed", // Vibrant purple
        overlayOpacity: 0.4
      }
    },
  ];

  // Filter avatar styles based on event selection or show all in demo mode
  const avatarStyles = isDemo ? allAvatarStyles : 
    eventSelectedStyles.length > 0 ? 
      allAvatarStyles.filter(style => eventSelectedStyles.includes(style.id)) : 
      allAvatarStyles;

useEffect(() => {
  setStageAnimationKey(prev => prev + 1);
}, [currentStep]);

// Load event data and selected avatar styles
useEffect(() => {
  if (!isDemo && eventId) {
    const loadEventData = async () => {
      try {
        const { data: eventData, error } = await supabase
          .from('events')
          .select('avatar_styles')
          .eq('id', eventId)
          .single();

        if (!error && eventData?.avatar_styles) {
          // Filter out legacy styles that don't have prompts
          const validStyles = eventData.avatar_styles.filter((style: string) => 
            ['farmer', 'pharaonic', 'basha', 'beach', 'pixar'].includes(style)
          );
          setEventSelectedStyles(validStyles);
        }
      } catch (error) {
        console.error('Error loading event data:', error);
      }
    };
    loadEventData();
  }
}, [isDemo, eventId]);

// Load per-screen settings (only if not in demo mode)
useEffect(() => {
  if (!isDemo) {
    if (eventId) {
      // Load event-specific settings from database
      const loadEventSettings = async () => {
        try {
          // Load screen settings for this event
          const { data: screenData, error } = await supabase
            .from('event_screen_settings')
            .select('*')
            .eq('event_id', eventId);

          if (!error && screenData) {
            const loadedSettings = { ...getDefaultScreenSettings() };
            screenData.forEach(setting => {
              if (setting.screen_key in loadedSettings) {
                loadedSettings[setting.screen_key as keyof ScreenSettings] = {
                  textColorHex: setting.text_color || '#ffffff',
                  backgroundImageDataUrl: setting.background_image || null,
                  overlayOpacity: Number(setting.overlay_opacity) || 0.6,
                  title: setting.title || ''
                };
              }
            });
            setScreens(loadedSettings);
          } else {
            // Fallback to localStorage if no database settings found
            setScreens(loadScreenSettings());
          }
        } catch (error) {
          console.error('Error loading event settings:', error);
          // Fallback to localStorage on error
          setScreens(loadScreenSettings());
        }
      };
      
      loadEventSettings();
    } else {
      // Load from localStorage if no eventId
      setScreens(loadScreenSettings());
    }
  }
}, [isDemo, eventId]);

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    
    // Apply the theme colors from the selected style
    const selectedStyleData = allAvatarStyles.find(style => style.id === styleId);
    if (selectedStyleData?.theme) {
      const updatedScreens = { ...screens };
      
      // Update all screen themes with the selected style colors
      Object.keys(updatedScreens).forEach(screenKey => {
        updatedScreens[screenKey as keyof ScreenSettings] = {
          ...updatedScreens[screenKey as keyof ScreenSettings],
          textColorHsl: selectedStyleData.theme.textColorHsl,
          backgroundColor: selectedStyleData.theme.backgroundColor,
          overlayOpacity: selectedStyleData.theme.overlayOpacity,
        };
      });
      
      setScreens(updatedScreens);
    }
  };

  const handleStartCamera = () => {
    setCurrentStep('camera');
  };

  const handlePhotoCapture = (imageData: string) => {
    setCapturedPhoto(imageData);
    setCurrentStep('photo-preview');
  };

  const handleConfirmPhoto = () => {
    setCurrentStep('countdown');
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setCurrentStep('loading');
          generateAvatar();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const generateAvatar = async () => {
    if (!capturedPhoto || !selectedStyle) {
      setGenerationError('Missing photo or style selection');
      setCurrentStep('result');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      console.log('Starting avatar generation...');
      const { data, error } = await supabase.functions.invoke('generate-avatar', {
        body: {
          image: capturedPhoto,
          style: selectedStyle
        }
      });

      if (error) {
        console.error('Avatar generation error:', error);
        setGenerationError('Failed to generate avatar. Please try again.');
      } else if (data?.generatedImage) {
        console.log('Avatar generated successfully');
        setGeneratedAvatar(data.generatedImage);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      } else {
        setGenerationError('No avatar was generated. Please try again.');
      }
    } catch (error) {
      console.error('Avatar generation failed:', error);
      setGenerationError('Failed to generate avatar. Please try again.');
    } finally {
      setIsGenerating(false);
      setCurrentStep('result');
    }
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setCurrentStep('camera');
  };

  const handleSendWhatsApp = async () => {
    if (!capturedPhoto) {
      toast.error("No photo to send!");
      return;
    }

    if (!whatsappForm.phoneNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    console.log('Starting WhatsApp send process...');
    setIsSendingWhatsApp(true);

    try {
      console.log('Preparing image for WhatsApp...');
      
      // Use the generated avatar if available, otherwise fallback to original photo
      const imageToSend = generatedAvatar || capturedPhoto;

      console.log('Invoking send-whatsapp-image function...');
      const { data, error } = await supabase.functions.invoke('send-whatsapp-image', {
        body: {
          phoneNumber: whatsappForm.phoneNumber,
          message: whatsappForm.message,
          imageData: imageToSend,
          instanceId: whatsappForm.instanceId
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('Message sent successfully:', data);
        toast.success(`Photo sent successfully via WhatsApp! 🎉${data.messageId ? ` (ID: ${data.messageId})` : ''}`);
        setIsWhatsAppDialogOpen(false);
        // Reset form (keeping static values)
        setWhatsappForm({
          phoneNumber: '',
          message: 'Check out my special AI avatar gift! 🎁✨',
          instanceId: 'instance136415'
        });
      } else {
        console.error('Send failed:', data);
        const errorMsg = data?.error || data?.details || "Failed to send photo";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('WhatsApp send error:', error);
      const errorMessage = error.message || error.error_description || "Failed to send photo via WhatsApp";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handlePrintPhoto = () => {
    const imageToprint = generatedAvatar || capturedPhoto;
    if (!imageToprint) {
      toast.error("No photo to print!");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Photo</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: white;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
                width: auto;
                height: auto;
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              @media print {
                body {
                  padding: 0;
                }
                img {
                  max-width: 100%;
                  max-height: 100%;
                  width: auto;
                  height: auto;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <img src="${imageToprint}" alt="Photo to print" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleRetake = () => {
    setCurrentStep('styles');
    setSelectedStyle('');
    setShowConfetti(false);
    setCapturedPhoto(null);
    setGeneratedAvatar(null);
    setGenerationError(null);
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'styles':
        return (
          <div className="relative min-h-screen overflow-hidden" key={`styles-${stageAnimationKey}`}>
            {screens.styles.backgroundImageDataUrl && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${screens.styles.backgroundImageDataUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}
            {typeof screens.styles.overlayOpacity === 'number' && screens.styles.backgroundImageDataUrl && (
              <div
                className="absolute inset-0"
                style={{ background: `hsla(0 0% 0% / ${screens.styles.overlayOpacity})` }}
              />
            )}

            <div className="relative z-10 text-center">
              {/* Back Button */}
              <div className="absolute top-8 left-8 z-20">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 text-lg px-6 py-3 rounded-xl backdrop-blur-sm bg-background/80 hover:bg-background/90 border-2 transition-all duration-300"
                  style={{ 
                    color: screens.styles.textColorHsl ? `hsl(${screens.styles.textColorHsl})` : undefined,
                    borderColor: screens.styles.textColorHsl ? `hsl(${screens.styles.textColorHsl} / 0.3)` : undefined 
                  }}
                >
                  <Home className="h-5 w-5" />
                  Back to Home
                </Button>
              </div>

              <ParticleField count={15} />
              
            <div className="animate-fade-in-up">
              <h1
                className="text-7xl font-bold mb-6 animate-scale-in"
                style={{ color: screens.styles.textColorHsl ? `hsl(${screens.styles.textColorHsl})` : undefined }}
              >
                {screens.styles.title || 'Choose your Avatar'}
              </h1>
              <p
                className="text-3xl mb-16 animate-fade-in-up"
                style={{ color: screens.styles.textColorHsl ? `hsl(${screens.styles.textColorHsl})` : undefined, animationDelay: '0.2s' }}
              >
                Select how you want your avatar to look
              </p>
            </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                {avatarStyles.map((style, index) => (
                  <div
                    key={style.id}
                    className="animate-bounce-in card-3d"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <button
                      onClick={() => handleStyleSelect(style.id)}
                      className={`w-full p-8 rounded-3xl border-4 transition-all duration-500 transform-3d magnetic relative overflow-hidden ${
                        selectedStyle === style.id
                          ? 'border-primary shadow-glow bg-primary/10 scale-105 neon-glow'
                          : 'border-border hover:border-primary/50 hover:shadow-3d glass'
                      }`}
                    >
                      <div className="relative z-10">
                        <div className="text-8xl mb-6 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                          {style.preview}
                        </div>
                        <h3 className="text-3xl font-bold mb-2">{style.name}</h3>
                        <p className="text-lg text-muted-foreground">{style.description}</p>
                      </div>
                      
                      {selectedStyle === style.id && (
                        <div className="absolute inset-0 gradient-glow animate-pulse-glow" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              
              {selectedStyle && (
                <div className="animate-scale-in">
                  <Button 
                    variant="default" 
                    size="lg" 
                    onClick={handleStartCamera}
                    className="text-3xl px-20 py-10 rounded-2xl shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105 neon-glow"
                  >
                    <Camera className="h-10 w-10 mr-6" />
                    Begin Your Journey
                    <ArrowRight className="h-10 w-10 ml-6" />
                    <Heart className="h-8 w-8 ml-4 animate-pulse-soft" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'camera':
        return (
          <div className="relative min-h-screen overflow-hidden" key={`camera-${stageAnimationKey}`}>
            {screens.camera.backgroundImageDataUrl && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${screens.camera.backgroundImageDataUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}
            {typeof screens.camera.overlayOpacity === 'number' && screens.camera.backgroundImageDataUrl && (
              <div className="absolute inset-0" style={{ background: `hsla(0 0% 0% / ${screens.camera.overlayOpacity})` }} />
            )}

            <ParticleField count={10} />
            
            <div className="relative z-10">
              <CameraCapture
                onPhotoCapture={handlePhotoCapture}
                onBack={() => setCurrentStep('styles')}
                textColor={screens.camera.textColorHsl ? `hsl(${screens.camera.textColorHsl})` : undefined}
              />
            </div>
          </div>
        );

      case 'photo-preview':
        return (
          <div className="relative min-h-screen overflow-hidden" key={`photo-preview-${stageAnimationKey}`}>
            {screens.camera.backgroundImageDataUrl && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${screens.camera.backgroundImageDataUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}
            {typeof screens.camera.overlayOpacity === 'number' && screens.camera.backgroundImageDataUrl && (
              <div className="absolute inset-0" style={{ background: `hsla(0 0% 0% / ${screens.camera.overlayOpacity})` }} />
            )}

            <ParticleField count={10} />
            
            <div className="relative z-10">
              <PhotoPreview
                capturedPhoto={capturedPhoto!}
                onRetake={handleRetakePhoto}
                onConfirm={handleConfirmPhoto}
                textColor={screens.camera.textColorHsl ? `hsl(${screens.camera.textColorHsl})` : undefined}
              />
            </div>
          </div>
        );

      case 'countdown':
        return (
          <div className="text-center relative min-h-screen flex items-center justify-center" key={`countdown-${stageAnimationKey}`}>
            {screens.countdown.backgroundImageDataUrl && (
              <div className="absolute inset-0" style={{ backgroundImage: `url(${screens.countdown.backgroundImageDataUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            )}
            {typeof screens.countdown.overlayOpacity === 'number' && screens.countdown.backgroundImageDataUrl && (
              <div className="absolute inset-0" style={{ background: `hsla(0 0% 0% / ${screens.countdown.overlayOpacity})` }} />
            )}
            <ParticleField count={8} />
            
            {/* Gentle background glow */}
            <div className="absolute inset-0 gradient-subtle opacity-30" />
            
            <div className="relative z-10 space-y-12">
              <div className="space-y-8 animate-fade-in-up">
                <h1 className="text-5xl font-light mb-8" style={{ color: screens.countdown.textColorHsl ? `hsl(${screens.countdown.textColorHsl})` : undefined }}>
                  {screens.countdown.title || 'Take a moment...'}
                </h1>
                
                <QuoteDisplay 
                  quotes={countdownQuotes}
                  className="mb-12"
                  interval={2500}
                />
              </div>
              
              {/* Simple, elegant countdown */}
              <div className="relative">
                <div className="text-[8rem] font-light text-accent/80 transition-all duration-1000 ease-out animate-breathe">
                  {countdown}
                </div>
              </div>
              
              <p className="text-2xl text-muted-foreground font-light">
                When you're ready... 🌸
              </p>
            </div>
          </div>
        );

      case 'loading':
        return (
          <div className="text-center relative min-h-screen flex items-center justify-center" key={`loading-${stageAnimationKey}`}>
            {screens.loading.backgroundImageDataUrl && (
              <div className="absolute inset-0" style={{ backgroundImage: `url(${screens.loading.backgroundImageDataUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            )}
            {typeof screens.loading.overlayOpacity === 'number' && screens.loading.backgroundImageDataUrl && (
              <div className="absolute inset-0" style={{ background: `hsla(0 0% 0% / ${screens.loading.overlayOpacity})` }} />
            )}
            <ParticleField count={6} />
            
            {/* Soft, artistic background */}
            <div className="absolute inset-0 gradient-subtle opacity-40" />
            
            <div className="relative z-10 space-y-12">
              <div className="space-y-8 animate-watercolor-bloom">
                <h1 className="text-4xl font-light" style={{ color: screens.loading.textColorHsl ? `hsl(${screens.loading.textColorHsl})` : undefined }}>
                  {screens.loading.title || 'Crafting your artistic vision...'}
                </h1>
                
                <QuoteDisplay 
                  quotes={generationQuotes}
                  className="mb-8"
                  interval={3500}
                />
              </div>
              
              <AIRobotDrawing selectedStyle={selectedStyle} />
              
              <div className="mt-8 space-y-6">
                <p className="text-xl text-muted-foreground font-light">
                  Creating your {selectedStyle} masterpiece
                </p>
                <div className="flex justify-center items-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"
                      style={{ 
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: '1.5s'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'result':
        return (
          <div className="text-center relative" key={`result-${stageAnimationKey}`}>
            {showConfetti && <ConfettiExplosion />}
            {screens.result.backgroundImageDataUrl && (
              <div className="absolute inset-0" style={{ backgroundImage: `url(${screens.result.backgroundImageDataUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            )}
            {typeof screens.result.overlayOpacity === 'number' && screens.result.backgroundImageDataUrl && (
              <div className="absolute inset-0" style={{ background: `hsla(0 0% 0% / ${screens.result.overlayOpacity})` }} />
            )}
            <ParticleField count={25} />
            
            <div className="animate-fade-in-up relative z-10">
              <h1 className="text-8xl font-bold mb-12 animate-bounce-in" style={{ color: screens.result.textColorHsl ? `hsl(${screens.result.textColorHsl})` : undefined }}>
                {generationError ? 'Oops! Using your original photo 📸' : screens.result.title || 'Your Avatar is Ready! 🎉'}
              </h1>
              {generationError && (
                <p className="text-xl mb-8 text-yellow-300">
                  {generationError}
                </p>
              )}
            </div>

            {generationError && (
              <div className="mb-8">
                <Button
                  onClick={generateAvatar}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 text-xl"
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Try AI Generation Again'}
                </Button>
              </div>
            )}
            
            <div className="max-w-lg mx-auto mb-16 animate-flip-3d">
              <Card className="p-12 shadow-glow glass border-4 border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 gradient-glow animate-pulse-glow" />
                
                <div className="relative z-10">
                  <div className="aspect-square bg-muted rounded-3xl overflow-hidden mb-8 shadow-3d animate-pulse-glow">
                    {(generatedAvatar || capturedPhoto) ? (
                      <img 
                        src={generatedAvatar || capturedPhoto} 
                        alt={generatedAvatar ? "Your AI-generated avatar" : "Your captured photo"} 
                        className="w-full h-full object-cover animate-float"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-[12rem] animate-float">🎭</div>
                      </div>
                    )}
                  </div>
                  <p className="text-3xl font-semibold mb-4">
                    {generatedAvatar ? 'AI-Generated Egyptian Avatar' : `${selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Style`}
                  </p>
                  <p className="text-xl text-muted-foreground">
                    {generatedAvatar ? 'Your cultural transformation is complete!' : 'Ready to share with the world!'}
                  </p>
                </div>
                
                {/* Floating sparkles */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-2xl animate-float opacity-60"
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${10 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  >
                    ✨
                  </div>
                ))}
              </Card>
            </div>
            
            <div className="flex flex-wrap gap-6 justify-center mb-8">
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleRetake}
                className="text-2xl px-12 py-8 rounded-2xl glass magnetic hover:shadow-3d transition-all duration-500"
              >
                <RotateCcw className="h-8 w-8 mr-4" />
                Retake
              </Button>
              
              <Button 
                variant="default" 
                size="lg"
                onClick={handlePrintPhoto}
                className="text-2xl px-12 py-8 rounded-2xl shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105 neon-glow"
              >
                <Printer className="h-8 w-8 mr-4" />
                Print Avatar
              </Button>
              
              <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="default" 
                    size="lg"
                    className="text-2xl px-12 py-8 rounded-2xl shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105 neon-glow bg-green-600 hover:bg-green-500"
                  >
                    <Send className="h-8 w-8 mr-4" />
                    Send to WhatsApp
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Send Avatar via WhatsApp</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={whatsappForm.phoneNumber}
                        onChange={(e) => setWhatsappForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="+1234567890"
                      />
                    </div>
                    <Button 
                      onClick={handleSendWhatsApp} 
                      disabled={isSendingWhatsApp}
                      className="w-full"
                    >
                      {isSendingWhatsApp ? "Sending..." : "Send Special Gift"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background gradient (kept as subtle base) */}
      <div className="absolute inset-0 gradient-subtle opacity-30" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-7xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default KioskInterface;