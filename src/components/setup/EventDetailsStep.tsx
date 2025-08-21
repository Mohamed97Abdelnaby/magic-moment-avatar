import EventDetailsForm from "@/components/EventDetailsForm";

interface EventDetailsStepProps {
  eventName: string;
  eventLocation: string;
  onEventNameChange: (name: string) => void;
  onEventLocationChange: (location: string) => void;
}

const EventDetailsStep = ({
  eventName,
  eventLocation,
  onEventNameChange,
  onEventLocationChange
}: EventDetailsStepProps) => {
  return (
    <section className="relative transition-all duration-500 animate-fade-in">
      <EventDetailsForm
        initialEventName={eventName}
        initialEventLocation={eventLocation}
        onEventNameChange={onEventNameChange}
        onEventLocationChange={onEventLocationChange}
      />
    </section>
  );
};

export default EventDetailsStep;