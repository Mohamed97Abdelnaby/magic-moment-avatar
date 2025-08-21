import { cn } from "@/lib/utils";

interface SetupProgressProps {
  total: number;
  current: number; // 0-based
  labels?: string[];
  onStepClick?: (stepIndex: number) => void;
}

const SetupProgress = ({ total, current, labels = [], onStepClick }: SetupProgressProps) => {
  const percent = ((current + 1) / total) * 100;
  return (
    <header className="w-full mb-6">
      <div className="h-2 w-full rounded-full bg-secondary/50 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${percent}%` }}
          aria-hidden
        />
      </div>
      <nav className="mt-4 grid" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }} aria-label="Setup steps">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <button
              onClick={() => onStepClick?.(i)}
              disabled={!onStepClick}
              className={cn(
                "w-8 h-8 rounded-full border-2 grid place-items-center transition-all",
                "hover:scale-110 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                onStepClick ? "cursor-pointer" : "cursor-default",
                i === current ? "border-primary text-primary shadow-glow bg-primary/10" : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary/70"
              )}
              aria-current={i === current ? "step" : undefined}
              aria-label={`Go to step ${i + 1}${labels[i] ? `: ${labels[i]}` : ''}`}
            >
              {i + 1}
            </button>
            {labels[i] && (
              <span className={cn("mt-2 text-xs text-center", i === current ? "text-foreground" : "text-muted-foreground")}>{labels[i]}</span>
            )}
          </div>
        ))}
      </nav>
    </header>
  );
};

export default SetupProgress;
