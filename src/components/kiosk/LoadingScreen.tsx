import QuoteDisplay from "@/components/QuoteDisplay";
import AIRobotDrawing from "@/components/AIRobotDrawing";

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

interface LoadingScreenProps {
  selectedStyle: string;
  backgroundImageUrl?: string | null;
  overlayOpacity?: number;
  title?: string;
  textColor?: string;
  stageAnimationKey: number;
}

const LoadingScreen = ({
  selectedStyle,
  backgroundImageUrl,
  overlayOpacity,
  title,
  textColor,
  stageAnimationKey
}: LoadingScreenProps) => {
  const generationQuotes = [
    "Art is not what you see, but what you make others see...",
    "Every artist dips their brush in their soul...",
    "Creativity takes courage - you're being brave...",
    "Your unique story is being painted right now...",
    "In the dance of pixels and imagination, magic happens..."
  ];

  return (
    <div className="text-center relative min-h-screen flex items-center justify-center" key={`loading-${stageAnimationKey}`}>
      {backgroundImageUrl && (
        <div className="absolute inset-0" style={{ backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}
      {typeof overlayOpacity === 'number' && backgroundImageUrl && (
        <div className="absolute inset-0" style={{ background: `hsla(0 0% 0% / ${overlayOpacity})` }} />
      )}
      <ParticleField count={6} />
      
      <div className="absolute inset-0 gradient-subtle opacity-40" />
      
      <div className="relative z-10 space-y-12">
        <div className="space-y-8 animate-watercolor-bloom">
          <h1 className="text-4xl font-light" style={{ color: textColor }}>
            {title || 'Crafting your artistic vision...'}
          </h1>
          
          <QuoteDisplay 
            quotes={generationQuotes}
            className="mb-8"
            interval={3500}
            textColor={textColor}
          />
        </div>
        
        <AIRobotDrawing selectedStyle={selectedStyle} />
        
        <div className="mt-8 space-y-6">
          <p 
            className="text-xl font-light"
            style={{ color: textColor, opacity: 0.8 }}
          >
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
};

export default LoadingScreen;