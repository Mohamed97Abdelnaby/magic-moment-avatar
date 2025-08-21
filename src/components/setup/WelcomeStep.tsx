import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <section className="relative transition-all duration-500 animate-fade-in">
      <div className="text-center py-10">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-secondary/60 border border-border shadow-soft animate-[pulse-soft_3s_ease-in-out_infinite]">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm">A calm, animated setup experience</span>
        </div>
        <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent gradient-primary">Setup Your Event</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Guided steps with smooth animations inspired by Apple and Frame.io.
        </p>
      </div>
      <div className="flex justify-center">
        <Button size="lg" variant="hero" onClick={onNext} className="px-10">
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
};

export default WelcomeStep;