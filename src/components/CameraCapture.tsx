
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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      {/* Header */}
      <div className="space-y-4 mb-8">
        <h1 className="text-5xl md:text-6xl font-bold">
          Strike Your Pose! 📸
        </h1>
        <p className="text-xl md:text-2xl opacity-90">
          Get ready for your close-up
        </p>
      </div>

      {/* Camera Preview */}
      <div className="relative w-full max-w-3xl mb-8">
        <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border-2 border-white/20">
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-white text-xl">Starting camera...</div>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90">
              <div className="text-white text-center p-8">
                <p className="text-xl mb-4">📷 {error}</p>
                <Button onClick={startCamera} variant="outline" className="bg-white text-black hover:bg-white/90">
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          {/* Countdown Overlay */}
          {countdown !== null && isCounting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-white text-8xl font-bold animate-pulse">
                {countdown}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button 
          variant="outline" 
          size="lg"
          onClick={onBack}
          className="flex-1 text-lg px-6 py-4 rounded-2xl semi-transparent-button border-2"
        >
          <ArrowLeft className="h-5 w-5 mr-3" />
          Back
        </Button>
        
        <Button 
          variant="default" 
          size="lg"
          onClick={handleCapture}
          disabled={!isStreamActive || isCounting || isLoading}
          className="flex-1 text-lg px-6 py-4 rounded-2xl semi-transparent-button border-2"
        >
          <Camera className="h-5 w-5 mr-3" />
          {isCounting ? 'Get Ready!' : 'Capture Photo'}
        </Button>
      </div>
    </div>
  );
};

export default CameraCapture;
