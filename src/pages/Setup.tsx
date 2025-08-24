import Navigation from "@/components/Navigation";
import SetupWizardOptimized from "@/components/SetupWizardOptimized";

const Setup = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <SetupWizardOptimized />
      </div>
    </div>
  );
};

export default Setup;