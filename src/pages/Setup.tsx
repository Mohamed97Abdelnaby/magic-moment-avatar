import Navigation from "@/components/Navigation";
import EventSetup from "@/components/EventSetup";

const Setup = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <EventSetup />
      </div>
    </div>
  );
};

export default Setup;