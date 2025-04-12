# Supabase Authentication Setup

This project uses Supabase for authentication with social providers (Google, LinkedIn, and Microsoft).

## Setup Instructions

1. Create a Supabase project at [https://supabase.com](https://supabase.com)

2. Configure the following environment variables in your `.env.local` file:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. Configure OAuth providers in your Supabase dashboard:

   - Go to Authentication > Providers
   - Enable and configure Google, LinkedIn, and Microsoft providers
   - For each provider, you'll need to:
     - Create OAuth credentials in the respective developer console
     - Add the redirect URL: `https://your-supabase-project.supabase.co/auth/v1/callback`
     - Add the client ID and client secret to Supabase

4. For Google OAuth:

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Create OAuth 2.0 credentials
   - Add the authorized redirect URI from Supabase

5. For LinkedIn OAuth:

   - Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
   - Create a new app
   - Add the redirect URL from Supabase
   - Get the client ID and client secret

6. For Microsoft OAuth:
   - Go to [Azure Portal](https://portal.azure.com/)
   - Register a new application
   - Add the redirect URL from Supabase
   - Get the client ID and client secret

## Testing Authentication

1. Run the development server:

   ```
   npm run dev
   ```

2. Click the "Sign In" button in the header
3. Select one of the social providers
4. Complete the authentication flow
5. You should be redirected back to the application after successful authentication
