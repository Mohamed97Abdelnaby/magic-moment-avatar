import { useRef, useState, useCallback } from 'react';

export const useEnhancedCameraCapture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCounting, setIsCounting] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    console.log('🎬 Starting enhanced camera...');
    setIsLoading(true);
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreamActive(true);
        console.log('📹 Enhanced camera stream active');
      }
    } catch (err) {
      console.error('❌ Enhanced camera error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError('Failed to access camera. Please try again.');
        }
      } else {
        setError('Unknown camera error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    console.log('🛑 Stopping enhanced camera...');
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreamActive(false);
    setCountdown(null);
    setIsCounting(false);
    setCapturedImage(null);
  }, []);

  const startTimerAndCapture = useCallback(() => {
    if (!isStreamActive || isCounting) return;
    
    console.log('⏰ Starting countdown...');
    setIsCounting(true);
    let count = 3;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        setCountdown(null);
        setIsCounting(false);
        capturePhoto();
      }
    }, 1000);
  }, [isStreamActive, isCounting]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('❌ Video or canvas ref not available');
      return;
    }
    
    console.log('📸 Capturing enhanced photo...');
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.error('❌ Canvas context not available');
      return;
    }
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to canvas (flip horizontally for selfie effect)
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    
    // Get image data
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
    console.log('✅ Enhanced photo captured successfully');
  }, []);

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
  };
};