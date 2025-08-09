import { cn } from "@/lib/utils";

interface SetupProgressProps {
  total: number;
  current: number; // 0-based
  labels?: string[];
}

const SetupProgress = ({ total, current, labels = [] }: SetupProgressProps) => {
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
            <div
              className={cn(
                "w-8 h-8 rounded-full border-2 grid place-items-center transition-all",
                i === current ? "border-primary text-primary shadow-glow" : "border-border text-muted-foreground"
              )}
              aria-current={i === current ? "step" : undefined}
            >
              {i + 1}
            </div>
            {labels[i] && (
              <span className={cn("mt-2 text-xs", i === current ? "text-foreground" : "text-muted-foreground")}>{labels[i]}</span>
            )}
          </div>
        ))}
      </nav>
    </header>
  );
};

export default SetupProgress;
