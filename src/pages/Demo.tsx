import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Camera, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Demo = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-8">
            <span className="gradient-primary bg-clip-text text-transparent">
              Experience AvatarMoment
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            See how your attendees will interact with our AI-powered avatar generation kiosk.
            Try it yourself to understand the complete experience.
          </p>
          
          <div className="bg-card p-8 rounded-2xl border border-border shadow-soft mb-12">
            <h2 className="text-2xl font-bold mb-6">Demo Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <Camera className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Photo Capture</h3>
                  <p className="text-muted-foreground text-sm">Touch-friendly interface with countdown timer</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Camera className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Style Selection</h3>
                  <p className="text-muted-foreground text-sm">Choose from various avatar styles</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Camera className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Color Customization</h3>
                  <p className="text-muted-foreground text-sm">See how your brand colors integrate</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Camera className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Instant Results</h3>
                  <p className="text-muted-foreground text-sm">Experience the complete workflow</p>
                </div>
              </div>
            </div>
          </div>
          
          <Link to="/kiosk">
            <Button variant="hero" size="lg" className="text-xl px-12 py-6">
              <Camera className="h-6 w-6 mr-3" />
              Try Interactive Demo
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
          </Link>
          
          <div className="mt-8">
            <Link to="/setup">
              <Button variant="outline" size="lg" className="text-xl px-8 py-4">
                Set Up Your Event
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;