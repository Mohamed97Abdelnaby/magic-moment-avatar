import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Eye } from "lucide-react";

interface StylesAndFinishStepProps {
  selectedStyles: string[];
  onToggleStyle: (styleId: string) => void;
  canFinish: boolean;
  loading: boolean;
  isEditing: boolean;
  onFinish: () => void;
}

const StylesAndFinishStep = ({
  selectedStyles,
  onToggleStyle,
  canFinish,
  loading,
  isEditing,
  onFinish
}: StylesAndFinishStepProps) => {
  const avatarStyles = [
    { id: "farmer", name: "Egyptian Farmer", description: "Traditional Rural Life", preview: "🌾" },
    { id: "pharaonic", name: "Ancient Pharaoh", description: "Royal Dynasty Style", preview: "👑" },
    { id: "basha", name: "El Basha Style", description: "Elite Noble Fashion", preview: "🎩" },
    { id: "beach", name: "Beach Vibes", description: "Summer Mediterranean", preview: "🏖️" },
    { id: "pixar", name: "Pixar Style", description: "3D Animated Magic", preview: "🎭" },
  ];

  return (
    <section className="relative transition-all duration-500 animate-fade-in">
      <Card className="bg-card/80 backdrop-blur border-border shadow-soft">
        <CardHeader>
          <CardTitle>Avatar Styles</CardTitle>
          <CardDescription>Select which avatar styles attendees can choose from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {avatarStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => onToggleStyle(style.id)}
                className={`p-4 rounded-lg border-2 text-left transition-smooth ${
                  selectedStyles.includes(style.id) 
                    ? 'border-accent shadow-medium bg-accent/10' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <div className="flex items-center space-y-3">
                  <div className="text-4xl mr-4">{style.preview}</div>
                  <div>
                    <h4 className="font-semibold mb-1">{style.name}</h4>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center space-y-4 mt-8">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              Live preview updates as you customize colors
            </div>
            <Button 
              variant="hero" 
              size="lg" 
              className="text-xl px-12 py-6" 
              disabled={!canFinish || loading}
              onClick={onFinish}
            >
              {loading ? "Saving..." : isEditing ? "Update Event" : "Create Event Kiosk"}
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
            {!canFinish && (
              <p className="text-sm text-muted-foreground">
                Please fill in event details and select at least one avatar style
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default StylesAndFinishStep;