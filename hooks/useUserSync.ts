import { useUserStore } from "@/store/useUserStore";
import { useUser } from "@clerk/expo";
import { useEffect } from "react";
import { useSupabase } from "./useSupabase";

export const useUserSync = () => {
  const { user } = useUser();
  const { isAdmin, setIsAdmin } = useUserStore();
  const supabase = useSupabase();

  useEffect(() => {
    if (!user) {
      return;
    }
    syncUser();
  }, [user]);

  const syncUser = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("is_admin")
      .eq("clerk_id", user?.id)
      .single();
    if (error) {
      console.error("Error fetching user data:", error);
    }
    if (data?.is_admin !== undefined) {
      setIsAdmin(data.is_admin);
    } else {
      const { data: newUser } = await supabase
        .from("users")
        .insert({
          clerk_id: user?.id,
          is_admin: false,
          email: user?.emailAddresses[0].emailAddress,
          first_name: user?.firstName,
          last_name: user?.lastName,
          avatar_url: user?.imageUrl,
        })
        .select("is_admin")
        .single();
      if (newUser) {
        setIsAdmin(newUser.is_admin ?? false);
      }
    }
  };
};
