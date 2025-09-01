import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, Printer, MessageCircle, Download, Share, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { KioskScreenTextScope } from "../kiosk/KioskThemeWrapper";
import ParticleField from "./ParticleField";

const ConfettiExplosion = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 opacity-80 animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
};

interface SharedResultScreenProps {
  mode: 'kiosk' | 'preview';
  generatedAvatar?: string | null;
  capturedPhoto?: string | null;
  selectedStyle?: string;
  generationError?: string | null;
  isGenerating?: boolean;
  showConfetti?: boolean;
  onRetake: () => void;
  onPrintPhoto: (imageData: string) => void;
  onSendWhatsApp: (phoneNumber: string, imageData: string) => Promise<boolean>;
  onGenerateAvatar: () => void;
  backgroundImageUrl?: string | null;
  overlayOpacity?: number;
  title?: string;
  textColor?: string;
  backgroundColor?: string;
  stageAnimationKey?: number;
  // Preview-specific props
  isInteractive?: boolean;
}

const SharedResultScreen = ({
  mode,
  generatedAvatar,
  capturedPhoto,
  selectedStyle,
  generationError,
  isGenerating,
  showConfetti,
  onRetake,
  onPrintPhoto,
  onSendWhatsApp,
  onGenerateAvatar,
  backgroundImageUrl,
  overlayOpacity,
  title,
  textColor,
  backgroundColor,
  stageAnimationKey = 0,
  isInteractive = true
}: SharedResultScreenProps) => {
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const { toast } = useToast();

  const containerClasses = mode === 'preview' 
    ? "relative h-full overflow-hidden" 
    : "relative min-h-screen overflow-hidden";

  const mockAvatar = mode === 'preview' ? 
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
    : generatedAvatar;

  const displayImage = mockAvatar || capturedPhoto;

  const handleSendWhatsApp = async () => {
    if (!isInteractive) return;
    
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    const success = await onSendWhatsApp(phoneNumber, displayImage || '');
    if (success) {
      setWhatsappDialogOpen(false);
      setPhoneNumber("");
    }
  };

  return (
    <div className={containerClasses} key={`result-${stageAnimationKey}`}>
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

      {showConfetti && mode === 'kiosk' && <ConfettiExplosion />}
      {mode === 'kiosk' && <ParticleField count={20} />}
      
      <KioskScreenTextScope color={textColor} backgroundColor={backgroundColor} className="relative z-10">
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
          <h1 className={`${mode === 'preview' ? 'text-3xl' : 'text-6xl'} font-bold mb-8 animate-fade-in`}>
            {generationError ? "Oops! Something went wrong" : (title || "Your Avatar is Ready!")}
          </h1>

          {generationError && (
            <div className="mb-8 p-6 bg-red-500/20 border border-red-500/30 rounded-xl max-w-md">
              <p className="text-red-200 mb-4">{generationError}</p>
              <Button 
                onClick={isInteractive ? onGenerateAvatar : () => {}}
                disabled={isGenerating || !isInteractive}
                variant="outline"
                className="border-red-500/50 hover:bg-red-500/20"
              >
                Try Again
              </Button>
            </div>
          )}

          {displayImage && !generationError && (
            <Card className={`mb-8 overflow-hidden border-4 border-primary/30 shadow-glow animate-scale-in ${
              mode === 'preview' ? 'max-w-sm' : 'max-w-2xl'
            }`}>
              <CardContent className="p-0">
                <img 
                  src={displayImage} 
                  alt={mockAvatar ? "Avatar preview" : "Generated avatar"}
                  className="w-full h-auto"
                  style={{ maxHeight: mode === 'preview' ? '300px' : '600px', objectFit: 'contain' }}
                />
              </CardContent>
            </Card>
          )}

          {displayImage && !generationError && (
            <div className={`grid ${mode === 'preview' ? 'grid-cols-1 gap-2' : 'grid-cols-1 md:grid-cols-3 gap-6'} max-w-4xl animate-fade-in`} style={{ animationDelay: '0.3s' }}>
              <Button 
                onClick={isInteractive ? onRetake : () => {}}
                disabled={!isInteractive}
                variant="outline"
                size={mode === 'preview' ? 'sm' : 'lg'}
                className={`${mode === 'preview' ? 'px-4 py-2' : 'px-8 py-6 text-xl'} border-white/30 hover:bg-white/10`}
              >
                <RotateCcw className={`${mode === 'preview' ? 'h-4 w-4 mr-2' : 'h-6 w-6 mr-3'}`} />
                Start Over
              </Button>

              {mode === 'kiosk' && (
                <>
                  <Button 
                    onClick={() => isInteractive && displayImage && onPrintPhoto(displayImage)}
                    disabled={!isInteractive}
                    variant="outline"
                    size="lg"
                    className="px-8 py-6 text-xl border-white/30 hover:bg-white/10"
                  >
                    <Printer className="h-6 w-6 mr-3" />
                    Print Photo
                  </Button>

                  <Dialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        size="lg"
                        className="px-8 py-6 text-xl border-white/30 hover:bg-white/10"
                        disabled={!isInteractive}
                      >
                        <MessageCircle className="h-6 w-6 mr-3" />
                        Send via WhatsApp
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background border-border">
                      <DialogHeader>
                        <DialogTitle>Send to WhatsApp</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1234567890"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleSendWhatsApp} className="w-full">
                          Send
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {mode === 'preview' && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    disabled
                    className="flex-1 px-3 py-2 text-xs border-white/30"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    disabled
                    className="flex-1 px-3 py-2 text-xs border-white/30"
                  >
                    <Share className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
              )}
            </div>
          )}

          {!displayImage && !generationError && (
            <div className="flex items-center justify-center p-8">
              <ImageIcon className={`${mode === 'preview' ? 'h-16 w-16' : 'h-24 w-24'} text-gray-400 animate-pulse`} />
            </div>
          )}
        </div>
      </KioskScreenTextScope>
    </div>
  );
};

export default SharedResultScreen;