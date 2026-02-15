# Database Migration Instructions

## Prerequisites

You need access to your Supabase database to run this migration. You have two options:

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `migration_v1_savings.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```powershell
# Navigate to project root
cd "d:\2026 Projects\TrackiFi"

# Run migration
supabase db push
```

## Option 3: Using psql (If Installed)

If you have PostgreSQL client installed:

```powershell
# Set your database URL
$env:DATABASE_URL = "your-supabase-connection-string"

# Run migration
psql $env:DATABASE_URL -f migration_v1_savings.sql
```

## Verification

After running the migration, verify it worked:

```sql
-- Check if accounts table exists
SELECT * FROM accounts LIMIT 1;

-- Check if transactions table exists
SELECT * FROM transactions LIMIT 1;

-- Check if your user has accounts
SELECT * FROM accounts WHERE user_uuid = auth.uid();
```

You should see:

- Two accounts per user: "Allowance" and "Savings"
- Both tables with proper constraints
- RLS policies enabled

## Troubleshooting

### Error: "relation already exists"

This means the migration was already run. You can safely ignore this.

### Error: "permission denied"

Make sure you're using a connection string with sufficient permissions (service_role key).

### Error: "auth.uid() does not exist"

This is expected when running outside of authenticated context. The function will work when called from your application.

## Next Steps

After successful migration:

1. Restart your development servers
2. Test the application in the browser
3. Verify account balances display correctly
4. Test income, expense, and transfer operations
