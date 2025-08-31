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

// Validate event name uniqueness
export async function validateEventNameUnique(eventName: string, userId: string, eventId?: string): Promise<ValidationResult> {
  const { supabase } = await import("@/integrations/supabase/client");
  
  let query = supabase
    .from('events')
    .select('id')
    .eq('user_id', userId)
    .eq('name', eventName.trim());
  
  // If editing, exclude current event from check
  if (eventId) {
    query = query.neq('id', eventId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return { isValid: false, errors: ['Failed to validate event name'] };
  }
  
  if (data && data.length > 0) {
    return { isValid: false, errors: ['Event name already exists. Please choose a different name.'] };
  }
  
  return { isValid: true, errors: [] };
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
    case 9: // Final step (avatar selection) - Finish page
      return validateFinalStep(eventName, selectedAvatarStyles);
    default:
      // Other steps don't require validation
      return { canProceed: true, errors: [], warnings: [] };
  }
}
