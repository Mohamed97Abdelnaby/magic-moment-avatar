import React, { ReactNode } from "react";

/**
 * HSL strings like "222 47% 11%" (no `hsl()` wrapper).
 * These map to the same CSS vars your Tailwind/shadcn tokens use.
 */
type ThemeTokens = Partial<{
  background: string;
  foreground: string;

  primary: string;
  primaryForeground: string;

  secondary: string;
  secondaryForeground: string;

  accent: string;
  accentForeground: string;

  muted: string;
  mutedForeground: string;

  border: string;
  input: string;
  ring: string;
}>;

const CALM_DARK_BLUE: ThemeTokens = {
  background: "222 47% 11%",      // base bg
  foreground: "210 40% 98%",      // text
  primary: "221 83% 53%",         // brand blue
  primaryForeground: "210 40% 98%",
  secondary: "215 20% 65%",
  secondaryForeground: "222 47% 11%",
  accent: "221 83% 53%",
  accentForeground: "210 40% 98%",
  muted: "217 33% 17%",
  mutedForeground: "215 20% 65%",
  border: "217 33% 20%",
  input: "217 33% 20%",
  ring: "221 83% 53%",
};

function toVarStyle(tokens: ThemeTokens): React.CSSProperties {
  // Map tokens to CSS variables (must match your Tailwind/shadcn naming)
  const v: Record<string, string> = {};
  if (tokens.background) v["--background"] = tokens.background;
  if (tokens.foreground) v["--foreground"] = tokens.foreground;

  if (tokens.primary) v["--primary"] = tokens.primary;
  if (tokens.primaryForeground) v["--primary-foreground"] = tokens.primaryForeground;

  if (tokens.secondary) v["--secondary"] = tokens.secondary;
  if (tokens.secondaryForeground) v["--secondary-foreground"] = tokens.secondaryForeground;

  if (tokens.accent) v["--accent"] = tokens.accent;
  if (tokens.accentForeground) v["--accent-foreground"] = tokens.accentForeground;

  if (tokens.muted) v["--muted"] = tokens.muted;
  if (tokens.mutedForeground) v["--muted-foreground"] = tokens.mutedForeground;

  if (tokens.border) v["--border"] = tokens.border;
  if (tokens.input) v["--input"] = tokens.input;
  if (tokens.ring) v["--ring"] = tokens.ring;

  return v as React.CSSProperties;
}

export default function KioskThemeWrapper({
  children,
  forceCalmDarkBlue = false,
  theme,
  className,
}: {
  children: ReactNode;
  /** If true, always use Calm Dark Blue (for Kiosk Demo) */
  forceCalmDarkBlue?: boolean;
  /** Optional per-event overrides (HSL strings) */
  theme?: ThemeTokens;
  className?: string;
}) {
  const base = forceCalmDarkBlue ? CALM_DARK_BLUE : {};
  const style = { ...toVarStyle(base), ...toVarStyle(theme ?? {}) };

  return (
    <div className={`kiosk-scope ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}

/**
 * Wrap a single kiosk screen to force one unified text color.
 * This overrides any text-* classes inside the screen for headings/paragraphs/etc.
 */
export function KioskScreenTextScope({
  color, // full CSS color, e.g. "hsl(210 40% 98%)" or "#fff"
  children,
  className,
}: {
  color?: string;
  children: ReactNode;
  className?: string;
}) {
  const style: React.CSSProperties | undefined = color
    ? ({ ["--kiosk-screen-text" as any]: color } as React.CSSProperties)
    : undefined;

  return (
    <section
      className={`kiosk-screen ${className ?? ""}`}
      data-text-override={color ? "1" : undefined}
      style={style}
    >
      {children}
    </section>
  );
}