import { useUserStore } from "@/store/useUserStore";
import { useUser } from "@clerk/expo";
import { useEffect } from "react";
import { useSupabase } from "./useSupabase";

export const useUserSync = () => {
  const { user } = useUser();
  const setIsAdmin = useUserStore((state) => state.setIsAdmin);
  const authSupabase = useSupabase();

  useEffect(() => {
    if (!user) {
      return;
    }
    syncUser();
  }, [user]);

  const syncUser = async () => {
    const { data, error } = await authSupabase
      .from("users")
      .select("is_admin")
      .eq("clerk_id", user?.id)
      .single();
    if (error && error.code === "PGRST116") {
      console.log("no rows detected; likely a new user, creating one");
    }
    if (data?.is_admin !== undefined) {
      setIsAdmin(data.is_admin);
    } else {
      const { data: newUser } = await authSupabase
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
