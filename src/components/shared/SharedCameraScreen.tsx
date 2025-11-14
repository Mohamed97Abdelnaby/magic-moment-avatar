import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera } from "lucide-react";
import CameraCapture from "../CameraCapture";
import { KioskScreenTextScope } from "../kiosk/KioskThemeWrapper";
import ParticleField from "./ParticleField";

interface SharedCameraScreenProps {
  mode: 'kiosk' | 'preview';
  onPhotoCapture: (imageData: string) => void;
  onBack: () => void;
  backgroundImageUrl?: string | null;
  overlayOpacity?: number;
  title?: string;
  textColor?: string;
  backgroundColor?: string;
  stageAnimationKey?: number;
  // Preview-specific props
  isInteractive?: boolean;
}

const SharedCameraScreen = ({
  mode,
  onPhotoCapture,
  onBack,
  backgroundImageUrl,
  overlayOpacity,
  title,
  textColor,
  backgroundColor,
  stageAnimationKey = 0,
  isInteractive = true
}: SharedCameraScreenProps) => {
  const containerClasses = mode === 'preview' 
    ? "relative h-full overflow-hidden" 
    : "relative min-h-screen overflow-hidden";

  const handleMockCapture = () => {
    if (mode === 'preview' && !isInteractive) return;
    // For preview mode, we can trigger a mock capture
    onPhotoCapture('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=');
  };

  return (
    <div className={containerClasses} key={`camera-${stageAnimationKey}`}>
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

      <KioskScreenTextScope color={textColor} backgroundColor={backgroundColor} className="relative z-10">
        {mode === 'kiosk' && (
          <div className="fixed portrait:top-4 landscape:top-8 portrait:left-4 landscape:left-8 z-50">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 portrait:text-xs landscape:text-sm portrait:px-3 portrait:py-1.5 landscape:px-4 landscape:py-2 rounded-xl backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300"
              style={{ 
                borderColor: textColor ? `${textColor.replace(')', ' / 0.3)')}` : 'rgba(255,255,255,0.3)'
              }}
            >
              <ArrowLeft className="portrait:h-3 portrait:w-3 landscape:h-4 landscape:w-4" />
              Back
            </Button>
          </div>
        )}

        {mode === 'kiosk' && <ParticleField count={10} />}
        
        <div className="min-h-screen flex flex-col items-center justify-center text-center portrait:p-4 landscape:p-8">
          {mode === 'preview' ? (
            <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
              <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-bold mb-2">{title || 'Camera Ready'}</h2>
              <p className="text-gray-300 mb-4">Camera preview would appear here</p>
              <Button 
                onClick={handleMockCapture}
                disabled={!isInteractive}
                className="w-full"
              >
                Mock Capture
              </Button>
            </div>
          ) : (
            <>
              <h1 className="portrait:text-4xl landscape:text-6xl font-bold portrait:mb-4 landscape:mb-8 animate-fade-in">
                {title || 'Get Ready!'}
              </h1>
              <p className="portrait:text-lg landscape:text-2xl portrait:mb-6 landscape:mb-12 opacity-80 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Position yourself and smile for the camera
              </p>
              <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
                <CameraCapture onPhotoCapture={onPhotoCapture} onBack={onBack} />
              </div>
            </>
          )}
        </div>
      </KioskScreenTextScope>
    </div>
  );
};

export default SharedCameraScreen;