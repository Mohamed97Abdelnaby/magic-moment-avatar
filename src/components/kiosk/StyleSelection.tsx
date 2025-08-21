import { Button } from "@/components/ui/button";
import { Camera, ArrowRight, Heart, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface StyleSelectionProps {
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
  stageAnimationKey: number;
}

const StyleSelection = ({
  selectedStyle,
  onStyleSelect,
  onStartCamera,
  avatarStyles,
  backgroundImageUrl,
  overlayOpacity,
  title,
  textColor,
  stageAnimationKey
}: StyleSelectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden" key={`styles-${stageAnimationKey}`}>
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

      <div className="relative z-10 text-center">
        <div className="absolute top-8 left-8 z-20">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="lg"
            className="flex items-center gap-2 text-lg px-6 py-3 rounded-xl backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300"
            style={{ 
              color: textColor,
              borderColor: textColor ? `${textColor.replace(')', ' / 0.3)')}` : 'rgba(255,255,255,0.3)'
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
            style={{ color: textColor }}
          >
            {title || 'Choose your Avatar'}
          </h1>
          <p
            className="text-3xl mb-16 animate-fade-in-up"
            style={{ color: textColor, animationDelay: '0.2s' }}
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
                onClick={() => onStyleSelect(style.id)}
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
                  <h3 className="text-3xl font-bold mb-2" style={{ color: textColor }}>{style.name}</h3>
                  <p className="text-lg opacity-70" style={{ color: textColor }}>{style.description}</p>
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
              variant="ghost"
              size="lg" 
              onClick={onStartCamera}
              className="text-3xl px-20 py-10 rounded-2xl backdrop-blur-md bg-white/15 hover:bg-white/25 border-2 border-white/30 hover:border-white/50 shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105"
              style={{ 
                color: textColor,
                borderColor: textColor ? `${textColor.replace(')', ' / 0.4)')}` : 'rgba(255,255,255,0.4)',
                backgroundColor: textColor ? `${textColor.replace(')', ' / 0.1)')}` : 'rgba(255,255,255,0.1)'
              }}
            >
              <Camera className="h-10 w-10 mr-6" />
              Begin Your Journey
              <ArrowRight className="h-10 w-10 ml-6" />
              <Heart 
                className="h-8 w-8 ml-4 animate-pulse-soft" 
                style={{ color: textColor }}
              />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleSelection;