-- Run this SQL in your Supabase SQL Editor to add the required columns for Document Analysis
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS brief text,
ADD COLUMN IF NOT EXISTS named_sections jsonb,
ADD COLUMN IF NOT EXISTS suggested_sections jsonb;
