import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Image, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EventDetailsFormProps {
  initialEventName: string;
  initialEventLocation: string;
  onEventNameChange: (eventName: string) => void;
  onEventLocationChange: (eventLocation: string) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
}

const EventDetailsForm = React.memo(({ 
  initialEventName, 
  initialEventLocation, 
  onEventNameChange, 
  onEventLocationChange,
  initialStartDate,
  initialEndDate,
  onStartDateChange,
  onEndDateChange
}: EventDetailsFormProps) => {
  // Local state for smooth typing experience
  const [localEventName, setLocalEventName] = useState(initialEventName);
  const [localEventLocation, setLocalEventLocation] = useState(initialEventLocation);
  const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate);
  
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
        
        {onStartDateChange && onEndDateChange && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-input/50 border-border",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      onStartDateChange(date);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-input/50 border-border",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      onEndDateChange(date);
                    }}
                    disabled={(date) => date < new Date() || (startDate && date < startDate)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

EventDetailsForm.displayName = "EventDetailsForm";

export default EventDetailsForm;