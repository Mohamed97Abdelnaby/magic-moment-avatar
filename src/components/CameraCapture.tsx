import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, AlertCircle, RotateCcw, ArrowLeft, Sparkles } from "lucide-react";
import { useEnhancedCameraCapture } from "@/hooks/useEnhancedCameraCapture";

interface CameraCaptureProps {
  onPhotoCapture: (imageData: string) => void;
  onBack: () => void;
  textColor?: string;
}

const CameraCapture = ({ onPhotoCapture, onBack, textColor }: CameraCaptureProps) => {
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
    capturePhoto,
    startTimerAndCapture
  } = useEnhancedCameraCapture();

  useEffect(() => {
    console.log('🎬 CameraCapture component mounted, starting enhanced camera...');
    startCamera();
    
    return () => {
      console.log('🛑 CameraCapture component unmounting, stopping camera...');
      stopCamera();
    };
  }, []);

  const handleCaptureClick = () => {
    if (capturedImage) {
      // If we already have a captured image, send it
      onPhotoCapture(capturedImage);
    } else {
      // Start countdown and auto-capture
      startTimerAndCapture();
    }
  };

  if (error) {
    return (
      <div className="text-center space-y-8">
        <div className="flex items-center justify-center mb-6">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>
        
        <h2 className="text-4xl font-bold mb-4" style={{ color: textColor }}>
          Camera Error
        </h2>
        
        <p className="text-xl mb-8" style={{ color: textColor }}>
          {error}
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={onBack}
            className="text-xl px-8 py-6"
          >
            <ArrowLeft className="h-6 w-6 mr-2" />
            Go Back
          </Button>
          
          <Button
            variant="default"
            size="lg"
            onClick={startCamera}
            disabled={isLoading}
            className="text-xl px-8 py-6"
          >
            <RotateCcw className="h-6 w-6 mr-2" />
            {isLoading ? 'Retrying...' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center space-y-8">
        <div className="animate-spin mx-auto">
          <Camera className="h-16 w-16 text-primary" />
        </div>
        
        <h2 className="text-4xl font-bold" style={{ color: textColor }}>
          Starting Camera...
        </h2>
        
        <p className="text-xl" style={{ color: textColor }}>
          Please allow camera access when prompted
        </p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-8">
      <h1 className="text-7xl font-bold mb-12 animate-pulse-glow" style={{ color: textColor }}>
        Strike Your Pose!
      </h1>
      
      <div className="relative max-w-4xl mx-auto mb-16 animate-scale-in">
        <div className="aspect-video bg-muted rounded-3xl border-4 border-accent shadow-3d glass animate-camera-focus relative overflow-hidden">
          {/* Live video feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-2xl bg-muted"
            style={{ 
              transform: 'scaleX(-1)', // Mirror the video for selfie mode
              backgroundColor: '#1a1a1a' // Fallback background to see if video loads
            }}
          />
          
          {/* Canvas for photo capture */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover rounded-2xl"
            style={{ 
              display: capturedImage ? 'block' : 'none',
              transform: 'scaleX(-1)' // Mirror the captured image too
            }}
          />

          {/* Countdown overlay */}
          {isCounting && countdown && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
              <div className="text-8xl font-bold text-white animate-pulse">
                {countdown}
              </div>
            </div>
          )}
          
          {/* Camera focus rings overlay */}
          <div className="absolute inset-4 border-2 border-accent/30 rounded-2xl animate-pulse-soft pointer-events-none" />
          <div className="absolute inset-8 border-2 border-accent/20 rounded-xl animate-pulse-soft pointer-events-none" style={{ animationDelay: '0.5s' }} />
          <div className="absolute inset-12 border-2 border-accent/10 rounded-lg animate-pulse-soft pointer-events-none" style={{ animationDelay: '1s' }} />
          
          {/* Rule of thirds grid */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-accent/30" />
            ))}
          </div>
          
          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-accent animate-pulse-soft pointer-events-none" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-accent animate-pulse-soft pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-accent animate-pulse-soft pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-accent animate-pulse-soft pointer-events-none" />
        </div>
        
        {/* Live indicator */}
        <div className="absolute top-6 left-6 bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-xl animate-pulse-soft neon-glow">
          🔴 LIVE
        </div>
      </div>
      
      <div className="flex gap-8 justify-center">
        <Button
          variant="outline" 
          size="lg"
          onClick={onBack}
          className="text-2xl px-12 py-8 rounded-2xl glass magnetic hover:shadow-3d transition-all duration-500"
        >
          <ArrowLeft className="h-8 w-8 mr-4" />
          Back
        </Button>
        
        <Button 
          variant="default" 
          size="lg"
          onClick={handleCaptureClick}
          disabled={!isStreamActive || isCounting}
          className="text-3xl px-20 py-10 rounded-2xl shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105 neon-glow"
        >
          <Camera className="h-10 w-10 mr-6" />
          {capturedImage ? 'Use Photo' : isCounting ? 'Capturing...' : 'Capture Magic'}
          <Sparkles className="h-8 w-8 ml-4 animate-pulse-soft" />
        </Button>
      </div>
    </div>
  );
};

export default CameraCapture;