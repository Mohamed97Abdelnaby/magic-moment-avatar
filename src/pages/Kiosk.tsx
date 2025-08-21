import KioskInterface from "@/components/KioskInterface";
import { useLocation } from "react-router-dom";

const Kiosk = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isDemo = searchParams.get('demo') === 'true';
  const eventId = searchParams.get('event');

  return <KioskInterface isDemo={isDemo} eventId={eventId || undefined} />;
};

export default Kiosk;