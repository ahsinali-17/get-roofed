import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import React from "react";

export default function RootLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // sync clerk auth -> supabase

  if (!isLoaded) {
    return null;
  }
  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return <Redirect href="/(root)/(tabs)" />;
}
