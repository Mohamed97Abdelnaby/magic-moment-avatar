import PhotoPreview from "../PhotoPreview";
import { KioskScreenTextScope } from "../kiosk/KioskThemeWrapper";
import ParticleField from "./ParticleField";

interface SharedPhotoPreviewProps {
  mode: 'kiosk' | 'preview';
  capturedPhoto: string;
  onRetake: () => void;
  onConfirm: () => void;
  backgroundImageUrl?: string | null;
  overlayOpacity?: number;
  title?: string;
  textColor?: string;
  backgroundColor?: string;
  stageAnimationKey?: number;
  // Preview-specific props
  isInteractive?: boolean;
}

const SharedPhotoPreview = ({
  mode,
  capturedPhoto,
  onRetake,
  onConfirm,
  backgroundImageUrl,
  overlayOpacity,
  title,
  textColor,
  backgroundColor,
  stageAnimationKey = 0,
  isInteractive = true
}: SharedPhotoPreviewProps) => {
  const containerClasses = mode === 'preview' 
    ? "relative h-full overflow-hidden" 
    : "relative min-h-screen overflow-hidden";

  const mockPhoto = mode === 'preview' ? 
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
    : capturedPhoto;

  return (
    <div className={containerClasses} key={`photo-preview-${stageAnimationKey}`}>
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

      {mode === 'kiosk' && <ParticleField count={10} />}
      
      <KioskScreenTextScope color={textColor} backgroundColor={backgroundColor} className="relative z-10">
        <PhotoPreview
          capturedPhoto={mockPhoto}
          onRetake={isInteractive ? onRetake : () => {}}
          onConfirm={isInteractive ? onConfirm : () => {}}
        />
      </KioskScreenTextScope>
    </div>
  );
};

export default SharedPhotoPreview;