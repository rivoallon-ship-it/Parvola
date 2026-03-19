-- Add AI prompts customization column to companies
ALTER TABLE companies ADD COLUMN ai_prompts JSONB DEFAULT '{}';
