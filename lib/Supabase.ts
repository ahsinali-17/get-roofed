import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Key must be provided");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export function createClerkSupabaseClient(getToken: () => Promise<string>) {
  return createClient(supabaseUrl, supabaseKey, {
    accessToken: async () => {
      const token = await getToken();
      return token;
    },
  });
}
