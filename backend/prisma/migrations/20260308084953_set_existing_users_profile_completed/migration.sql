-- Set profileCompleted = true for existing users so they are not asked to sign up again
UPDATE "User" SET "profileCompleted" = true WHERE "profileCompleted" = false;
