import AIRobotDrawing from "../AIRobotDrawing";
import QuoteDisplay from "../QuoteDisplay";
import { KioskScreenTextScope } from "../kiosk/KioskThemeWrapper";
import ParticleField from "./ParticleField";

const generationQuotes = [
  "Creating something magical...",
  "Mixing pixels with personality...",
  "Adding a touch of AI magic...",
  "Crafting your digital twin...",
  "Bringing your vision to life...",
];

interface SharedLoadingScreenProps {
  mode: 'kiosk' | 'preview';
  selectedStyle?: string;
  backgroundImageUrl?: string | null;
  overlayOpacity?: number;
  title?: string;
  textColor?: string;
  backgroundColor?: string;
  stageAnimationKey?: number;
}

const SharedLoadingScreen = ({
  mode,
  selectedStyle,
  backgroundImageUrl,
  overlayOpacity,
  title,
  textColor,
  backgroundColor,
  stageAnimationKey = 0
}: SharedLoadingScreenProps) => {
  const containerClasses = mode === 'preview' 
    ? "relative h-full overflow-hidden" 
    : "relative min-h-screen overflow-hidden flex items-center justify-center";

  return (
    <div className={containerClasses} key={`loading-${stageAnimationKey}`}>
      {backgroundImageUrl && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      {typeof overlayOpacity === 'number' && backgroundImageUrl && (
        <div
          className="absolute inset-0"
          style={{ background: `hsla(0 0% 0% / ${overlayOpacity})` }}
        />
      )}

      {mode === 'kiosk' && <ParticleField count={12} />}
      
      <KioskScreenTextScope color={textColor} backgroundColor={backgroundColor} className="relative z-10">
        <div className="min-h-screen flex flex-col items-center justify-center text-center portrait:p-4 landscape:p-8">
          <h1 className={`${mode === 'preview' ? 'text-3xl' : 'portrait:text-4xl landscape:text-6xl'} font-bold portrait:mb-4 landscape:mb-8 animate-fade-in`}>
            {title || 'Generating...'}
          </h1>
          
          <div className="portrait:mb-4 landscape:mb-8">
            <QuoteDisplay 
              quotes={generationQuotes} 
              className={`${mode === 'preview' ? 'text-lg' : 'portrait:text-xl landscape:text-2xl'} opacity-80`}
              interval={3000}
            />
          </div>
          
          <div className="portrait:mb-4 landscape:mb-8">
            <AIRobotDrawing 
              selectedStyle={selectedStyle || 'avatar'}
            />
          </div>
          
          <p className={`${mode === 'preview' ? 'text-sm' : 'portrait:text-lg landscape:text-xl'} opacity-60`}>
            Creating your {selectedStyle || 'avatar'}...
          </p>
          
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`${mode === 'preview' ? 'w-2 h-2' : 'portrait:w-2 portrait:h-2 landscape:w-3 landscape:h-3'} bg-primary rounded-full animate-pulse`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </KioskScreenTextScope>
    </div>
  );
};

export default SharedLoadingScreen;