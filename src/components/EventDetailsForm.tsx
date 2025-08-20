import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image } from "lucide-react";

interface EventDetailsFormProps {
  initialEventName: string;
  initialEventLocation: string;
  onEventNameChange: (eventName: string) => void;
  onEventLocationChange: (eventLocation: string) => void;
}

const EventDetailsForm = React.memo(({ 
  initialEventName, 
  initialEventLocation, 
  onEventNameChange, 
  onEventLocationChange 
}: EventDetailsFormProps) => {
  // Local state for smooth typing experience
  const [localEventName, setLocalEventName] = useState(initialEventName);
  const [localEventLocation, setLocalEventLocation] = useState(initialEventLocation);
  
  // Refs for debounced updates
  const eventNameTimeoutRef = useRef<NodeJS.Timeout>();
  const eventLocationTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (eventNameTimeoutRef.current) {
        clearTimeout(eventNameTimeoutRef.current);
      }
      if (eventLocationTimeoutRef.current) {
        clearTimeout(eventLocationTimeoutRef.current);
      }
    };
  }, []);

  // Debounced event name handler
  const handleEventNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalEventName(value);
    
    // Clear existing timeout
    if (eventNameTimeoutRef.current) {
      clearTimeout(eventNameTimeoutRef.current);
    }
    
    // Set new timeout for debounced update
    eventNameTimeoutRef.current = setTimeout(() => {
      onEventNameChange(value);
    }, 300);
  }, [onEventNameChange]);

  // Debounced event location handler
  const handleEventLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalEventLocation(value);
    
    // Clear existing timeout
    if (eventLocationTimeoutRef.current) {
      clearTimeout(eventLocationTimeoutRef.current);
    }
    
    // Set new timeout for debounced update
    eventLocationTimeoutRef.current = setTimeout(() => {
      onEventLocationChange(value);
    }, 300);
  }, [onEventLocationChange]);

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
            value={localEventName} 
            onChange={handleEventNameChange} 
            placeholder="Tech Conference 2025" 
            className="bg-input/50 border-border" 
          />
        </div>
        <div>
          <Label htmlFor="eventLocation">Location</Label>
          <Input 
            id="eventLocation" 
            value={localEventLocation} 
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