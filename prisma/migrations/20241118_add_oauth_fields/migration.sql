-- Add OAuth fields to Platform table
ALTER TABLE platforms ADD COLUMN encryptedAccessToken TEXT;
ALTER TABLE platforms ADD COLUMN encryptedRefreshToken TEXT;
ALTER TABLE platforms ADD COLUMN tokenExpiresAt DATETIME;
ALTER TABLE platforms ADD COLUMN externalUserId TEXT;
ALTER TABLE platforms ADD COLUMN externalUsername TEXT;

-- Rename encryptedConfig to allow null (already nullable in schema)
-- No change needed as schema already has it as optional
