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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreamActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

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
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          break;
        } catch (constraintError) {
          console.warn('Camera constraint failed, trying next:', constraintError);
          continue;
        }
      }

      if (!stream) {
        throw new Error('Unable to access camera with any configuration');
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Enhanced video readiness validation
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Camera initialization timeout'));
          }, 10000); // 10 second timeout

          if (videoRef.current) {
            const handleCanPlay = () => {
              if (videoRef.current) {
                // Ensure video has valid dimensions
                if (videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
                  videoRef.current.play().then(() => {
                    clearTimeout(timeout);
                    resolve();
                  }).catch(reject);
                } else {
                  // Wait a bit more for dimensions
                  setTimeout(() => {
                    if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
                      videoRef.current.play().then(() => {
                        clearTimeout(timeout);
                        resolve();
                      }).catch(reject);
                    } else {
                      clearTimeout(timeout);
                      reject(new Error('Video stream has no valid dimensions'));
                    }
                  }, 500);
                }
              }
            };

            videoRef.current.oncanplay = handleCanPlay;
            videoRef.current.onloadedmetadata = handleCanPlay; // Fallback
            
            // Trigger loading if already ready
            if (videoRef.current.readyState >= 3) { // HAVE_FUTURE_DATA
              handleCanPlay();
            }
          }
        });
        
        // Final validation before marking as active
        if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
          setIsStreamActive(true);
        } else {
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