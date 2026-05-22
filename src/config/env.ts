/**
 * @file Centralized runtime environment access for public Expo variables.
 */

const requireEnv = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const supabaseUrl = requireEnv(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  'EXPO_PUBLIC_SUPABASE_URL',
);

const supabaseAnonKey = requireEnv(
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
);

export const env = {
  supabaseUrl,
  supabaseAnonKey,
} as const;
