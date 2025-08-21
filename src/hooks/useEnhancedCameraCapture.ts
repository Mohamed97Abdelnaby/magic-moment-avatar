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
    
    // Stop media tracks
    if (streamRef.current) {
      console.log('📺 Stopping media tracks:', streamRef.current.getTracks().length);
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🔌 Stopped track:', track.kind, track.label);
      });
      streamRef.current = null;
    }
    
    // Clear video element
    if (videoRef.current) {
      console.log('📺 Clearing video element...');
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }
    
    setIsStreamActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    console.log('🎥 Starting enhanced camera...');
    setIsLoading(true);
    setError(null);

    try {
      // Simple getUserMedia call like the original JavaScript
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        // Direct assignment like the original code
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        console.log("✅ Camera stream started.");
        setIsStreamActive(true);
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

    const context = canvas.getContext('2d');
    if (!context) {
      console.error('❌ Canvas context not available');
      return null;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Hide video and show canvas (like original code)
    canvas.style.display = "block";
    video.style.display = "none";
    
    // Convert to image data
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
    
    console.log('📸 Photo captured successfully');
    return imageData;
  }, []);

  const startTimerAndCapture = useCallback(() => {
    let seconds = 10;
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
  }, [capturePhoto]);

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