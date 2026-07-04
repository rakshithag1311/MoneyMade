# ✅ Google Authentication Setup Checklist

## Pre-Setup Verification

- [x] MCP configuration verified (`npm run test:mcp`)
- [x] Environment variables configured
- [x] Supabase project connected
- [x] Google OAuth credentials added to Supabase

## Database Setup

- [ ] **Run Migration in Supabase SQL Editor**
  - [ ] Go to https://app.supabase.com
  - [ ] Select project: `yxbyltyxuqlznyfmlpse`
  - [ ] Open SQL Editor
  - [ ] Create new query
  - [ ] Copy contents of `supabase/add-oauth-providers.sql`
  - [ ] Paste and run
  - [ ] Verify "Success. No rows returned" message

- [ ] **Verify Table Created**
  - [ ] Go to Table Editor in Supabase
  - [ ] Find `oauth_providers` table
  - [ ] Check columns: id, user_id, provider, provider_user_id, email, avatar_url, full_name, raw_user_meta_data, created_at, updated_at

## Supabase Configuration

- [ ] **Verify Google OAuth Provider**
  - [ ] Go to Authentication → Providers
  - [ ] Find Google in the list
  - [ ] Verify it's **Enabled** (toggle should be on)
  - [ ] Verify Client ID is filled in
  - [ ] Verify Client Secret is filled in

- [ ] **Check Redirect URIs**
  - [ ] Production: `https://yxbyltyxuqlznyfmlpse.supabase.co/auth/v1/callback`
  - [ ] Development: `http://localhost:5173/`

## Google Cloud Console

- [ ] **Verify OAuth 2.0 Client**
  - [ ] Go to https://console.cloud.google.com/
  - [ ] Navigate to APIs & Services → Credentials
  - [ ] Find your OAuth 2.0 Client ID
  - [ ] Check Authorized redirect URIs include:
    - [ ] `https://yxbyltyxuqlznyfmlpse.supabase.co/auth/v1/callback`
    - [ ] `http://localhost:5173/` (for local testing)

## Testing

- [ ] **Start Development Server**
  ```bash
  npm run dev
  ```

- [ ] **Test Google Sign-In**
  - [ ] Open http://localhost:5173/login
  - [ ] See "Continue with Google" button
  - [ ] Click the button
  - [ ] Redirected to Google sign-in page
  - [ ] Sign in with Google account
  - [ ] Redirected back to app
  - [ ] Successfully logged in
  - [ ] Redirected to dashboard

- [ ] **Verify Data Storage**
  - [ ] Go to Supabase Table Editor
  - [ ] Open `profiles` table
  - [ ] Find your user record
  - [ ] Verify: id, email, username, full_name, balance
  - [ ] Open `oauth_providers` table
  - [ ] Find your OAuth record
  - [ ] Verify: user_id, provider="google", email, avatar_url, full_name

## Verification

- [ ] **Check Browser Console**
  - [ ] No errors in console (F12)
  - [ ] Auth state change logged
  - [ ] Profile creation logged

- [ ] **Check Supabase Logs**
  - [ ] Go to Logs in Supabase dashboard
  - [ ] No errors during sign-in
  - [ ] Profile insert/update successful
  - [ ] OAuth provider insert/update successful

- [ ] **Test Sign Out**
  - [ ] Click sign out button
  - [ ] Redirected to login page
  - [ ] Session cleared

- [ ] **Test Sign In Again**
  - [ ] Click "Continue with Google"
  - [ ] Should sign in without re-entering credentials (if still logged into Google)
  - [ ] Successfully logged in

## Optional Enhancements

- [ ] **Display Profile Picture**
  - [ ] Fetch avatar_url from oauth_providers
  - [ ] Display in navbar or profile page

- [ ] **Add More OAuth Providers**
  - [ ] GitHub
  - [ ] Facebook
  - [ ] Twitter

- [ ] **Profile Editing**
  - [ ] Allow users to update profile info
  - [ ] Show OAuth provider info

## Troubleshooting

If something doesn't work, check:

- [ ] Run `npm run test:mcp` - all checks should pass
- [ ] Check browser console for errors
- [ ] Check Supabase logs for errors
- [ ] Verify redirect URIs match exactly
- [ ] Verify Google OAuth is enabled
- [ ] Verify migration ran successfully
- [ ] Check that RLS policies are correct

## Documentation Reference

- **QUICK_START.md** - Fast setup guide
- **GOOGLE_AUTH_SETUP.md** - Detailed instructions
- **GOOGLE_AUTH_FLOW.md** - Visual flow diagrams
- **IMPLEMENTATION_SUMMARY.md** - Technical details
- **README_GOOGLE_AUTH.md** - Complete overview

## Commands

```bash
# Verify MCP configuration
npm run test:mcp

# Start development server
npm run dev

# Run migration (requires service role key)
npm run migrate:oauth

# Run tests
npm run test
```

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ You can click "Continue with Google"
2. ✅ You're redirected to Google sign-in
3. ✅ You sign in with your Google account
4. ✅ You're redirected back to the app
5. ✅ You're logged in and see the dashboard
6. ✅ Your profile exists in `profiles` table
7. ✅ Your OAuth data exists in `oauth_providers` table
8. ✅ No errors in browser console
9. ✅ No errors in Supabase logs

---

**Current Status**: Ready for database migration and testing!

**Estimated Time**: 5-10 minutes

**Difficulty**: Easy (just copy/paste SQL and test)
