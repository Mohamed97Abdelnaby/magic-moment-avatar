import QuoteDisplay from "../QuoteDisplay";
import { KioskScreenTextScope } from "../kiosk/KioskThemeWrapper";
import ParticleField from "./ParticleField";

const countdownQuotes = [
  "Take a deep breath and relax...",
  "Think of your favorite memory...",
  "Imagine your best self...",
  "Get ready for magic...",
  "Something amazing is coming...",
];

interface SharedCountdownScreenProps {
  mode: 'kiosk' | 'preview';
  countdown: number;
  backgroundImageUrl?: string | null;
  overlayOpacity?: number;
  title?: string;
  textColor?: string;
  backgroundColor?: string;
  stageAnimationKey?: number;
}

const SharedCountdownScreen = ({
  mode,
  countdown,
  backgroundImageUrl,
  overlayOpacity,
  title,
  textColor,
  backgroundColor,
  stageAnimationKey = 0
}: SharedCountdownScreenProps) => {
  const containerClasses = mode === 'preview' 
    ? "relative h-full overflow-hidden" 
    : "relative min-h-screen overflow-hidden";

  const displayCountdown = mode === 'preview' ? 3 : countdown;

  return (
    <div className={containerClasses} key={`countdown-${stageAnimationKey}`}>
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

      {mode === 'kiosk' && <ParticleField count={8} />}
      
      <KioskScreenTextScope color={textColor} backgroundColor={backgroundColor} className="relative z-10">
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
          <h1 className={`${mode === 'preview' ? 'text-3xl' : 'text-6xl'} font-bold mb-8 animate-fade-in`}>
            {title || 'Take a moment...'}
          </h1>
          
          <div className="mb-8">
            <QuoteDisplay 
              quotes={countdownQuotes} 
              className={`${mode === 'preview' ? 'text-lg' : 'text-2xl'} opacity-80`}
              interval={mode === 'preview' ? 5000 : 2500}
            />
          </div>
          
          <div className={`${mode === 'preview' ? 'text-8xl' : 'text-[12rem]'} font-bold mb-8 animate-bounce-soft`}>
            {displayCountdown}
          </div>
          
          <p className={`${mode === 'preview' ? 'text-lg' : 'text-2xl'} opacity-60 animate-pulse-soft`}>
            When you're ready...
          </p>
        </div>
      </KioskScreenTextScope>
    </div>
  );
};

export default SharedCountdownScreen;