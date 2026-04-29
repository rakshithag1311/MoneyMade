# Google Authentication Setup Guide

This guide will help you complete the Google OAuth integration for MoneyMade.

## 🎯 What's Been Done

1. ✅ Created `oauth_providers` table to store Google authentication data
2. ✅ Updated Login page with "Continue with Google" button
3. ✅ Modified auth context to automatically store OAuth provider information
4. ✅ Added proper error handling and loading states

## 📋 Prerequisites

You mentioned you've already:
- ✅ Integrated Google Auth in Supabase
- ✅ Added Client ID and Secret in Supabase

## 🚀 Setup Steps

### Step 1: Run the Database Migration

You need to create the `oauth_providers` table in your Supabase database.

**Option A: Using Supabase SQL Editor (Recommended)**

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `supabase/add-oauth-providers.sql`
6. Paste it into the SQL Editor
7. Click **Run** or press `Ctrl+Enter`

**Option B: Using the Migration Script**

1. Add your Supabase service role key to `.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   
2. Run the migration:
   ```bash
   npm install dotenv
   npx tsx scripts/run-migration.ts
   ```

### Step 2: Verify Google OAuth Configuration in Supabase

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Find **Google** in the list
3. Ensure it's **enabled** and has:
   - ✅ Client ID
   - ✅ Client Secret
   - ✅ Authorized redirect URIs should include:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:5173/` (for local development)

### Step 3: Update Google Cloud Console (if needed)

Make sure your Google Cloud Console OAuth 2.0 Client has the correct redirect URIs:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, ensure you have:
   - `https://yxbyltyxuqlznyfmlpse.supabase.co/auth/v1/callback`
   - `http://localhost:5173/` (for local testing)

### Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page
3. Click **"Continue with Google"**
4. You should be redirected to Google's sign-in page
5. After successful authentication, you'll be redirected back to your app

### Step 5: Verify Data Storage

After signing in with Google, check your Supabase database:

1. Go to **Table Editor** in Supabase
2. Check the `profiles` table - should have your user profile
3. Check the `oauth_providers` table - should have your Google OAuth data:
   - `user_id`: Links to your profile
   - `provider`: "google"
   - `provider_user_id`: Your Google user ID
   - `email`: Your Google email
   - `avatar_url`: Your Google profile picture URL
   - `full_name`: Your name from Google
   - `raw_user_meta_data`: Complete metadata from Google

## 🔍 What Gets Stored

When a user signs in with Google, the following information is automatically stored:

### In `profiles` table:
- User ID (from Supabase Auth)
- Email
- Username (derived from email)
- Full name (from Google)
- Balance (default: 0)

### In `oauth_providers` table:
- User ID (links to profile)
- Provider name ("google")
- Provider user ID (Google's unique ID for the user)
- Email
- Avatar URL (profile picture)
- Full name
- Complete raw metadata from Google (stored as JSON)

## 🛠️ Troubleshooting

### "Invalid redirect URI" error
- Verify redirect URIs match exactly in both Google Cloud Console and Supabase
- Make sure there are no trailing slashes or typos

### "OAuth provider not configured" error
- Check that Google provider is enabled in Supabase
- Verify Client ID and Secret are correctly entered

### User profile not created
- Check browser console for errors
- Verify RLS policies are correctly set up
- Check Supabase logs in the dashboard

### OAuth data not stored
- Verify the `oauth_providers` table exists
- Check that the migration ran successfully
- Look for errors in browser console

## 🔐 Security Notes

- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ Users can only access their own data
- ✅ OAuth tokens are handled securely by Supabase
- ✅ Service role key should never be exposed to the client

## 📊 Database Schema

```sql
oauth_providers
├── id (uuid, primary key)
├── user_id (uuid, foreign key → profiles.id)
├── provider (text) - e.g., "google"
├── provider_user_id (text) - Google's user ID
├── email (text)
├── avatar_url (text)
├── full_name (text)
├── raw_user_meta_data (jsonb)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

## 🎨 UI Features

The login page now includes:
- ✅ Traditional email/password authentication
- ✅ Google OAuth button with Google logo
- ✅ Loading states for both auth methods
- ✅ Proper error handling with toast notifications
- ✅ Responsive design
- ✅ Disabled state management

## 📝 Next Steps

After successful setup, you can:
1. Add more OAuth providers (GitHub, Facebook, etc.)
2. Display user's Google profile picture in the app
3. Use OAuth data for personalization
4. Add social features using provider information

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check Supabase logs in the dashboard
3. Verify all environment variables are set correctly
4. Ensure the migration ran successfully
