import { useState, useEffect } from "react";
import PhotoPreview from "./PhotoPreview";
import { useKioskTheme } from "@/hooks/useKioskTheme";
import { useAvatarGeneration } from "@/hooks/useAvatarGeneration";
import StyleSelection from "./kiosk/StyleSelection";
import CameraScreen from "./kiosk/CameraScreen";
import CountdownScreen from "./kiosk/CountdownScreen";
import LoadingScreen from "./kiosk/LoadingScreen";
import ResultScreen from "./kiosk/ResultScreen";
import { type ScreenSettings } from "@/lib/kioskSettings";

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

const KioskInterface = ({ isDemo = false, demoSettings, eventId }: KioskInterfaceProps = {}) => {
  const [currentStep, setCurrentStep] = useState<'styles' | 'camera' | 'photo-preview' | 'countdown' | 'loading' | 'result'>('styles');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [countdown, setCountdown] = useState(3);
  const [stageAnimationKey, setStageAnimationKey] = useState(0);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Use the custom hooks
  const { 
    eventSelectedStyles, 
    screens, 
    getTextColor, 
    getIsolatedBackgroundStyle 
  } = useKioskTheme({ isDemo, demoSettings, eventId });

  const {
    generatedAvatar,
    isGenerating,
    generationError,
    showConfetti,
    generateAvatar,
    resetGeneration,
    sendWhatsApp,
    printPhoto
  } = useAvatarGeneration();

  // Avatar styles
  const allAvatarStyles = [
    { 
      id: "farmer", 
      name: "Egyptian Farmer", 
      preview: "🌾", 
      description: "Traditional Rural Life"
    },
    { 
      id: "pharaonic", 
      name: "Ancient Pharaoh", 
      preview: "👑", 
      description: "Royal Dynasty Style"
    },
    { 
      id: "basha", 
      name: "El Basha Style", 
      preview: "🎩", 
      description: "Elite Noble Fashion"
    },
    { 
      id: "beach", 
      name: "Beach Vibes", 
      preview: "🏖️", 
      description: "Summer Mediterranean"
    },
    { 
      id: "pixar", 
      name: "Pixar Style", 
      preview: "🎭", 
      description: "3D Animated Magic"
    },
  ];

  const avatarStyles = isDemo ? allAvatarStyles : 
    eventSelectedStyles.length > 0 ? 
      allAvatarStyles.filter(style => eventSelectedStyles.includes(style.id)) : 
      allAvatarStyles;

  useEffect(() => {
    setStageAnimationKey(prev => prev + 1);
  }, [currentStep]);

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
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
          handleGenerateAvatar();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGenerateAvatar = async () => {
    if (!capturedPhoto || !selectedStyle) return;
    await generateAvatar(capturedPhoto, selectedStyle);
    setCurrentStep('result');
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setCurrentStep('camera');
  };

  const handleRetake = () => {
    setCurrentStep('styles');
    setSelectedStyle('');
    setCapturedPhoto(null);
    resetGeneration();
  };

  const renderContent = () => {
    const currentScreen = screens[currentStep] || screens.styles;

    switch (currentStep) {
      case 'styles':
        return (
          <StyleSelection
            selectedStyle={selectedStyle}
            onStyleSelect={handleStyleSelect}
            onStartCamera={handleStartCamera}
            avatarStyles={avatarStyles}
            backgroundImageUrl={currentScreen.backgroundImageDataUrl}
            overlayOpacity={currentScreen.overlayOpacity}
            title={currentScreen.title}
            textColor={getTextColor('styles')}
            stageAnimationKey={stageAnimationKey}
          />
        );

      case 'camera':
        return (
          <CameraScreen
            onPhotoCapture={handlePhotoCapture}
            onBack={() => setCurrentStep('styles')}
            backgroundImageUrl={screens.camera.backgroundImageDataUrl}
            overlayOpacity={screens.camera.overlayOpacity}
            textColor={getTextColor('camera')}
            stageAnimationKey={stageAnimationKey}
          />
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
            
            <div 
              className="kiosk-screen relative z-10"
              style={{ ['--screen-text-color' as any]: getTextColor('camera') }}
            >
              <PhotoPreview
                capturedPhoto={capturedPhoto!}
                onRetake={handleRetakePhoto}
                onConfirm={handleConfirmPhoto}
              />
            </div>
          </div>
        );

      case 'countdown':
        return (
          <CountdownScreen
            countdown={countdown}
            backgroundImageUrl={screens.countdown.backgroundImageDataUrl}
            overlayOpacity={screens.countdown.overlayOpacity}
            title={screens.countdown.title}
            textColor={getTextColor('countdown')}
            stageAnimationKey={stageAnimationKey}
          />
        );

      case 'loading':
        return (
          <LoadingScreen
            selectedStyle={selectedStyle}
            backgroundImageUrl={screens.loading.backgroundImageDataUrl}
            overlayOpacity={screens.loading.overlayOpacity}
            title={screens.loading.title}
            textColor={getTextColor('loading')}
            stageAnimationKey={stageAnimationKey}
          />
        );

      case 'result':
        return (
          <ResultScreen
            generatedAvatar={generatedAvatar}
            capturedPhoto={capturedPhoto}
            selectedStyle={selectedStyle}
            generationError={generationError}
            isGenerating={isGenerating}
            showConfetti={showConfetti}
            onRetake={handleRetake}
            onPrintPhoto={printPhoto}
            onSendWhatsApp={sendWhatsApp}
            onGenerateAvatar={handleGenerateAvatar}
            backgroundImageUrl={screens.result.backgroundImageDataUrl}
            overlayOpacity={screens.result.overlayOpacity}
            title={screens.result.title}
            textColor={getTextColor('result')}
            stageAnimationKey={stageAnimationKey}
          />
        );

      default:
        return null;
    }
  };

  const currentScreenKey = currentStep === 'photo-preview' ? 'camera' : currentStep;
  const isolatedBackgroundStyle = getIsolatedBackgroundStyle(currentScreenKey);
  const currentScreen = screens[currentScreenKey] || screens.styles;

  return (
    <div 
      className={`min-h-screen relative overflow-hidden ${
        isDemo ? 'kiosk-isolated kiosk-demo-theme' : 'kiosk-isolated'
      }`}
      style={isolatedBackgroundStyle}
    >
      {currentScreen.backgroundImageDataUrl && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: currentScreen.overlayOpacity || 0.6 }}
        />
      )}
      
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