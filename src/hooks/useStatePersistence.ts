import { useState, useEffect, useCallback } from 'react';

export function useStatePersistence<T>(
  key: string,
  defaultValue: T,
  options: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
    storage?: Storage;
  } = {}
) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    storage = sessionStorage
  } = options;

  // Initialize state from storage or default
  const [state, setState] = useState<T>(() => {
    try {
      const stored = storage.getItem(key);
      if (stored !== null) {
        return deserialize(stored);
      }
    } catch (error) {
      console.warn(`Failed to load ${key} from storage:`, error);
    }
    return defaultValue;
  });

  // Save to storage whenever state changes
  useEffect(() => {
    try {
      storage.setItem(key, serialize(state));
    } catch (error) {
      console.warn(`Failed to save ${key} to storage:`, error);
    }
  }, [key, state, serialize, storage]);

  // Clear storage for this key
  const clearStorage = useCallback(() => {
    try {
      storage.removeItem(key);
      setState(defaultValue);
    } catch (error) {
      console.warn(`Failed to clear ${key} from storage:`, error);
    }
  }, [key, defaultValue, storage]);

  return [state, setState, clearStorage] as const;
}