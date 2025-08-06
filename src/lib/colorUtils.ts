// Color utility functions for dynamic theming

export interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

// Convert hex to HSL
export function hexToHsl(hex: string): HSLColor {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Convert HSL to hex
export function hslToHex(hsl: HSLColor): string {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Generate color variants (lighter and darker versions)
export function generateColorVariants(baseColor: HSLColor) {
  return {
    50: { ...baseColor, l: Math.min(95, baseColor.l + 40) },
    100: { ...baseColor, l: Math.min(90, baseColor.l + 30) },
    200: { ...baseColor, l: Math.min(85, baseColor.l + 20) },
    300: { ...baseColor, l: Math.min(80, baseColor.l + 10) },
    400: { ...baseColor, l: Math.min(75, baseColor.l + 5) },
    500: baseColor,
    600: { ...baseColor, l: Math.max(25, baseColor.l - 5) },
    700: { ...baseColor, l: Math.max(20, baseColor.l - 10) },
    800: { ...baseColor, l: Math.max(15, baseColor.l - 20) },
    900: { ...baseColor, l: Math.max(10, baseColor.l - 30) },
    950: { ...baseColor, l: Math.max(5, baseColor.l - 40) },
  };
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: HSLColor, color2: HSLColor): number {
  const getLuminance = (color: HSLColor) => {
    const rgb = hslToRgb(color);
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// Convert HSL to RGB
function hslToRgb(hsl: HSLColor): RGBColor {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// Check if color combination meets WCAG accessibility standards
export function checkAccessibility(foreground: HSLColor, background: HSLColor) {
  const contrast = getContrastRatio(foreground, background);
  return {
    contrast,
    aa: contrast >= 4.5,
    aaa: contrast >= 7,
    aaLarge: contrast >= 3,
    rating: contrast >= 7 ? 'AAA' : contrast >= 4.5 ? 'AA' : contrast >= 3 ? 'AA Large' : 'Fail'
  };
}

// Apply dynamic theme to CSS custom properties
export function applyDynamicTheme(primaryColor: HSLColor, secondaryColor?: HSLColor) {
  const root = document.documentElement;
  const primaryVariants = generateColorVariants(primaryColor);
  const secondaryVariants = secondaryColor ? generateColorVariants(secondaryColor) : primaryVariants;

  // Apply primary color variants
  root.style.setProperty('--primary', `${primaryColor.h} ${primaryColor.s}% ${primaryColor.l}%`);
  root.style.setProperty('--primary-foreground', `${primaryVariants[50].h} ${primaryVariants[50].s}% ${primaryVariants[50].l}%`);
  
  // Apply secondary/accent colors
  root.style.setProperty('--accent', `${secondaryColor?.h || primaryColor.h} ${secondaryColor?.s || primaryColor.s}% ${Math.min(95, (secondaryColor?.l || primaryColor.l) + 25)}%`);
  root.style.setProperty('--accent-foreground', `${primaryColor.h} ${primaryColor.s}% ${Math.max(15, primaryColor.l - 25)}%`);
  
  // Update muted colors based on primary
  root.style.setProperty('--muted', `${primaryColor.h} ${Math.max(5, primaryColor.s - 20)}% ${Math.min(95, primaryColor.l + 30)}%`);
  root.style.setProperty('--muted-foreground', `${primaryColor.h} ${Math.max(10, primaryColor.s - 10)}% ${Math.max(25, primaryColor.l - 20)}%`);
}

// Predefined color palette
export const colorPalette = [
  "#3B82F6", // Blue
  "#EF4444", // Red  
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#F43F5E", // Rose
  "#8B5A2B", // Brown
  "#6B7280", // Gray
  "#1F2937", // Dark Gray
  "#059669", // Emerald
  "#DC2626", // Red Dark
  "#7C3AED", // Violet
  "#EA580C", // Orange Dark
  "#0891B2", // Sky
];