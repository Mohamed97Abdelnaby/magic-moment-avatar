import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, ArrowLeft, ArrowRight, RotateCcw, Send, Printer } from "lucide-react";

const KioskInterface = () => {
  const [currentStep, setCurrentStep] = useState<'styles' | 'camera' | 'countdown' | 'loading' | 'result'>('styles');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [countdown, setCountdown] = useState(3);

  const avatarStyles = [
    { id: "pixar", name: "Pixar Style", preview: "🎭" },
    { id: "cyberpunk", name: "Cyberpunk", preview: "🤖" },
    { id: "cartoon", name: "90s Cartoon", preview: "🎨" },
    { id: "sketch", name: "Sketch Art", preview: "✏️" },
    { id: "anime", name: "Anime", preview: "👾" },
    { id: "oil", name: "Oil Painting", preview: "🖼️" },
  ];

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const handleStartCamera = () => {
    setCurrentStep('camera');
  };

  const handleTakePhoto = () => {
    setCurrentStep('countdown');
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setCurrentStep('loading');
          
          // Simulate AI generation
          setTimeout(() => {
            setCurrentStep('result');
          }, 3000);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRetake = () => {
    setCurrentStep('styles');
    setSelectedStyle('');
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'styles':
        return (
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
              Choose Your Style
            </h1>
            <p className="text-2xl text-muted-foreground mb-12">
              Select how you want your avatar to look
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              {avatarStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id)}
                  className={`p-8 rounded-2xl border-4 transition-smooth transform hover:scale-105 ${
                    selectedStyle === style.id
                      ? 'border-primary shadow-medium bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-6xl mb-4">{style.preview}</div>
                  <h3 className="text-2xl font-bold">{style.name}</h3>
                </button>
              ))}
            </div>
            
            {selectedStyle && (
              <Button 
                variant="kiosk" 
                size="lg" 
                onClick={handleStartCamera}
                className="text-2xl px-16 py-8"
              >
                <Camera className="h-8 w-8 mr-4" />
                Start Camera
                <ArrowRight className="h-8 w-8 ml-4" />
              </Button>
            )}
          </div>
        );

      case 'camera':
        return (
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-8 text-accent">
              Get Ready!
            </h1>
            
            <div className="relative max-w-2xl mx-auto mb-12">
              <div className="aspect-video bg-muted rounded-2xl border-4 border-dashed border-accent flex items-center justify-center shadow-medium">
                <Camera className="h-32 w-32 text-accent animate-pulse-soft" />
              </div>
              <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-4 py-2 rounded-lg font-bold">
                LIVE
              </div>
            </div>
            
            <div className="flex gap-6 justify-center">
              <Button
                variant="outline" 
                size="lg"
                onClick={() => setCurrentStep('styles')}
                className="text-xl px-8 py-6"
              >
                <ArrowLeft className="h-6 w-6 mr-2" />
                Back
              </Button>
              
              <Button 
                variant="kiosk" 
                size="lg"
                onClick={handleTakePhoto}
                className="text-2xl px-16 py-8"
              >
                <Camera className="h-8 w-8 mr-4" />
                Take Photo
              </Button>
            </div>
          </div>
        );

      case 'countdown':
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-8 text-accent">
              Get Ready...
            </h1>
            
            <div className="text-[20rem] font-bold text-accent animate-pulse-soft">
              {countdown}
            </div>
          </div>
        );

      case 'loading':
        return (
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-8 gradient-primary bg-clip-text text-transparent">
              Creating Your Avatar...
            </h1>
            
            <div className="relative max-w-md mx-auto mb-12">
              <div className="w-64 h-64 bg-primary rounded-full animate-pulse-soft mx-auto shadow-medium" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 bg-background rounded-full flex items-center justify-center shadow-soft">
                  <Camera className="h-24 w-24 text-primary animate-pulse-soft" />
                </div>
              </div>
            </div>
            
            <p className="text-2xl text-muted-foreground animate-pulse-soft">
              AI is working its magic...
            </p>
          </div>
        );

      case 'result':
        return (
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-8 gradient-primary bg-clip-text text-transparent">
              Your Avatar is Ready!
            </h1>
            
            <div className="max-w-md mx-auto mb-12">
              <Card className="p-8 shadow-medium">
                <div className="aspect-square bg-muted rounded-2xl flex items-center justify-center mb-4">
                  <div className="text-8xl">🎭</div>
                </div>
                <p className="text-xl font-semibold">{selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Style</p>
              </Card>
            </div>
            
            <div className="flex gap-6 justify-center mb-8">
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleRetake}
                className="text-xl px-8 py-6"
              >
                <RotateCcw className="h-6 w-6 mr-2" />
                Retake
              </Button>
              
              <Button 
                variant="default" 
                size="lg"
                className="text-xl px-8 py-6"
              >
                <Printer className="h-6 w-6 mr-2" />
                Print
              </Button>
              
              <Button 
                variant="accent" 
                size="lg"
                className="text-xl px-8 py-6"
              >
                <Send className="h-6 w-6 mr-2" />
                Send to WhatsApp
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default KioskInterface;