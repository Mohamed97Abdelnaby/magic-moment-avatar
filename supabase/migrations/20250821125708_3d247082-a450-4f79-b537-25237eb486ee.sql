-- Add background_color column to event_screen_settings table
ALTER TABLE public.event_screen_settings 
ADD COLUMN background_color text DEFAULT '#1a1a2e';