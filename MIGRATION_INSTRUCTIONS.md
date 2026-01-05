# Database Migration Instructions

## Required Migration

This project requires a database migration to add the Zapier integration fields. The migration file is located at:

`prisma/migrations/20260105_zapier_fields/migration.sql`

## Migration Steps

1. **Apply the migration to your database:**
   ```bash
   npx prisma migrate deploy
   ```

2. **After migration, regenerate the Prisma client:**
   ```bash
   npx prisma generate
   ```

## What This Migration Does

The migration adds the following fields to the User table:

- `plan` - Stores the user's subscription plan (MONTHLY/ANNUAL)
- `status` - Tracks user status (REGISTERED/INVITED/ACTIVE) 
- `inviteToken` - Stores one-time use tokens for password setup
- `inviteExpiresAt` - Sets expiration time for invite tokens

## Field Explanations

- **plan**: Stores whether the user has a MONTHLY or ANNUAL subscription
- **status**: 
  - REGISTERED: User created via Zapier, needs to set password
  - INVITED: User has been sent an invite email
  - ACTIVE: User has set password and is fully active
- **inviteToken**: Cryptographically secure token for one-time password setup
- **inviteExpiresAt**: Timestamp when the invite token expires (typically 24 hours)

## Security Notes

- The `inviteToken` field is indexed for fast lookups during password setup
- Tokens are cleared after use to prevent reuse
- Expired tokens are rejected during password setup