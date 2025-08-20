import KioskInterface from "@/components/KioskInterface";
import { useLocation } from "react-router-dom";

const Kiosk = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isDemo = searchParams.get('demo') === 'true';

  return <KioskInterface isDemo={isDemo} />;
};

export default Kiosk;