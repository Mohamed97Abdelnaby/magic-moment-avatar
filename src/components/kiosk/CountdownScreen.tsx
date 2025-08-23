import QuoteDisplay from "@/components/QuoteDisplay";
import { KioskScreenTextScope } from "./KioskThemeWrapper";

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

interface CountdownScreenProps {
  countdown: number;
  backgroundImageUrl?: string | null;
  overlayOpacity?: number;
  title?: string;
  textColor?: string;
  backgroundColor?: string;
  stageAnimationKey: number;
}

const CountdownScreen = ({
  countdown,
  backgroundImageUrl,
  overlayOpacity,
  title,
  textColor,
  backgroundColor,
  stageAnimationKey
}: CountdownScreenProps) => {
  const countdownQuotes = [
    "Take a deep breath and let your authentic self shine...",
    "In stillness, we find our truest expression...",
    "Every moment of pause is a moment of possibility...",
    "Breathe in confidence, breathe out perfection..."
  ];

  return (
    <div className="text-center relative min-h-screen flex items-center justify-center" key={`countdown-${stageAnimationKey}`}>
      {backgroundImageUrl && (
        <div className="absolute inset-0" style={{ backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}
      {typeof overlayOpacity === 'number' && backgroundImageUrl && (
        <div className="absolute inset-0" style={{ background: `hsla(0 0% 0% / ${overlayOpacity})` }} />
      )}
      <ParticleField count={8} />
      
      <div className="absolute inset-0 gradient-subtle opacity-30" />
      
      <KioskScreenTextScope color={textColor} backgroundColor={backgroundColor} className="relative z-10 space-y-12">
        <div className="space-y-8 animate-fade-in-up">
          <h1 className="text-5xl font-light mb-8">
            {title || 'Take a moment...'}
          </h1>
          
          <QuoteDisplay 
            quotes={countdownQuotes}
            className="mb-12"
            interval={2500}
            textColor={textColor}
          />
        </div>
        
        <div className="relative">
          <div 
            className="text-[8rem] font-light transition-all duration-1000 ease-out animate-breathe"
            style={{ opacity: 0.8 }}
          >
            {countdown}
          </div>
        </div>
        
        <p 
          className="text-2xl font-light"
          style={{ opacity: 0.7 }}
        >
          When you're ready... 🌸
        </p>
      </KioskScreenTextScope>
    </div>
  );
};

export default CountdownScreen;