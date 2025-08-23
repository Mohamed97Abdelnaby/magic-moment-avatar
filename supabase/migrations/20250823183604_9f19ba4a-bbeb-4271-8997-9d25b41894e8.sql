-- Add date fields to events table
ALTER TABLE public.events 
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE;