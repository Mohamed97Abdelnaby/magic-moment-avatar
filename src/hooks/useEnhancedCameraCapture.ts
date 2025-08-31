import { useState, useRef, useCallback } from 'react';

interface EnhancedCameraCaptureHook {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isLoading: boolean;
  error: string | null;
  isStreamActive: boolean;
  countdown: number | null;
  isCounting: boolean;
  capturedImage: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  startTimerAndCapture: () => void;
  capturePhoto: () => string | null;
}

export const useEnhancedCameraCapture = (): EnhancedCameraCaptureHook => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreamActive, setIsStreamActive] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    console.log('🛑 Stopping camera and cleaning up...');
    
    // Clear countdown if running
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsCounting(false);
    setCountdown(null);
    setCapturedImage(null);
    
    // Stop all media tracks
    if (streamRef.current) {
      console.log('📺 Stopping media tracks:', streamRef.current.getTracks().length);
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🔌 Stopped track:', track.kind, track.label);
      });
      streamRef.current = null;
    }
    
    // Clear video element completely
    if (videoRef.current) {
      console.log('📺 Clearing video element...');
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }
    
    setIsStreamActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    console.log('🎥 Starting enhanced camera...');
    setIsLoading(true);
    setError(null);
    setCapturedImage(null);

    try {
      // Clean up any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Use minimal constraints for maximum compatibility
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        // Direct assignment like the original JavaScript
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Explicitly start video playback for reliable preview
        try {
          await videoRef.current.play();
          console.log("✅ Camera stream started and playing.");
          setIsStreamActive(true);
        } catch (playError) {
          console.log("⚠️ Video play failed, trying without await:", playError);
          // Try play without await for some browsers
          videoRef.current.play();
          setIsStreamActive(true);
        }
      }
    } catch (err) {
      console.error("❌ Error accessing camera: ", err);
      setError("Camera access denied or unavailable");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const capturePhoto = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      console.error('❌ Video or canvas element not available');
      return null;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('❌ Video not ready - no dimensions');
      return null;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      console.error('❌ Canvas context not available');
      return null;
    }

    // Set canvas dimensions to match video exactly
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current frame (mirrored like the video)
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    
    // Convert to image data (PNG format for OpenAI compatibility)
    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);
    
    console.log('📸 Photo captured successfully', video.videoWidth + 'x' + video.videoHeight);
    return imageData;
  }, []);

  const startTimerAndCapture = useCallback(() => {
    if (!videoRef.current || !isStreamActive) {
      console.error('❌ Cannot start timer - video not ready');
      return;
    }

    let seconds = 3; // 3-second default as requested
    setCountdown(seconds);
    setIsCounting(true);

    countdownIntervalRef.current = setInterval(() => {
      seconds--;
      if (seconds > 0) {
        setCountdown(seconds);
      } else {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setCountdown(null);
        setIsCounting(false);
        capturePhoto();
      }
    }, 1000);
  }, [capturePhoto, isStreamActive]);

  return {
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
    capturePhoto
  };
};