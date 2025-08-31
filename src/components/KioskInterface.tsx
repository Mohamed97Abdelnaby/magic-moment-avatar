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

  // Avatar styles with detailed prompts
  const allAvatarStyles = [
    { 
      id: "farmer", 
      name: "Egyptian Farmer", 
      preview: "🌾", 
      description: "Traditional Rural Life",
      prompt: "Automatically detect all people in the image using face and age detection. For each individual, generate a 3D-stylized avatar in the Pixar or DreamWorks animation style. Preserve all original facial features, expressions, age, gender, and identity for every person — do not alter their face shape, emotional expression, or age characteristics. Transform each person into a character styled as a modern Egyptian farmer. For males: dress them in traditional light or neutral-colored galabeyas with a white or patterned headscarf. For females: dress them in female-style galabeyas with colorful headscarves and modest traditional detailing. Set the background in a vibrant green agricultural field under warm, natural sunlight. Include authentic rural Egyptian village elements in the scene such as palm trees, clay houses, farming tools, or common farm animals like donkeys and cows. The visual style should be slightly exaggerated and emotionally expressive like Pixar or DreamWorks, with soft, clean rendering. The overall tone should remain respectful, warm, and culturally authentic with a wholesome, storybook-like atmosphere."
    },
    { 
      id: "pharaonic", 
      name: "Ancient Pharaoh", 
      preview: "👑", 
      description: "Royal Dynasty Style",
      prompt: "Create a 3D-stylized avatar (Pixar or DreamWorks style) of a person using face and age detection. Keep the original facial features, expressions, and age intact with no changes to identity Transform the person into an ancient Egyptian (Pharaonic) character, wearing traditional royal or noble clothing from the Pharaonic era:– For men: dress in a linen kilt, wide beaded collar, royal headdress (nemes or khepresh), and sandals.– For women: dress in a white linen dress with gold accessories, wide beaded collar, and a decorative headdress or braided hairstyle.Set the scene in an ancient Egyptian environment — like beside a temple, on the Nile riverbank, or in front of pyramids — under warm golden sunlight.Style should be culturally respectful, semi-realistic, and slightly exaggerated in the expressive and colorful style of Pixar or animated film characters"
    },
    { 
      id: "basha", 
      name: "El Basha Style", 
      preview: "🎩", 
      description: "Elite Noble Fashion",
      prompt: "Automatically detect all people in the image using face and age detection. For each individual, generate a 3D-stylized avatar in the Pixar or DreamWorks animation style.Preserve all original facial features, expressions, age, and identity for every person — do not alter their face shape, emotional expression, or age characteristics. Transform each person into a character styled as \"El Basha\" (الباشا بالطاربوش) — a noble or upper-class Egyptian figure from the early 20th century: Dress each person in an elegant dark suit or traditional Egyptian formal wear appropriate to their gender, status, and time period. Add a red tarboosh (fez) to each character. Optional accessories may include a classic cane, monocle, or pocket watch, depending on the person's age and look. For women, adapt the look to match elite fashion of early 1900s Egyptian aristocratic women — refined dresses, tasteful jewelry, elegant hairstyles or headwear that align with cultural norms of the time. Set the scene in a refined background inspired by early 1900s Cairo or Alexandria, including: Old mansions or royal palaces Vintage cafés or French-style shops Historic tram lines Cobblestone streets under warm, golden vintage lighting The art style should be: Slightly exaggerated and emotionally expressive like Pixar or DreamWorks Refined, culturally respectful, and dignified With clean, detailed rendering and a warm, nostalgic tone"
    },
    { 
      id: "beach", 
      name: "Beach Vibes", 
      preview: "🏖️", 
      description: "Summer Mediterranean",
      prompt: "Automatically detect all people in the image using face and age detection. For each individual detected — and only those individuals — generate a 3D-stylized avatar in the Pixar or DreamWorks animation style. Do not invent or add any people who are not present in the image. Preserve all original facial features, expressions, age, and identity for every person — do not alter their face shape, emotional expression, or age characteristics. Transform each person into a character styled for a summery, joyful Mediterranean or Egyptian beach scene: Dress each person in relaxed and culturally-appropriate beachwear that reflects their age and gender. For men: casual short-sleeve shirts, tank tops, swim trunks, sandals, straw hats, or sunglasses. For women (non-hijabi): stylish yet modest summer dresses, beach wraps, swimwear with light cover-ups, wide-brimmed hats, or colorful scarves. For hijabi women: modern, modest beachwear such as colorful burkinis or lightweight tunics with swim-appropriate hijabs or light scarves. For children or elders: simple, age-appropriate summer clothing with light beach accessories like sandals, towels, or sun hats. Optional items (if appropriate): sunglasses, beach bags, ice cream cones, floaties, or books. Set the scene in a warm, sunny coastal environment inspired by Mediterranean or Egyptian beaches, featuring golden sand, clear waves, palm trees, colorful umbrellas, and relaxed seaside cafés. Ensure the background is peaceful and realistic — do not add people or fictional characters beyond those detected in the original photo. The art style should be slightly exaggerated and emotionally expressive, like Pixar or DreamWorks; rendered in a bright, clean, and vibrant animation style that captures warmth, fun, and cultural authenticity."
    },
    { 
      id: "pixar", 
      name: "Pixar Style", 
      preview: "🎭", 
      description: "3D Animated Magic",
      prompt: "Create a stylized avatar of the persons in the image"
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
    const styleData = allAvatarStyles.find(style => style.id === selectedStyle);
    const prompt = styleData?.prompt || "Create a stylized avatar of the persons in the image";
    await generateAvatar(capturedPhoto, prompt);
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