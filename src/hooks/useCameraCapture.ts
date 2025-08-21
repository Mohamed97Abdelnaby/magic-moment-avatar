import { useState, useRef, useCallback, useEffect } from 'react';

interface CameraCaptureHook {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isLoading: boolean;
  error: string | null;
  isStreamActive: boolean;
  capturedImage: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => string | null;
  retryCamera: () => Promise<void>;
}

export const useCameraCapture = (): CameraCaptureHook => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    console.log('🛑 Stopping camera and cleaning up...');
    if (streamRef.current) {
      console.log('📺 Stopping media tracks:', streamRef.current.getTracks().length);
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🔌 Stopped track:', track.kind, track.label);
      });
      streamRef.current = null;
    }
    setIsStreamActive(false);
    if (videoRef.current) {
      console.log('📺 Clearing video element...');
      videoRef.current.srcObject = null;
      videoRef.current.load(); // Force reload to clear any cached stream
    }
  }, []);

  const startCamera = useCallback(async () => {
    console.log('🎥 Starting camera...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if camera is supported
      console.log('📱 Checking camera support...');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ Camera API not supported');
        throw new Error('Camera access is not supported in this browser');
      }
      console.log('✅ Camera API supported');

      let stream: MediaStream | null = null;
      
      // Try multiple camera constraints with fallbacks
      const constraints = [
        {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        },
        {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        },
        {
          video: true // Fallback to any available camera
        }
      ];

      for (const constraint of constraints) {
        try {
          console.log('🔍 Trying camera constraint:', constraint);
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          console.log('✅ Camera stream obtained:', stream.getTracks());
          break;
        } catch (constraintError) {
          console.warn('❌ Camera constraint failed, trying next:', constraintError);
          continue;
        }
      }

      if (!stream) {
        throw new Error('Unable to access camera with any configuration');
      }

      if (videoRef.current) {
        const video = videoRef.current;
        console.log('📺 Assigning stream to video element...');
        
        // Add video event listeners for debugging
        video.addEventListener('loadstart', () => console.log('📺 Video loadstart'));
        video.addEventListener('loadeddata', () => console.log('📺 Video loadeddata'));
        video.addEventListener('loadedmetadata', () => console.log('📺 Video loadedmetadata, dimensions:', video.videoWidth, 'x', video.videoHeight));
        video.addEventListener('canplay', () => console.log('📺 Video canplay, readyState:', video.readyState));
        video.addEventListener('play', () => console.log('📺 Video started playing'));
        video.addEventListener('pause', () => console.log('📺 Video paused'));
        video.addEventListener('error', (e) => console.error('📺 Video error:', e));
        
        video.srcObject = stream;
        streamRef.current = stream;
        
        // Force video to load and display immediately
        video.load();
        console.log('📺 Stream assigned to video element, forcing load...');
        
        // Immediately try to play without waiting for events
        console.log('📺 Forcing immediate video play attempt...');
        try {
          const playPromise = video.play();
          if (playPromise) {
            await playPromise;
            console.log('✅ Immediate play succeeded');
          }
        } catch (immediatePlayError) {
          console.log('⚠️ Immediate play failed, will wait for events:', immediatePlayError);
        }
        
        // Enhanced video readiness validation with better play handling
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.error('⏰ Camera initialization timeout');
            reject(new Error('Camera initialization timeout'));
          }, 15000); // Increased timeout to 15 seconds

          const attemptPlay = async () => {
            if (!video) return;
            
            console.log('🎬 Attempting to play video...');
            console.log('📺 Video state - readyState:', video.readyState, 'dimensions:', video.videoWidth, 'x', video.videoHeight);
            
            try {
              // Ensure we have valid video dimensions
              if (video.videoWidth === 0 || video.videoHeight === 0) {
                console.log('⏳ Waiting for video dimensions...');
                return false;
              }
              
              // Try to play the video
              const playPromise = video.play();
              if (playPromise !== undefined) {
                await playPromise;
                console.log('✅ Video play() succeeded');
              }
              
              // Double-check the video is actually playing
              if (!video.paused && video.currentTime > 0) {
                console.log('✅ Video confirmed playing, currentTime:', video.currentTime);
                clearTimeout(timeout);
                resolve();
                return true;
              } else {
                console.log('⚠️ Video play() succeeded but not actually playing yet...');
                return false;
              }
            } catch (playError) {
              console.error('❌ Video play() failed:', playError);
              
              // Try to handle autoplay policy issues
              if (playError.name === 'NotAllowedError') {
                console.log('🔄 Autoplay blocked, will try user interaction fallback');
                // We'll handle this in the component with a click handler
                clearTimeout(timeout);
                resolve(); // Resolve anyway, user can click to start
                return true;
              }
              throw playError;
            }
          };

          const handleVideoReady = async () => {
            const success = await attemptPlay();
            if (!success) {
              // Retry after a short delay
              setTimeout(handleVideoReady, 200);
            }
          };

          video.addEventListener('loadedmetadata', handleVideoReady);
          video.addEventListener('canplay', handleVideoReady);
          
          // Also try immediately if already ready
          if (video.readyState >= 1) { // HAVE_METADATA
            setTimeout(handleVideoReady, 100);
          }
        });
        
        // Final validation before marking as active
        if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
          console.log('✅ Camera ready! Dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
          setIsStreamActive(true);
        } else {
          console.error('❌ Video validation failed. Dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
          throw new Error('Video stream initialization failed - no valid video dimensions');
        }
      }
    } catch (err) {
      console.error('Camera access error:', err);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please allow camera access to take photos.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else if (err.name === 'NotSupportedError') {
          setError('Camera is not supported in this browser.');
        } else if (err.message.includes('timeout') || err.message.includes('dimensions')) {
          setError('Camera is not responding properly. Please try again or check your camera.');
        } else {
          setError(err.message || 'Failed to access camera. Please try again.');
        }
      } else {
        setError('An unexpected error occurred while accessing the camera.');
      }
      
      stopCamera();
    } finally {
      setIsLoading(false);
    }
  }, [stopCamera]);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current || !isStreamActive) {
      console.warn('Capture failed: video, canvas, or stream not ready');
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Validate video has content
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('Capture failed: video has no dimensions');
      return null;
    }

    // Validate video is actually playing
    if (video.paused || video.ended || video.readyState < 2) {
      console.warn('Capture failed: video not playing properly');
      return null;
    }
    
    const context = canvas.getContext('2d');
    if (!context) {
      console.warn('Capture failed: cannot get 2d context');
      return null;
    }

    try {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear canvas first
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw the current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64 image with high quality
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Validate the captured image isn't empty
      if (imageDataUrl.length < 1000) { // Very small data URL likely means empty image
        console.warn('Capture failed: resulting image appears empty');
        return null;
      }
      
      setCapturedImage(imageDataUrl);
      console.log('Photo captured successfully:', canvas.width, 'x', canvas.height);
      
      return imageDataUrl;
    } catch (error) {
      console.error('Error during photo capture:', error);
      return null;
    }
  }, [isStreamActive]);

  const retryCamera = useCallback(async () => {
    stopCamera();
    await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay
    await startCamera();
  }, [stopCamera, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isLoading,
    error,
    isStreamActive,
    capturedImage,
    startCamera,
    stopCamera,
    capturePhoto,
    retryCamera
  };
};