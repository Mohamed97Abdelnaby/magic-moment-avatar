import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RotateCcw, Send, Printer } from "lucide-react";

const ParticleField = ({ count = 12 }: { count?: number }) => {
  return (
    <div className="particles">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: 'hsl(var(--gradient-particle))',
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
            animation: 'float 8s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  );
};

const ConfettiExplosion = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-confetti-fall bg-primary"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

interface ResultScreenProps {
  generatedAvatar: string | null;
  capturedPhoto: string | null;
  selectedStyle: string;
  generationError: string | null;
  isGenerating: boolean;
  showConfetti: boolean;
  onRetake: () => void;
  onPrintPhoto: (imageData: string) => void;
  onSendWhatsApp: (phoneNumber: string, message: string, imageData: string, instanceId: string) => Promise<boolean>;
  onGenerateAvatar: () => void;
  backgroundImageUrl?: string | null;
  overlayOpacity?: number;
  title?: string;
  textColor?: string;
  stageAnimationKey: number;
}

const ResultScreen = ({
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
  stageAnimationKey
}: ResultScreenProps) => {
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const [whatsappForm, setWhatsappForm] = useState({
    phoneNumber: '',
    message: 'Check out my special AI avatar gift! 🎁✨',
    instanceId: 'instance136415'
  });
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  const handleSendWhatsApp = async () => {
    if (!capturedPhoto) return;

    if (!whatsappForm.phoneNumber.trim()) return;

    setIsSendingWhatsApp(true);
    const imageToSend = generatedAvatar || capturedPhoto;
    const success = await onSendWhatsApp(
      whatsappForm.phoneNumber,
      whatsappForm.message,
      imageToSend,
      whatsappForm.instanceId
    );

    if (success) {
      setIsWhatsAppDialogOpen(false);
      setWhatsappForm({
        phoneNumber: '',
        message: 'Check out my special AI avatar gift! 🎁✨',
        instanceId: 'instance136415'
      });
    }
    setIsSendingWhatsApp(false);
  };

  const handlePrintPhoto = () => {
    const imageToprint = generatedAvatar || capturedPhoto;
    if (imageToprint) {
      onPrintPhoto(imageToprint);
    }
  };

  return (
    <div className="text-center relative" key={`result-${stageAnimationKey}`}>
      {showConfetti && <ConfettiExplosion />}
      {backgroundImageUrl && (
        <div className="absolute inset-0" style={{ backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}
      {typeof overlayOpacity === 'number' && backgroundImageUrl && (
        <div className="absolute inset-0" style={{ background: `hsla(0 0% 0% / ${overlayOpacity})` }} />
      )}
      <ParticleField count={25} />
      
      <div className="animate-fade-in-up relative z-10">
        <h1 className="text-8xl font-bold mb-12 animate-bounce-in" style={{ color: textColor }}>
          {generationError ? 'Oops! Using your original photo 📸' : title || 'Your Avatar is Ready! 🎉'}
        </h1>
        {generationError && (
        <p className="text-xl mb-8 text-muted-foreground">
          {generationError}
        </p>
        )}
      </div>

      {generationError && (
        <div className="mb-8">
          <Button
            onClick={onGenerateAvatar}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-8 py-4 text-xl"
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Try AI Generation Again'}
          </Button>
        </div>
      )}
      
      <div className="max-w-lg mx-auto mb-16 animate-flip-3d">
        <Card className="p-12 shadow-glow glass border-4 border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 gradient-glow animate-pulse-glow" />
          
          <div className="relative z-10">
            <div className="aspect-square bg-muted rounded-3xl overflow-hidden mb-8 shadow-3d animate-pulse-glow">
              {(generatedAvatar || capturedPhoto) ? (
                <img 
                  src={generatedAvatar || capturedPhoto} 
                  alt={generatedAvatar ? "Your AI-generated avatar" : "Your captured photo"} 
                  className="w-full h-full object-cover animate-float"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-[12rem] animate-float">🎭</div>
                </div>
              )}
            </div>
            <p className="text-3xl font-semibold mb-4">
              {generatedAvatar ? 'AI-Generated Egyptian Avatar' : `${selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Style`}
            </p>
            <p className="text-xl text-muted-foreground">
              {generatedAvatar ? 'Your cultural transformation is complete!' : 'Ready to share with the world!'}
            </p>
          </div>
          
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-float opacity-60"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              ✨
            </div>
          ))}
        </Card>
      </div>
      
      <div className="flex flex-wrap gap-6 justify-center mb-8">
        <Button 
          variant="outline" 
          size="lg"
          onClick={onRetake}
          className="text-2xl px-12 py-8 rounded-2xl glass magnetic hover:shadow-3d transition-all duration-500"
        >
          <RotateCcw className="h-8 w-8 mr-4" />
          Retake
        </Button>
        
        <Button 
          variant="default" 
          size="lg"
          onClick={handlePrintPhoto}
          className="text-2xl px-12 py-8 rounded-2xl shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105 neon-glow"
        >
          <Printer className="h-8 w-8 mr-4" />
          Print Avatar
        </Button>
        
        <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="default" 
              size="lg"
              className="text-2xl px-12 py-8 rounded-2xl shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105 neon-glow bg-primary hover:bg-primary/90"
            >
              <Send className="h-8 w-8 mr-4" />
              Send to WhatsApp
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send Avatar via WhatsApp</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={whatsappForm.phoneNumber}
                  onChange={(e) => setWhatsappForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+1234567890"
                />
              </div>
              <Button 
                onClick={handleSendWhatsApp} 
                disabled={isSendingWhatsApp}
                className="w-full"
              >
                {isSendingWhatsApp ? "Sending..." : "Send Special Gift"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ResultScreen;