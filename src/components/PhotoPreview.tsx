import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, Check } from "lucide-react";

interface PhotoPreviewProps {
  capturedPhoto: string;
  onRetake: () => void;
  onConfirm: () => void;
}

const PhotoPreview = ({ capturedPhoto, onRetake, onConfirm }: PhotoPreviewProps) => {
  return (
    <div className="text-center portrait:space-y-4 landscape:space-y-8">
      <div className="portrait:space-y-2 landscape:space-y-4">
        <h1 className="portrait:text-4xl landscape:text-6xl font-bold portrait:mb-2 landscape:mb-4 animate-fade-in-up">
          How do you look? 📸
        </h1>
        <p className="portrait:text-xl landscape:text-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Take a look at your photo
        </p>
      </div>

      <div className="portrait:max-w-lg landscape:max-w-2xl mx-auto">
        <Card className="portrait:p-3 landscape:p-6 shadow-glow glass border-4 border-primary/20 relative overflow-hidden">
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

      <div className="flex portrait:gap-3 landscape:gap-6 justify-center">
        <Button 
          variant="outline" 
          size="lg"
          onClick={onRetake}
          className="portrait:text-lg portrait:px-6 portrait:py-4 landscape:text-2xl landscape:px-8 landscape:py-6 rounded-2xl glass hover:shadow-3d transition-all duration-500"
        >
          <RotateCcw className="portrait:h-5 portrait:w-5 portrait:mr-2 landscape:h-6 landscape:w-6 landscape:mr-4" />
          Retake Photo
        </Button>
        
        <Button 
          variant="default" 
          size="lg"
          onClick={onConfirm}
          className="portrait:text-lg portrait:px-8 portrait:py-4 landscape:text-2xl landscape:px-12 landscape:py-6 rounded-2xl shadow-glow hover:shadow-neon transition-all duration-500 transform hover:scale-105"
        >
          <Check className="portrait:h-5 portrait:w-5 portrait:mr-2 landscape:h-6 landscape:w-6 landscape:mr-4" />
          Looks Great!
        </Button>
      </div>
    </div>
  );
};

export default PhotoPreview;