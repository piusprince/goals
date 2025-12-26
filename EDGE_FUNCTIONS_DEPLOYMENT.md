# Supabase Edge Functions - Deployment Guide

## ✅ Deployed Functions

Both Edge Functions are successfully deployed and ACTIVE:

1. **send-daily-reminders** - Sends push notifications at user-configured times
2. **send-streak-warnings** - Reminds users to check in before losing streaks

Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/functions

## Environment Variables

The following secrets are configured:
- ✅ `VAPID_PUBLIC_KEY`
- ✅ `VAPID_PRIVATE_KEY`
- ✅ `VAPID_SUBJECT`
- ✅ `SUPABASE_URL` (auto-provided)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (auto-provided)

## Setting Up Cron Jobs

To schedule the functions, you need to set up cron jobs using `pg_cron` extension in Supabase.

### Step 1: Enable pg_cron Extension

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_REF/database/extensions
2. Search for `pg_cron`
3. Enable it if not already enabled

### Step 2: Get Your Service Role Key

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_REF/settings/api
2. Copy your `service_role` key (secret key)

### Step 3: Create Cron Jobs

Go to https://supabase.com/dashboard/project/YOUR_PROJECT_REF/database/functions and run these SQL commands:

#### Daily Reminders (Every 15 minutes)

```sql
SELECT cron.schedule(
  'send-daily-reminders',
  '*/15 * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-daily-reminders',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY_HERE'
      ),
      body:='{}'::jsonb
    ) AS request_id;
  $$
);
```

#### Streak Warnings (Daily at 10 PM)

```sql
SELECT cron.schedule(
  'send-streak-warnings',
  '0 22 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-streak-warnings',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY_HERE'
      ),
      body:='{}'::jsonb
    ) AS request_id;
  $$
);
```

**Note:** Replace `YOUR_SERVICE_ROLE_KEY_HERE` with your actual service role key.

## Verifying Cron Jobs

Check if cron jobs are scheduled:

```sql
SELECT * FROM cron.job;
```

## Viewing Function Logs

View logs for each function:

```bash
npx supabase functions logs send-daily-reminders
npx supabase functions logs send-streak-warnings
```

Or view in the dashboard:
- Daily Reminders: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/functions/send-daily-reminders/logs
- Streak Warnings: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/functions/send-streak-warnings/logs

## Manual Testing

You can manually invoke the functions using curl:

```powershell
# Test daily reminders
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-daily-reminders" `
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test streak warnings
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-streak-warnings" `
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Redeployment

To redeploy after making changes:

```powershell
# Deploy specific function
npx supabase functions deploy send-daily-reminders
npx supabase functions deploy send-streak-warnings

# Deploy all functions
npx supabase functions deploy
```

## Troubleshooting

### Check Function Status
```bash
npx supabase functions list
```

### View Function Details
```bash
npx supabase functions download send-daily-reminders
```

### Check Secrets
```bash
npx supabase secrets list
```

### Update Secrets
```bash
npx supabase secrets set VAPID_PUBLIC_KEY="new-value"
```

## Cron Schedule Reference

- `*/15 * * * *` = Every 15 minutes
- `0 22 * * *` = Daily at 10:00 PM
- `0 */6 * * *` = Every 6 hours
- `0 0 * * *` = Daily at midnight
- `0 9 * * 1` = Every Monday at 9 AM

## Function Behavior

### send-daily-reminders
- Runs every 15 minutes
- Checks users with `daily_reminders` enabled
- Sends notifications to users whose reminder_time falls in the current 15-min window
- Uses web-push for push notifications

### send-streak-warnings
- Runs daily at 10 PM
- Finds users with active streaks who haven't checked in today
- Sends reminder notifications to avoid breaking streaks
- Only sends to users with `streak_warnings` enabled

## Next Steps

1. ✅ Functions deployed
2. ⏳ Set up cron jobs (follow Step 3 above)
3. ⏳ Test functions manually
4. ⏳ Monitor logs for errors
5. ⏳ Verify notifications are being sent
