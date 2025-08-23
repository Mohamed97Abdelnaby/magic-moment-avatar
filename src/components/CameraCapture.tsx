
import { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, ArrowLeft } from "lucide-react";
import { useEnhancedCameraCapture } from '@/hooks/useEnhancedCameraCapture';

interface CameraCaptureProps {
  onPhotoCapture: (imageData: string) => void;
  onBack: () => void;
}

const CameraCapture = ({ onPhotoCapture, onBack }: CameraCaptureProps) => {
  const {
    videoRef,
    canvasRef,
    isLoading,
    error,
    isStreamActive,
    countdown,
    isCounting,
    capturedImage,
    startCamera,
    stopCamera,
    startTimerAndCapture,
  } = useEnhancedCameraCapture();

  useEffect(() => {
    console.log('🎬 CameraCapture component mounted, starting enhanced camera...');
    startCamera();
    
    return () => {
      console.log('🛑 CameraCapture component unmounting, stopping camera...');
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (capturedImage) {
      onPhotoCapture(capturedImage);
    }
  }, [capturedImage, onPhotoCapture]);

  const handleCapture = () => {
    if (isStreamActive && !isCounting) {
      startTimerAndCapture();
    }
  };

  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-6xl font-bold mb-4 animate-fade-in-up">
          Strike Your Pose! 📸
        </h1>
        <p className="text-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Get ready for your close-up
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto">
        <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-glow relative">
          {/* Video Preview */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover scale-x-[-1]"
            playsInline
            muted
            style={{ display: isStreamActive ? 'block' : 'none' }}
          />
          
          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-xl">Starting camera...</div>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-white text-center p-8">
                <p className="text-xl mb-4">📷 {error}</p>
                <Button onClick={startCamera} variant="outline" className="text-black">
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          {/* Countdown Overlay */}
          {countdown !== null && isCounting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-white text-8xl font-bold animate-pulse">
                {countdown}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-6 justify-center">
        <Button 
          variant="outline" 
          size="lg"
          onClick={onBack}
          className="text-2xl px-8 py-6 rounded-2xl glass"
        >
          <ArrowLeft className="h-6 w-6 mr-4" />
          Back
        </Button>
        
        <Button 
          variant="default" 
          size="lg"
          onClick={handleCapture}
          disabled={!isStreamActive || isCounting || isLoading}
          className="text-2xl px-12 py-6 rounded-2xl shadow-glow hover:shadow-neon transition-all duration-500"
        >
          <Camera className="h-6 w-6 mr-4" />
          {isCounting ? 'Get Ready!' : 'Capture Photo'}
        </Button>
      </div>
    </div>
  );
};

export default CameraCapture;
