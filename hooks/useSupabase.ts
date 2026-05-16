import { createClerkSupabaseClient } from "@/lib/Supabase";
import { useAuth } from "@clerk/expo";

export const useSupabase = () => {
  const { getToken } = useAuth();
  const supabase = createClerkSupabaseClient(
    async () => (await getToken()) ?? "",
  );
  return supabase;
};
