// Utilities for persisting and reading kiosk screen appearance settings
import { HSLColor, hslToHex } from "@/lib/colorUtils";

export type ScreenKey = 'styles' | 'camera' | 'photo-preview' | 'countdown' | 'loading' | 'result';

export interface ScreenAppearance {
  title?: string;
  textColorHex?: string; // e.g. #FFFFFF
  textColorHsl?: string; // e.g. "0 0% 100%"
  backgroundImageDataUrl?: string | null;
  backgroundColor?: string; // e.g. #000000
  overlayOpacity?: number; // 0-0.8
}

export type ScreenSettings = Record<ScreenKey, ScreenAppearance>;

const DEFAULT_TEXT_COLOR: HSLColor = { h: 0, s: 0, l: 100 };

export function getDefaultAppearance(): ScreenAppearance {
  return {
    title: undefined,
    textColorHex: undefined,
    textColorHsl: undefined,
    backgroundImageDataUrl: null,
    backgroundColor: undefined,
    overlayOpacity: 0.45,
  };
}

export function getDefaultScreenSettings(): ScreenSettings {
  return {
    styles: { ...getDefaultAppearance(), title: 'Choose your Avatar' },
    camera: { ...getDefaultAppearance(), title: 'Get Ready!' },
    'photo-preview': { ...getDefaultAppearance(), title: 'Perfect Shot!' },
    countdown: { ...getDefaultAppearance(), title: 'Take a moment...' },
    loading: { ...getDefaultAppearance(), title: 'Generating...' },
    result: { ...getDefaultAppearance(), title: 'Your Avatar is Ready!' },
  };
}

const SCREENS_KEY = 'kiosk:screenSettings';
const LEGACY_STYLES_KEY = 'kiosk:styleSelection';

export function loadScreenSettings(): ScreenSettings {
  try {
    const raw = localStorage.getItem(SCREENS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ScreenSettings>;
      return mergeWithDefaults(parsed);
    }

    // Migration from legacy single-screen settings
    const legacyRaw = localStorage.getItem(LEGACY_STYLES_KEY);
    const defaults = getDefaultScreenSettings();
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as Partial<ScreenAppearance>;
      defaults.styles = { ...defaults.styles, ...legacy };
      // Save migrated state
      localStorage.setItem(SCREENS_KEY, JSON.stringify(defaults));
    }
    return defaults;
  } catch {
    return getDefaultScreenSettings();
  }
}

export function saveScreenSettings(next: ScreenSettings) {
  localStorage.setItem(SCREENS_KEY, JSON.stringify(next));
}

export function saveScreenAppearance(screen: ScreenKey, partial: Partial<ScreenAppearance>) {
  const current = loadScreenSettings();
  const merged: ScreenSettings = {
    ...current,
    [screen]: { ...current[screen], ...partial },
  };
  saveScreenSettings(merged);
}

function mergeWithDefaults(partial: Partial<ScreenSettings>): ScreenSettings {
  const defaults = getDefaultScreenSettings();
  const result: ScreenSettings = { ...defaults };
  (Object.keys(defaults) as ScreenKey[]).forEach((key) => {
    result[key] = { ...defaults[key], ...(partial?.[key] || {}) };
  });
  return result;
}
