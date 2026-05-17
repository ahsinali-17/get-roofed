import { createClerkSupabaseClient } from "@/lib/Supabase";
import { useAuth } from "@clerk/expo";
import { useMemo } from "react";

export const useSupabase = () => {
  const { getToken } = useAuth();
  const supabase = useMemo(
    () => createClerkSupabaseClient(() => getToken()),
    [getToken],
  );
  return supabase;
};
