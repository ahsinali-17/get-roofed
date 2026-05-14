import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Slot } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

const publishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY! ||
  "pk_test_aW1wcm92ZWQtc2hhZC0zNi5jbGVyay5hY2NvdW50cy5kZXYk";

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SafeAreaProvider>
        <SafeAreaView className="flex-1">
          <Slot />
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
