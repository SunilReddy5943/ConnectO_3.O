import { createClient } from '@supabase/supabase-js';

/**
 * IMPORTANT: PRODUCTION SECURITY WARNING
 * ========================================
 * These credentials are currently hardcoded for development.
 * 
 * BEFORE PRODUCTION DEPLOYMENT:
 * 1. Move these to environment variables (.env file)
 * 2. Never commit .env files to version control
 * 3. Use expo-env or react-native-dotenv for env management
 * 4. Rotate keys if they were ever exposed publicly
 * 
 * Example:
 * const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
 * const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
 */

// Real Supabase credentials - ConnectO Project
const supabaseUrl = 'https://umyonopzgnzuzyhousur.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteW9ub3B6Z256dXp5aG91c3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NjExNzAsImV4cCI6MjA1MDQzNzE3MH0.8YZqCm5xvZQxDqFGZ7T0pLqJ5X_KJYWMpQxQKZQxQKY';

// Initialize Supabase client - Reuse this instance throughout the app
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export { supabase };