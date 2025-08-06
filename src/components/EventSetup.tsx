import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Image, ArrowRight } from "lucide-react";

const EventSetup = () => {
  const [selectedTheme, setSelectedTheme] = useState("blue");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const themes = [
    { id: "blue", name: "Classic Blue", colors: "gradient-primary" },
    { id: "light", name: "Light & Clean", colors: "gradient-subtle" },
    { id: "dark", name: "Dark Blue", colors: "bg-primary" },
    { id: "minimal", name: "Minimal", colors: "bg-secondary border-2 border-primary" },
  ];

  const avatarStyles = [
    { id: "pixar", name: "Pixar Style", description: "3D animated character style" },
    { id: "cyberpunk", name: "Cyberpunk", description: "Futuristic neon aesthetic" },
    { id: "cartoon", name: "90s Cartoon", description: "Classic hand-drawn animation" },
    { id: "sketch", name: "Sketch Art", description: "Pencil drawing style" },
    { id: "oil", name: "Oil Painting", description: "Classical painted portrait" },
    { id: "anime", name: "Anime", description: "Japanese animation style" },
  ];

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">
            <span className="gradient-primary bg-clip-text text-transparent">
              Setup Your Event
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Customize the theme and avatar styles for your attendees
          </p>
        </div>

        <div className="space-y-8">
          {/* Event Details */}
          <Card className="bg-card/80 backdrop-blur border-border shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-6 w-6" />
                Event Details
              </CardTitle>
              <CardDescription>Basic information about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="eventName">Event Name</Label>
                <Input 
                  id="eventName"
                  placeholder="Tech Conference 2024"
                  className="bg-input/50 border-border"
                />
              </div>
              <div>
                <Label htmlFor="eventLocation">Location</Label>
                <Input 
                  id="eventLocation"
                  placeholder="Convention Center Hall A"
                  className="bg-input/50 border-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Selection */}
          <Card className="bg-card/80 backdrop-blur border-border shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-6 w-6" />
                Choose Theme
              </CardTitle>
              <CardDescription>This will style your event's kiosk interface</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`p-4 rounded-lg border-2 transition-smooth ${
                      selectedTheme === theme.id 
                        ? 'border-primary shadow-medium' 
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div className={`h-20 w-full rounded ${theme.colors} mb-2`} />
                    <p className="font-semibold">{theme.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Avatar Styles */}
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
                    onClick={() => toggleStyle(style.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-smooth ${
                      selectedStyles.includes(style.id)
                        ? 'border-accent shadow-medium bg-accent/10'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <h4 className="font-semibold mb-1">{style.name}</h4>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button variant="hero" size="lg" className="text-xl px-12 py-6">
              Create Event Kiosk
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventSetup;