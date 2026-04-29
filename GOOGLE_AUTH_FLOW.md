# Google Authentication Flow Diagram

## 🔄 Complete Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER CLICKS BUTTON                          │
│                    "Continue with Google"                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    handleGoogleSignIn()                             │
│  • Sets googleLoading = true                                        │
│  • Calls supabase.auth.signInWithOAuth()                           │
│  • Provider: 'google'                                               │
│  • RedirectTo: window.location.origin                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   REDIRECT TO GOOGLE                                │
│  • User is redirected to Google's OAuth page                       │
│  • Google shows account selection                                  │
│  • User grants permissions                                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  GOOGLE AUTHENTICATES                               │
│  • Google verifies user credentials                                │
│  • Google generates OAuth tokens                                   │
│  • Google redirects back to Supabase                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              SUPABASE PROCESSES OAUTH                               │
│  • Receives OAuth tokens from Google                               │
│  • Creates/updates user in auth.users                              │
│  • Generates Supabase session                                      │
│  • Redirects to: window.location.origin                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                USER RETURNS TO APP                                  │
│  • URL: http://localhost:5173/                                     │
│  • Session is active                                               │
│  • AuthProvider detects auth state change                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              AuthProvider.onAuthStateChange()                       │
│  • Detects new session                                             │
│  • Calls ensureProfile(session)                                    │
│  • Updates state: session, user                                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ensureProfile(session)                           │
│  Step 1: Extract user data                                         │
│    • email = session.user.email                                    │
│    • username = email.split('@')[0]                                │
│    • full_name = session.user.user_metadata.full_name              │
│                                                                     │
│  Step 2: Check if profile exists                                   │
│    • Query profiles table for user.id                              │
│                                                                     │
│  Step 3: Create profile if needed                                  │
│    • Insert into profiles table                                    │
│    • id, email, username, full_name, balance                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              STORE OAUTH PROVIDER DATA (NEW!)                       │
│                                                                     │
│  Detect OAuth provider:                                            │
│    • provider = session.user.app_metadata.provider                 │
│    • If provider !== 'email' → Store OAuth data                    │
│                                                                     │
│  Extract OAuth data:                                               │
│    • provider_user_id = user_metadata.sub                          │
│    • avatar_url = user_metadata.picture                            │
│    • email = user.email                                            │
│    • full_name = user_metadata.full_name                           │
│    • raw_user_meta_data = user_metadata (complete JSON)            │
│                                                                     │
│  Store in oauth_providers table:                                   │
│    • INSERT/UPDATE oauth_providers                                 │
│    • Links to user via user_id                                     │
│    • Unique constraint: (provider, provider_user_id)               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    USER IS LOGGED IN                                │
│  • Session is active                                               │
│  • Profile exists in profiles table                                │
│  • OAuth data stored in oauth_providers table                      │
│  • User can access protected routes                                │
│  • Navigate to dashboard                                           │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Database State After Sign-In

### profiles table
```
┌──────────────────────────────────────┬─────────────────────┬──────────┬─────────┬──────────────┐
│ id (uuid)                            │ email               │ username │ balance │ full_name    │
├──────────────────────────────────────┼─────────────────────┼──────────┼─────────┼──────────────┤
│ 123e4567-e89b-12d3-a456-426614174000 │ user@gmail.com      │ user     │ 0.00    │ John Doe     │
└──────────────────────────────────────┴─────────────────────┴──────────┴─────────┴──────────────┘
```

### oauth_providers table (NEW!)
```
┌──────────────────────────────────────┬──────────┬──────────────────┬────────────────┬──────────────┐
│ user_id (uuid)                       │ provider │ provider_user_id │ email          │ full_name    │
├──────────────────────────────────────┼──────────┼──────────────────┼────────────────┼──────────────┤
│ 123e4567-e89b-12d3-a456-426614174000 │ google   │ 1234567890       │ user@gmail.com │ John Doe     │
└──────────────────────────────────────┴──────────┴──────────────────┴────────────────┴──────────────┘

┌────────────────────────────────────────────────┬─────────────────────────────────────────────────┐
│ avatar_url                                     │ raw_user_meta_data (jsonb)                      │
├────────────────────────────────────────────────┼─────────────────────────────────────────────────┤
│ https://lh3.googleusercontent.com/a/xyz123     │ {                                               │
│                                                │   "sub": "1234567890",                          │
│                                                │   "email": "user@gmail.com",                    │
│                                                │   "email_verified": true,                       │
│                                                │   "full_name": "John Doe",                      │
│                                                │   "picture": "https://...",                     │
│                                                │   "provider_id": "1234567890"                   │
│                                                │ }                                               │
└────────────────────────────────────────────────┴─────────────────────────────────────────────────┘
```

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ROW LEVEL SECURITY                             │
└─────────────────────────────────────────────────────────────────────┘

profiles table:
  ✅ Users can SELECT their own profile (auth.uid() = id)
  ✅ Users can INSERT their own profile (auth.uid() = id)
  ✅ Users can UPDATE their own profile (auth.uid() = id)
  ❌ Users CANNOT access other users' profiles

oauth_providers table:
  ✅ Users can SELECT their own OAuth data (auth.uid() = user_id)
  ✅ Users can INSERT their own OAuth data (auth.uid() = user_id)
  ✅ Users can UPDATE their own OAuth data (auth.uid() = user_id)
  ❌ Users CANNOT access other users' OAuth data
```

## 🎯 Key Components

### Frontend (React)
- **Login.tsx**: UI with Google button
- **auth.tsx**: AuthProvider with ensureProfile()
- **supabase.ts**: Supabase client configuration

### Backend (Supabase)
- **auth.users**: Supabase's built-in auth table
- **profiles**: Custom user profiles
- **oauth_providers**: OAuth provider data (NEW!)

### External
- **Google OAuth**: Google's authentication service
- **Supabase Auth**: Handles OAuth flow

## 🔄 Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ERROR OCCURS                                │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
                    ┌────────┴────────┐
                    │                 │
         ┌──────────▼─────────┐  ┌───▼──────────────┐
         │  OAuth Error       │  │  Database Error  │
         │  (Google/Supabase) │  │  (Profile/OAuth) │
         └──────────┬─────────┘  └───┬──────────────┘
                    │                 │
                    └────────┬────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Catch Block         │
                  │  • Log error         │
                  │  • Show toast        │
                  │  • Reset loading     │
                  └──────────────────────┘
```

## 📱 UI State Flow

```
Initial State:
  loading = false
  googleLoading = false

User clicks "Continue with Google":
  googleLoading = true
  ↓
  Redirect to Google
  ↓
  (User is away from app)
  ↓
  Return from Google
  ↓
  Auth state change detected
  ↓
  Profile created/updated
  ↓
  Navigate to dashboard
  ↓
  googleLoading = false (automatic via redirect)
```

## 🎨 Component Hierarchy

```
App
└── AuthProvider (wraps entire app)
    ├── Provides: session, user, loading, signOut
    ├── Listens: onAuthStateChange
    └── Calls: ensureProfile(session)
        ├── Creates/updates profile
        └── Stores OAuth data

Login Page
├── Email/Password Form
│   ├── Email input
│   ├── Password input
│   └── Submit button (loading state)
├── Divider ("Or continue with")
└── Google OAuth Button
    ├── Google logo SVG
    ├── Loading spinner
    └── Click handler: handleGoogleSignIn()
```

---

**This flow ensures:**
- ✅ Secure authentication via Google
- ✅ Automatic profile creation
- ✅ OAuth data storage for future use
- ✅ Proper error handling
- ✅ Good user experience with loading states
