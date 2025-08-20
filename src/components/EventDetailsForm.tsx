import React, { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image } from "lucide-react";

interface EventDetailsFormProps {
  initialEventName?: string;
  initialEventLocation?: string;
  onEventDetailsChange: (eventName: string, eventLocation: string) => void;
}

const EventDetailsForm = React.memo(({ 
  initialEventName = "", 
  initialEventLocation = "", 
  onEventDetailsChange 
}: EventDetailsFormProps) => {
  // Local state for immediate UI updates
  const [eventName, setEventName] = useState(initialEventName);
  const [eventLocation, setEventLocation] = useState(initialEventLocation);
  
  // Debounced update to parent
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const debouncedUpdate = useCallback((name: string, location: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onEventDetailsChange(name, location);
    }, 300);
  }, [onEventDetailsChange]);

  // Handle input changes
  const handleEventNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEventName(newValue);
    debouncedUpdate(newValue, eventLocation);
  }, [eventLocation, debouncedUpdate]);

  const handleEventLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEventLocation(newValue);
    debouncedUpdate(eventName, newValue);
  }, [eventName, debouncedUpdate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Sync with parent if initial values change
  useEffect(() => {
    setEventName(initialEventName);
  }, [initialEventName]);
  
  useEffect(() => {
    setEventLocation(initialEventLocation);
  }, [initialEventLocation]);

  return (
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
            value={eventName} 
            onChange={handleEventNameChange} 
            placeholder="Tech Conference 2025" 
            className="bg-input/50 border-border" 
          />
        </div>
        <div>
          <Label htmlFor="eventLocation">Location</Label>
          <Input 
            id="eventLocation" 
            value={eventLocation} 
            onChange={handleEventLocationChange} 
            placeholder="Convention Center Hall A" 
            className="bg-input/50 border-border" 
          />
        </div>
      </CardContent>
    </Card>
  );
});

EventDetailsForm.displayName = "EventDetailsForm";

export default EventDetailsForm;