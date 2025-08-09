import Navigation from "@/components/Navigation";
import SetupWizard from "@/components/SetupWizard";

const Setup = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <SetupWizard />
      </div>
    </div>
  );
};

export default Setup;