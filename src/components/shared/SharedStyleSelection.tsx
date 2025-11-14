import { Button } from "@/components/ui/button";
import { Camera, ArrowRight, Heart, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { KioskScreenTextScope } from "../kiosk/KioskThemeWrapper";
import ParticleField from "./ParticleField";

interface SharedStyleSelectionProps {
  mode: 'kiosk' | 'preview';
  selectedStyle: string;
  onStyleSelect: (styleId: string) => void;
  onStartCamera: () => void;
  avatarStyles: Array<{
    id: string;
    name: string;
    preview: string;
    description: string;
  }>;
  backgroundImageUrl?: string | null;
  overlayOpacity?: number;
  title?: string;
  textColor?: string;
  backgroundColor?: string;
  stageAnimationKey?: number;
  // Preview-specific props
  isInteractive?: boolean;
}

const SharedStyleSelection = ({
  mode,
  selectedStyle,
  onStyleSelect,
  onStartCamera,
  avatarStyles,
  backgroundImageUrl,
  overlayOpacity,
  title,
  textColor,
  backgroundColor,
  stageAnimationKey = 0,
  isInteractive = true
}: SharedStyleSelectionProps) => {
  const navigate = useNavigate();

  const containerClasses = mode === 'preview' 
    ? "relative h-full overflow-hidden" 
    : "relative min-h-screen overflow-hidden flex items-center justify-center";

  const contentClasses = mode === 'preview'
    ? "animate-fade-in pt-8"
    : "animate-fade-in-up portrait:pt-12 landscape:pt-20";

  const headingSize = mode === 'preview' ? "text-3xl" : "portrait:text-5xl landscape:text-7xl";
  const subtitleSize = mode === 'preview' ? "text-lg" : "portrait:text-xl landscape:text-3xl";
  const gridClasses = mode === 'preview' 
    ? "grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-8"
    : "grid portrait:grid-cols-2 landscape:grid-cols-3 portrait:gap-4 landscape:gap-8 portrait:max-w-3xl landscape:max-w-6xl mx-auto portrait:mb-8 landscape:mb-12";

  return (
    <div className={containerClasses} key={`styles-${stageAnimationKey}`}>
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

      <KioskScreenTextScope color={textColor} backgroundColor={backgroundColor} className="relative z-10 text-center portrait:py-8 landscape:py-4">
        {mode === 'kiosk' && (
          <div className="fixed portrait:top-4 landscape:top-12 portrait:left-4 landscape:left-8 z-50">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 portrait:text-xs landscape:text-sm portrait:px-3 portrait:py-1.5 landscape:px-4 landscape:py-2 rounded-xl backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300"
              style={{ 
                borderColor: textColor ? `${textColor.replace(')', ' / 0.3)')}` : 'rgba(255,255,255,0.3)'
              }}
            >
              <Home className="portrait:h-3 portrait:w-3 landscape:h-4 landscape:w-4" />
              Back to Home
            </Button>
          </div>
        )}

        {mode === 'kiosk' && <ParticleField count={15} />}
        
        <div className={contentClasses}>
          <h1 className={`${headingSize} font-bold portrait:mb-3 landscape:mb-6 animate-scale-in`}>
            {title || 'Choose your Avatar'}
          </h1>
          <p className={`${subtitleSize} ${mode === 'preview' ? 'mb-8' : 'portrait:mb-6 landscape:mb-12'} animate-fade-in-up`} style={{ animationDelay: '0.2s' }}>
            Select how you want your avatar to look
          </p>
        </div>
          
        <div className={gridClasses}>
          {avatarStyles.map((style, index) => (
            <div
              key={style.id}
              className={mode === 'preview' ? "animate-fade-in" : "animate-bounce-in card-3d"}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <button
                onClick={() => isInteractive && onStyleSelect(style.id)}
                className={`w-full ${mode === 'preview' ? 'p-4' : 'portrait:p-4 landscape:p-8'} rounded-3xl border-4 transition-all duration-500 ${
                  mode === 'kiosk' ? 'transform-3d magnetic' : ''
                } relative overflow-hidden ${
                  selectedStyle === style.id
                    ? 'border-primary shadow-glow bg-primary/10 scale-105 neon-glow'
                    : 'border-border hover:border-primary/50 hover:shadow-3d glass'
                } ${!isInteractive ? 'cursor-default' : 'cursor-pointer'}`}
                disabled={!isInteractive}
              >
                <div className="relative z-10">
                  <div className={`${mode === 'preview' ? 'text-4xl mb-3' : 'portrait:text-5xl landscape:text-8xl portrait:mb-3 landscape:mb-6'} animate-float`} style={{ animationDelay: `${index * 0.2}s` }}>
                    {style.preview}
                  </div>
                  <h3 className={`${mode === 'preview' ? 'text-lg' : 'portrait:text-xl landscape:text-3xl'} font-bold portrait:mb-1 landscape:mb-2`}>{style.name}</h3>
                  <p className={`${mode === 'preview' ? 'text-sm' : 'portrait:text-sm landscape:text-lg'} opacity-70`}>{style.description}</p>
                </div>
                
                {selectedStyle === style.id && (
                  <div className="absolute inset-0 gradient-glow animate-pulse-glow" />
                )}
              </button>
            </div>
          ))}
        </div>
        
        {selectedStyle && mode === 'kiosk' && (
          <div className="animate-scale-in">
            <Button 
              variant="ghost"
              size="lg" 
              onClick={onStartCamera}
              className="portrait:text-xl landscape:text-3xl portrait:px-10 portrait:py-6 landscape:px-20 landscape:py-10 rounded-2xl backdrop-blur-md bg-white/15 hover:bg-white/25 border-2 border-white/30 hover:border-white/50 shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105"
              style={{ 
                borderColor: textColor ? `${textColor.replace(')', ' / 0.4)')}` : 'rgba(255,255,255,0.4)',
                backgroundColor: textColor ? `${textColor.replace(')', ' / 0.1)')}` : 'rgba(255,255,255,0.1)'
              }}
            >
              <Camera className="portrait:h-6 portrait:w-6 landscape:h-10 landscape:w-10 portrait:mr-3 landscape:mr-6" />
              Begin Your Journey
              <ArrowRight className="portrait:h-6 portrait:w-6 landscape:h-10 landscape:w-10 portrait:ml-3 landscape:ml-6" />
              <Heart className="portrait:h-5 portrait:w-5 landscape:h-8 landscape:w-8 portrait:ml-2 landscape:ml-4 animate-pulse-soft" />
            </Button>
          </div>
        )}
      </KioskScreenTextScope>
    </div>
  );
};

export default SharedStyleSelection;