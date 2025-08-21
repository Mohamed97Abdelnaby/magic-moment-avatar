import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, Check } from "lucide-react";

interface PhotoPreviewProps {
  capturedPhoto: string;
  onRetake: () => void;
  onConfirm: () => void;
  textColor?: string;
}

const PhotoPreview = ({ capturedPhoto, onRetake, onConfirm, textColor }: PhotoPreviewProps) => {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h1 
          className="text-6xl font-bold mb-4 animate-fade-in-up" 
          style={{ color: textColor }}
        >
          How do you look? 📸
        </h1>
        <p 
          className="text-2xl animate-fade-in-up" 
          style={{ color: textColor, animationDelay: '0.2s' }}
        >
          Take a look at your photo
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="p-6 shadow-glow glass border-4 border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 gradient-glow animate-pulse-glow opacity-30" />
          
          <div className="relative z-10">
            <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-3d">
              <img 
                src={capturedPhoto} 
                alt="Your captured photo" 
                className="w-full h-full object-cover animate-scale-in"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-6 justify-center">
        <Button 
          variant="outline" 
          size="lg"
          onClick={onRetake}
          className="text-2xl px-8 py-6 rounded-2xl glass hover:shadow-3d transition-all duration-500"
        >
          <RotateCcw className="h-6 w-6 mr-4" />
          Retake Photo
        </Button>
        
        <Button 
          variant="default" 
          size="lg"
          onClick={onConfirm}
          className="text-2xl px-12 py-6 rounded-2xl shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105"
        >
          <Check className="h-6 w-6 mr-4" />
          Looks Great!
        </Button>
      </div>
    </div>
  );
};

export default PhotoPreview;