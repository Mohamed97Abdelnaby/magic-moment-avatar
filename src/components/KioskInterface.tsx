import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, ArrowLeft, ArrowRight, RotateCcw, Send, Printer, Sparkles, Heart } from "lucide-react";
import AIRobotDrawing from "./AIRobotDrawing";
import QuoteDisplay from "./QuoteDisplay";

interface KioskInterfaceProps {
  customColors?: {
    primary: string;
    secondary?: string;
    backgroundStyle?: 'solid' | 'gradient' | 'default';
  };
}

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
          className="absolute w-2 h-2 rounded-full animate-confetti-fall"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

const NeuralNetwork = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg width="100%" height="100%" className="animate-neural-pulse">
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i}>
            <circle
              cx={`${20 + (i % 4) * 20}%`}
              cy={`${30 + Math.floor(i / 4) * 20}%`}
              r="3"
              fill="hsl(var(--primary))"
              opacity="0.6"
            />
            {i < 8 && (
              <line
                x1={`${20 + (i % 4) * 20}%`}
                y1={`${30 + Math.floor(i / 4) * 20}%`}
                x2={`${20 + ((i + 1) % 4) * 20}%`}
                y2={`${30 + Math.floor((i + 1) / 4) * 20}%`}
                stroke="hsl(var(--primary))"
                strokeWidth="1"
                opacity="0.4"
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

const KioskInterface = ({ customColors }: KioskInterfaceProps = {}) => {
  const [currentStep, setCurrentStep] = useState<'styles' | 'camera' | 'countdown' | 'loading' | 'result'>('styles');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [countdown, setCountdown] = useState(3);
  const [showConfetti, setShowConfetti] = useState(false);
  const [stageAnimationKey, setStageAnimationKey] = useState(0);

  // Quote collections for different stages
  const countdownQuotes = [
    "Take a deep breath and let your authentic self shine...",
    "In stillness, we find our truest expression...",
    "Every moment of pause is a moment of possibility...",
    "Breathe in confidence, breathe out perfection..."
  ];

  const generationQuotes = [
    "Art is not what you see, but what you make others see...",
    "Every artist dips their brush in their soul...",
    "Creativity takes courage - you're being brave...",
    "Your unique story is being painted right now...",
    "In the dance of pixels and imagination, magic happens..."
  ];

  const avatarStyles = [
    { id: "pixar", name: "Pixar Style", preview: "🎭", description: "3D Animated Magic" },
    { id: "cyberpunk", name: "Cyberpunk", preview: "🤖", description: "Futuristic Neon" },
    { id: "cartoon", name: "90s Cartoon", preview: "🎨", description: "Retro Animation" },
    { id: "sketch", name: "Sketch Art", preview: "✏️", description: "Hand-drawn Style" },
    { id: "anime", name: "Anime", preview: "👾", description: "Japanese Animation" },
    { id: "oil", name: "Oil Painting", preview: "🖼️", description: "Classical Art" },
  ];

  useEffect(() => {
    setStageAnimationKey(prev => prev + 1);
  }, [currentStep]);

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
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
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
    setShowConfetti(false);
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'styles':
        return (
          <div className="text-center relative" key={`styles-${stageAnimationKey}`}>
            <ParticleField count={15} />
            
            <div className="animate-fade-in-up">
              <h1 className="text-7xl font-bold mb-6 gradient-primary bg-clip-text text-transparent animate-scale-in">
                Choose Your Style
              </h1>
              <p className="text-3xl text-muted-foreground mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Select how you want your avatar to look
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
              {avatarStyles.map((style, index) => (
                <div
                  key={style.id}
                  className="animate-bounce-in card-3d"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <button
                    onClick={() => handleStyleSelect(style.id)}
                    className={`w-full p-8 rounded-3xl border-4 transition-all duration-500 transform-3d magnetic relative overflow-hidden ${
                      selectedStyle === style.id
                        ? 'border-primary shadow-glow bg-primary/10 scale-105 neon-glow'
                        : 'border-border hover:border-primary/50 hover:shadow-3d glass'
                    }`}
                  >
                    <div className="relative z-10">
                      <div className="text-8xl mb-6 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                        {style.preview}
                      </div>
                      <h3 className="text-3xl font-bold mb-2">{style.name}</h3>
                      <p className="text-lg text-muted-foreground">{style.description}</p>
                    </div>
                    
                    {selectedStyle === style.id && (
                      <div className="absolute inset-0 gradient-glow animate-pulse-glow" />
                    )}
                  </button>
                </div>
              ))}
            </div>
            
            {selectedStyle && (
              <div className="animate-scale-in">
                <Button 
                  variant="default" 
                  size="lg" 
                  onClick={handleStartCamera}
                  className="text-3xl px-20 py-10 rounded-2xl shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105 neon-glow"
                >
                  <Camera className="h-10 w-10 mr-6" />
                  Begin Your Journey
                  <ArrowRight className="h-10 w-10 ml-6" />
                  <Heart className="h-8 w-8 ml-4 animate-pulse-soft" />
                </Button>
              </div>
            )}
          </div>
        );

      case 'camera':
        return (
          <div className="text-center relative" key={`camera-${stageAnimationKey}`}>
            <ParticleField count={10} />
            
            <div className="animate-fade-in-up">
              <h1 className="text-7xl font-bold mb-12 text-accent animate-pulse-glow">
                Get Ready!
              </h1>
            </div>
            
            <div className="relative max-w-4xl mx-auto mb-16 animate-scale-in">
              <div className="aspect-video bg-muted rounded-3xl border-4 border-accent flex items-center justify-center shadow-3d glass animate-camera-focus relative overflow-hidden">
                {/* Camera focus rings */}
                <div className="absolute inset-4 border-2 border-accent/30 rounded-2xl animate-pulse-soft" />
                <div className="absolute inset-8 border-2 border-accent/20 rounded-xl animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
                <div className="absolute inset-12 border-2 border-accent/10 rounded-lg animate-pulse-soft" style={{ animationDelay: '1s' }} />
                
                {/* Rule of thirds grid */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-accent/30" />
                  ))}
                </div>
                
                <Camera className="h-40 w-40 text-accent animate-pulse-glow relative z-10" />
                
                {/* Corner brackets */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-accent animate-pulse-soft" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-accent animate-pulse-soft" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-accent animate-pulse-soft" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-accent animate-pulse-soft" />
              </div>
              
              <div className="absolute top-6 left-6 bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-xl animate-pulse-soft neon-glow">
                🔴 LIVE
              </div>
            </div>
            
            <div className="flex gap-8 justify-center">
              <Button
                variant="outline" 
                size="lg"
                onClick={() => setCurrentStep('styles')}
                className="text-2xl px-12 py-8 rounded-2xl glass magnetic hover:shadow-3d transition-all duration-500"
              >
                <ArrowLeft className="h-8 w-8 mr-4" />
                Back
              </Button>
              
              <Button 
                variant="default" 
                size="lg"
                onClick={handleTakePhoto}
                className="text-3xl px-20 py-10 rounded-2xl shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105 neon-glow"
              >
                <Camera className="h-10 w-10 mr-6" />
                Capture Magic
                <Sparkles className="h-8 w-8 ml-4 animate-pulse-soft" />
              </Button>
            </div>
          </div>
        );

      case 'countdown':
        return (
          <div className="text-center relative min-h-screen flex items-center justify-center" key={`countdown-${stageAnimationKey}`}>
            <ParticleField count={8} />
            
            {/* Gentle background glow */}
            <div className="absolute inset-0 gradient-subtle opacity-30" />
            
            <div className="relative z-10 space-y-12">
              <div className="space-y-8 animate-fade-in-up">
                <h1 className="text-5xl font-light mb-8 text-primary">
                  Take a moment...
                </h1>
                
                <QuoteDisplay 
                  quotes={countdownQuotes}
                  className="mb-12"
                  interval={2500}
                />
              </div>
              
              {/* Simple, elegant countdown */}
              <div className="relative">
                <div className="text-[8rem] font-light text-accent/80 transition-all duration-1000 ease-out animate-breathe">
                  {countdown}
                </div>
              </div>
              
              <p className="text-2xl text-muted-foreground font-light">
                When you're ready... 🌸
              </p>
            </div>
          </div>
        );

      case 'loading':
        return (
          <div className="text-center relative min-h-screen flex items-center justify-center" key={`loading-${stageAnimationKey}`}>
            <ParticleField count={6} />
            
            {/* Soft, artistic background */}
            <div className="absolute inset-0 gradient-subtle opacity-40" />
            
            <div className="relative z-10 space-y-12">
              <div className="space-y-8 animate-watercolor-bloom">
                <h1 className="text-4xl font-light gradient-primary bg-clip-text text-transparent">
                  Crafting your artistic vision...
                </h1>
                
                <QuoteDisplay 
                  quotes={generationQuotes}
                  className="mb-8"
                  interval={3500}
                />
              </div>
              
              <AIRobotDrawing selectedStyle={selectedStyle} />
              
              <div className="mt-8 space-y-6">
                <p className="text-xl text-muted-foreground font-light">
                  Creating your {selectedStyle} masterpiece
                </p>
                <div className="flex justify-center items-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"
                      style={{ 
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: '1.5s'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'result':
        return (
          <div className="text-center relative" key={`result-${stageAnimationKey}`}>
            {showConfetti && <ConfettiExplosion />}
            <ParticleField count={25} />
            
            <div className="animate-fade-in-up">
              <h1 className="text-8xl font-bold mb-12 gradient-primary bg-clip-text text-transparent animate-bounce-in">
                Your Avatar is Ready! 🎉
              </h1>
            </div>
            
            <div className="max-w-lg mx-auto mb-16 animate-flip-3d">
              <Card className="p-12 shadow-glow glass border-4 border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 gradient-glow animate-pulse-glow" />
                
                <div className="relative z-10">
                  <div className="aspect-square bg-muted rounded-3xl flex items-center justify-center mb-8 shadow-3d animate-pulse-glow">
                    <div className="text-[12rem] animate-float">🎭</div>
                  </div>
                  <p className="text-3xl font-semibold mb-4">
                    {selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Style
                  </p>
                  <p className="text-xl text-muted-foreground">
                    Ready to share with the world!
                  </p>
                </div>
                
                {/* Floating sparkles */}
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
                onClick={handleRetake}
                className="text-2xl px-12 py-8 rounded-2xl glass magnetic hover:shadow-3d transition-all duration-500"
              >
                <RotateCcw className="h-8 w-8 mr-4" />
                Retake
              </Button>
              
              <Button 
                variant="default" 
                size="lg"
                className="text-2xl px-12 py-8 rounded-2xl shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105 neon-glow"
              >
                <Printer className="h-8 w-8 mr-4" />
                Print
              </Button>
              
              <Button 
                variant="default" 
                size="lg"
                className="text-2xl px-12 py-8 rounded-2xl shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105 neon-glow bg-green-600 hover:bg-green-500"
              >
                <Send className="h-8 w-8 mr-4" />
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 gradient-subtle opacity-50" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-7xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default KioskInterface;