import { useAuth, useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const { signIn, errors, fetchStatus } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const finalizeSignIn = async () => {
    await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          console.log(session.currentTask);
          return;
        }
        const url = decorateUrl("/");
        if (Platform.OS === "web" && url.startsWith("http")) {
          window.location.href = url;
        } else {
          router.push(url as any);
        }
      },
    });
  };

  const handleSignInPress = async () => {
    try {
      const { error } = await signIn.password({
        emailAddress: email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check status after password attempt
      if (signIn.status === "complete") {
        await finalizeSignIn();
      } else if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        // using email for both 2FA and client trust
        try {
          await signIn.mfa.sendEmailCode();
        } catch (emailErr: any) {
          alert(`Failed to send verification email. ${emailErr.message}`);
        }
      }
    } catch (err: any) {
      alert(err || "Sign in failed. Please try again.");
    }
  };

  const handleVerifyPress = async () => {
    try {
      await signIn.mfa.verifyEmailCode({
        code,
      });

      if (signIn.status === "complete") {
        await finalizeSignIn();
      }
    } catch (err) {
      console.error("Verification error:", err);
      alert("Verification failed. Please try again.");
    }
  };

  if (
    signIn.status === "needs_client_trust" ||
    signIn.status === "needs_second_factor"
  ) {
    return (
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center gap-3 px-6 py-12">
          <Image
            source={require("../../assets/images/icon.png")}
            resizeMode="contain"
            style={{
              width: 80,
              height: 80,
            }}
          />
          <Text className="text-3xl font-bold text-gray-900">
            Verify Account
          </Text>
          <Text className="text-xl font-semibold text-gray-500">
            We emailed you the code at {email}.
          </Text>
          <TextInput
            className="w-full border-2 border-gray-600 rounded-lg p-3 text-gray-700"
            placeholder="Enter code"
            placeholderTextColor={"#58616f"}
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            keyboardType="number-pad"
          />
          {errors.fields.code?.message && (
            <Text className="text-red-500">{errors.fields.code.message}</Text>
          )}
          <TouchableOpacity
            className="w-full bg-blue-600 py-3 rounded-lg"
            disabled={fetchStatus === "fetching"}
            onPress={handleVerifyPress}
          >
            {fetchStatus === "fetching" ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                Verify
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-2">
            <Text
              onPress={() => signIn.mfa.sendEmailCode()}
              className="text-blue-600"
            >
              Send code again.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (signIn.status === "complete" || isSignedIn) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-white"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          <Image
            source={require("../../assets/images/icon.png")}
            resizeMode="contain"
            style={{
              width: 80,
              height: 80,
              marginBottom: 12,
            }}
          />
          <Text className="text-3xl font-bold text-gray-900">Welcome Back</Text>
          <Text className="text-xl text-gray-500 font-semibold mb-3">
            Sign in to your account
          </Text>

          <TextInput
            className="w-full border-2 border-gray-600 rounded-lg p-3 text-gray-700 mb-3"
            placeholder="Email"
            placeholderTextColor={"#58616f"}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {errors.fields.identifier?.message && (
            <Text className="text-red-500 mb-2">
              {errors.fields.identifier.message}
            </Text>
          )}

          <TextInput
            className="w-full border-2 border-gray-600 rounded-lg p-3 text-gray-700 mb-3"
            placeholder="Password"
            placeholderTextColor={"#58616f"}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            secureTextEntry
          />
          {errors.fields.password?.message && (
            <Text className="text-red-500 mb-2">
              {errors.fields.password.message}
            </Text>
          )}
          <TouchableOpacity
            className="w-full bg-blue-600 py-3 rounded-lg"
            disabled={fetchStatus === "fetching"}
            onPress={handleSignInPress}
          >
            {fetchStatus === "fetching" ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-2">
            <Text className="text-gray-700">Don&apos;t have an account? </Text>
            <Link href="/(auth)/sign-up">
              <Text className="text-blue-600 font-semibold">Sign Up</Text>
            </Link>
          </View>

          <View
            className="w-full flex-row justify-center mt-3"
            nativeID="clerk-captcha"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
