import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAvatarGeneration = () => {
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const generateAvatar = useCallback(async (capturedPhoto: string, selectedStyle: string) => {
    if (!capturedPhoto || !selectedStyle) {
      setGenerationError('Missing photo or style selection');
      return false;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      console.log('Starting avatar generation...');
      const { data, error } = await supabase.functions.invoke('generate-avatar', {
        body: {
          image: capturedPhoto,
          style: selectedStyle
        }
      });

      if (error) {
        console.error('Avatar generation error:', error);
        setGenerationError('Failed to generate avatar. Please try again.');
        return false;
      } else if (data?.generatedImage) {
        console.log('Avatar generated successfully');
        setGeneratedAvatar(data.generatedImage);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
        return true;
      } else {
        setGenerationError('No avatar was generated. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Avatar generation failed:', error);
      setGenerationError('Failed to generate avatar. Please try again.');
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const resetGeneration = useCallback(() => {
    setGeneratedAvatar(null);
    setGenerationError(null);
    setShowConfetti(false);
    setIsGenerating(false);
  }, []);

  const sendWhatsApp = useCallback(async (
    phoneNumber: string,
    message: string,
    imageData: string,
    instanceId: string
  ) => {
    try {
      console.log('Invoking send-whatsapp-image function...');
      const { data, error } = await supabase.functions.invoke('send-whatsapp-image', {
        body: {
          phoneNumber,
          message,
          imageData,
          instanceId
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('Message sent successfully:', data);
        toast.success(`Photo sent successfully via WhatsApp! 🎉${data.messageId ? ` (ID: ${data.messageId})` : ''}`);
        return true;
      } else {
        console.error('Send failed:', data);
        const errorMsg = data?.error || data?.details || "Failed to send photo";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('WhatsApp send error:', error);
      const errorMessage = error.message || error.error_description || "Failed to send photo via WhatsApp";
      toast.error(`Error: ${errorMessage}`);
      return false;
    }
  }, []);

  const printPhoto = useCallback((imageData: string) => {
    if (!imageData) {
      toast.error("No photo to print!");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Photo</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: white;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
                width: auto;
                height: auto;
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              @media print {
                body {
                  padding: 0;
                }
                img {
                  max-width: 100%;
                  max-height: 100%;
                  width: auto;
                  height: auto;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <img src="${imageData}" alt="Photo to print" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }, []);

  return {
    generatedAvatar,
    isGenerating,
    generationError,
    showConfetti,
    generateAvatar,
    resetGeneration,
    sendWhatsApp,
    printPhoto
  };
};