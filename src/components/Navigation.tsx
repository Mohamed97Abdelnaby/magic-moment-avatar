import { Button } from "@/components/ui/button";
import { Camera, Sparkles, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg shadow-soft">
              <Camera className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              AvatarMoment
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              How it Works
            </Button>
            <Button variant="ghost" size="sm">
              Pricing
            </Button>
            <Link to="/kiosk">
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Kiosk Demo
              </Button>
            </Link>
            <Button variant="hero" size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;