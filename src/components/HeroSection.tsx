import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Camera, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" />
      </div>
      
      {/* Simple floating elements */}
      <div className="absolute top-32 left-10 animate-float">
        <div className="bg-primary p-4 rounded-full shadow-soft">
          <Camera className="h-8 w-8 text-primary-foreground" />
        </div>
      </div>
      <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '1s' }}>
        <div className="bg-accent p-4 rounded-full shadow-soft">
          <Sparkles className="h-8 w-8 text-accent-foreground" />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        <div className="animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            <span className="gradient-primary bg-clip-text text-transparent">
              Transform Events
            </span>
            <br />
            <span className="text-muted-foreground">into Magic</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Bring AI-powered avatar generation to your events. Attendees take photos, 
            choose their style, and walk away with stunning AI-generated avatars.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/setup">
              <Button variant="hero" size="lg" className="text-xl px-12 py-6">
                <Sparkles className="h-6 w-6 mr-3" />
                Start Your Event
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
            </Link>
            
            <Link to="/demo">
              <Button variant="outline" size="lg" className="text-xl px-12 py-6 border-2">
                <Camera className="h-6 w-6 mr-3" />
                View Demo
              </Button>
            </Link>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary p-6 rounded-2xl shadow-medium inline-block mb-4">
                <Camera className="h-12 w-12 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Instant Capture</h3>
              <p className="text-muted-foreground">Touch-friendly kiosk interface with countdown timer</p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent p-6 rounded-2xl shadow-medium inline-block mb-4">
                <Sparkles className="h-12 w-12 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">AI Generation</h3>
              <p className="text-muted-foreground">Choose from dozens of avatar styles and themes</p>
            </div>
            
            <div className="text-center">
              <div className="bg-secondary border-2 border-primary p-6 rounded-2xl shadow-soft inline-block mb-4">
                <Zap className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Instant Delivery</h3>
              <p className="text-muted-foreground">Print on-site or send directly to WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;