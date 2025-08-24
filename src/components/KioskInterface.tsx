import { useState, useEffect } from "react";
import { useKioskTheme } from "@/hooks/useKioskTheme";
import { useAvatarGeneration } from "@/hooks/useAvatarGeneration";
import SharedStyleSelection from "./shared/SharedStyleSelection";
import SharedCameraScreen from "./shared/SharedCameraScreen";
import SharedPhotoPreview from "./shared/SharedPhotoPreview";
import SharedCountdownScreen from "./shared/SharedCountdownScreen";
import SharedLoadingScreen from "./shared/SharedLoadingScreen";
import SharedResultScreen from "./shared/SharedResultScreen";
import { type ScreenSettings } from "@/lib/kioskSettings";
import KioskThemeWrapper from "./kiosk/KioskThemeWrapper";

interface KioskInterfaceProps {
  isDemo?: boolean;
  demoSettings?: ScreenSettings;
  eventId?: string;
}


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
    getIsolatedBackgroundStyle,
    getBackgroundColor
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
          <SharedStyleSelection
            mode="kiosk"
            selectedStyle={selectedStyle}
            onStyleSelect={handleStyleSelect}
            onStartCamera={handleStartCamera}
            avatarStyles={avatarStyles}
            backgroundImageUrl={currentScreen.backgroundImageDataUrl}
            overlayOpacity={currentScreen.overlayOpacity}
            title={currentScreen.title}
            textColor={getTextColor('styles')}
            backgroundColor={getBackgroundColor('styles')}
            stageAnimationKey={stageAnimationKey}
          />
        );

      case 'camera':
        return (
          <SharedCameraScreen
            mode="kiosk"
            onPhotoCapture={handlePhotoCapture}
            onBack={() => setCurrentStep('styles')}
            backgroundImageUrl={screens.camera.backgroundImageDataUrl}
            overlayOpacity={screens.camera.overlayOpacity}
            title={screens.camera.title}
            textColor={getTextColor('camera')}
            backgroundColor={getBackgroundColor('camera')}
            stageAnimationKey={stageAnimationKey}
          />
        );

      case 'photo-preview':
        return (
          <SharedPhotoPreview
            mode="kiosk"
            capturedPhoto={capturedPhoto!}
            onRetake={handleRetakePhoto}
            onConfirm={handleConfirmPhoto}
            backgroundImageUrl={screens['photo-preview'].backgroundImageDataUrl}
            overlayOpacity={screens['photo-preview'].overlayOpacity}
            title={screens['photo-preview'].title}
            textColor={getTextColor('photo-preview')}
            backgroundColor={getBackgroundColor('photo-preview')}
            stageAnimationKey={stageAnimationKey}
          />
        );

      case 'countdown':
        return (
          <SharedCountdownScreen
            mode="kiosk"
            countdown={countdown}
            backgroundImageUrl={screens.countdown.backgroundImageDataUrl}
            overlayOpacity={screens.countdown.overlayOpacity}
            title={screens.countdown.title}
            textColor={getTextColor('countdown')}
            backgroundColor={getBackgroundColor('countdown')}
            stageAnimationKey={stageAnimationKey}
          />
        );

      case 'loading':
        return (
          <SharedLoadingScreen
            mode="kiosk"
            selectedStyle={selectedStyle}
            backgroundImageUrl={screens.loading.backgroundImageDataUrl}
            overlayOpacity={screens.loading.overlayOpacity}
            title={screens.loading.title}
            textColor={getTextColor('loading')}
            backgroundColor={getBackgroundColor('loading')}
            stageAnimationKey={stageAnimationKey}
          />
        );

      case 'result':
        return (
          <SharedResultScreen
            mode="kiosk"
            generatedAvatar={generatedAvatar}
            capturedPhoto={capturedPhoto}
            selectedStyle={selectedStyle}
            generationError={generationError}
            isGenerating={isGenerating}
            showConfetti={showConfetti}
            onRetake={handleRetake}
            onPrintPhoto={() => printPhoto(generatedAvatar || capturedPhoto || '')}
            onSendWhatsApp={sendWhatsApp}
            onGenerateAvatar={handleGenerateAvatar}
            backgroundImageUrl={screens.result.backgroundImageDataUrl}
            overlayOpacity={screens.result.overlayOpacity}
            title={screens.result.title}
            textColor={getTextColor('result')}
            backgroundColor={getBackgroundColor('result')}
            stageAnimationKey={stageAnimationKey}
          />
        );

      default:
        return null;
    }
  };

  const currentScreenKey = currentStep;
  const isolatedBackgroundStyle = getIsolatedBackgroundStyle(currentScreenKey);
  const currentScreen = screens[currentScreenKey] || screens.styles;

  return (
    <KioskThemeWrapper 
      forceCalmDarkBlue={isDemo}
      className="min-h-screen relative overflow-hidden"
    >
      <div 
        className="min-h-screen relative overflow-hidden kiosk-isolated"
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
    </KioskThemeWrapper>
  );
};

export default KioskInterface;