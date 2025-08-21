// Validation utilities for the setup wizard

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface StepValidation {
  canProceed: boolean;
  errors: string[];
  warnings: string[];
}

// Validate event details step
export function validateEventDetails(eventName: string, location?: string): StepValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!eventName || eventName.trim().length === 0) {
    errors.push("Event name is required to continue");
  } else if (eventName.trim().length < 3) {
    errors.push("Event name must be at least 3 characters long");
  }

  if (!location || location.trim().length === 0) {
    warnings.push("Consider adding a location for your event");
  }

  return {
    canProceed: errors.length === 0,
    errors,
    warnings
  };
}

// Validate final step (event creation)
export function validateFinalStep(eventName: string, selectedAvatarStyles: string[]): StepValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!eventName || eventName.trim().length === 0) {
    errors.push("Event name is required");
  }

  if (selectedAvatarStyles.length === 0) {
    errors.push("Please select at least one avatar style");
  }

  return {
    canProceed: errors.length === 0,
    errors,
    warnings
  };
}

// Get step validation based on step number
export function getStepValidation(
  step: number, 
  eventName: string, 
  location: string, 
  selectedAvatarStyles: string[]
): StepValidation {
  switch (step) {
    case 1: // Event Details
      return validateEventDetails(eventName, location);
    case 8: // Final step (avatar selection) - Finish page
      return validateFinalStep(eventName, selectedAvatarStyles);
    default:
      // Other steps don't require validation
      return { canProceed: true, errors: [], warnings: [] };
  }
}
