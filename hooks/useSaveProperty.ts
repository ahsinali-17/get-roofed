import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";
import { useSupabase } from "./useSupabase";

export function useSaveProperty({
  propertyID,
  onUnsave,
}: {
  propertyID: string;
  onUnsave?: () => void;
}) {
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const authSupabase = useSupabase();
  const { userId } = useAuth();

  useEffect(() => {
    checkIfSaved();
  }, [userId, propertyID]);

  const checkIfSaved = async () => {
    if (!userId) return;
    const { data, error } = await authSupabase
      .from("saved_properties")
      .select("id")
      .eq("user_clerk_id", userId)
      .eq("property_id", propertyID)
      .single();
    setIsSaved(!!data);
  };

  const toggleSave = async () => {
    if (!userId || saveLoading) return;
    setSaveLoading(true);
    if (isSaved) {
      const { error: deleteError } = await authSupabase
        .from("saved_properties")
        .delete()
        .eq("user_clerk_id", userId)
        .eq("property_id", propertyID);
      if (deleteError) {
        console.error("Error unsaving property:", deleteError);
      } else {
        setIsSaved(false);
        onUnsave?.();
      }
    } else {
      const { error: insertError } = await authSupabase
        .from("saved_properties")
        .insert({ user_clerk_id: userId, property_id: propertyID });
      if (insertError) {
        console.error("Error saving property:", insertError);
      } else {
        setIsSaved(true);
      }
    }
    setSaveLoading(false);
  };

  return { isSaved, saveLoading, toggleSave };
}
