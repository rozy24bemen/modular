-- Migration: Add width and height columns to modules table
-- This allows modules to have independent width and height instead of just size

-- Add width and height columns (default to size value for existing modules)
ALTER TABLE public.modules
ADD COLUMN IF NOT EXISTS width FLOAT,
ADD COLUMN IF NOT EXISTS height FLOAT;

-- Update existing modules to set width and height based on size
UPDATE public.modules
SET width = size, height = size
WHERE width IS NULL OR height IS NULL;

-- Make width and height NOT NULL after setting defaults
ALTER TABLE public.modules
ALTER COLUMN width SET NOT NULL,
ALTER COLUMN height SET NOT NULL;

-- Add default values for new modules
ALTER TABLE public.modules
ALTER COLUMN width SET DEFAULT 60,
ALTER COLUMN height SET DEFAULT 60;

-- Optional: Add comment to explain the change
COMMENT ON COLUMN public.modules.width IS 'Width of the module (allows independent horizontal resizing)';
COMMENT ON COLUMN public.modules.height IS 'Height of the module (allows independent vertical resizing)';
