-- Migration: Add safety cushion fields
-- Description: Adds fields for tracking financial safety cushion and onboarding status

-- Add onboarding_completed to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add is_safety_cushion to assets table
ALTER TABLE assets
ADD COLUMN IF NOT EXISTS is_safety_cushion BOOLEAN DEFAULT FALSE;

-- Add safety cushion fields to user_settings table
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS safety_cushion_target DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS safety_cushion_achieved BOOLEAN DEFAULT FALSE;

-- Create index for faster queries on safety cushion assets
CREATE INDEX IF NOT EXISTS idx_assets_safety_cushion 
ON assets(user_id, is_safety_cushion) 
WHERE is_safety_cushion = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN profiles.onboarding_completed IS 'Indicates if user has completed the onboarding process including safety cushion setup';
COMMENT ON COLUMN assets.is_safety_cushion IS 'Indicates if this asset is part of the financial safety cushion portfolio';
COMMENT ON COLUMN user_settings.safety_cushion_target IS 'Target amount for financial safety cushion (6 months of living costs)';
COMMENT ON COLUMN user_settings.safety_cushion_achieved IS 'Indicates if the safety cushion target has been achieved';
