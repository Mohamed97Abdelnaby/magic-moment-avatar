import CameraCapture from "@/components/CameraCapture";
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

interface CameraScreenProps {
  onPhotoCapture: (imageData: string) => void;
  onBack: () => void;
  backgroundImageUrl?: string | null;
  overlayOpacity?: number;
  textColor?: string;
  stageAnimationKey: number;
}

const CameraScreen = ({
  onPhotoCapture,
  onBack,
  backgroundImageUrl,
  overlayOpacity,
  textColor,
  stageAnimationKey
}: CameraScreenProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden" key={`camera-${stageAnimationKey}`}>
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
        <div className="absolute inset-0" style={{ background: `hsla(0 0% 0% / ${overlayOpacity})` }} />
      )}

      <ParticleField count={10} />
      
      <KioskScreenTextScope color={textColor} className="relative z-10">
        <CameraCapture
          onPhotoCapture={onPhotoCapture}
          onBack={onBack}
        />
      </KioskScreenTextScope>
    </div>
  );
};

export default CameraScreen;