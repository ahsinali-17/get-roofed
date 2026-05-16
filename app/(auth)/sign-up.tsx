import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleSignUpPress = async () => {
    const { error } = await signUp.password({
      firstName,
      lastName,
      emailAddress: email,
      password,
    });
    if (error) {
      alert(error.message);
      return;
    }
    if (!error) {
      await signUp.verifications.sendEmailCode();
    }
  };

  const handleVerifyPress = async () => {
    await signUp.verifications.verifyEmailCode({
      code,
    });
    if (signUp.status === "complete") {
      await signUp.finalize({
        // Redirect the user to the home page after signing up
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url as any);
          }
        },
      });
    } else {
      console.error("Sign-up attempt not complete:", signUp);
    }
  };
  if (
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0 &&
    signUp.status === "missing_requirements"
  ) {
    return (
      <View className="flex-1 justify-center gap-3 px-6 py-12">
        <Image
          source={require("../../assets/images/kribb.png")}
          resizeMode="contain"
          style={{
            width: 80,
            height: 80,
          }}
        />
        <Text className="text-3xl font-bold text-gray-900">Verify Account</Text>
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
          <Text className="text-red-500 mb-2">
            {errors.fields.code.message}
          </Text>
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
            onPress={() => signUp.verifications.sendEmailCode()}
            className="text-blue-600"
          >
            Send code again.
          </Text>
        </View>
      </View>
    );
  }

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="bg-white"
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-center px-6 py-12">
        <Image
          source={require("../../assets/images/kribb.png")}
          resizeMode="contain"
          style={{
            width: 80,
            height: 80,
            marginBottom: 12,
          }}
        />
        <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
        <Text className="text-xl text-gray-500 font-semibold">
          Find the best roof over your head.
        </Text>
        <View className="w-full flex-row gap-3 my-3">
          <TextInput
            className="w-1/2 border-2 border-gray-600 rounded-lg p-3 text-gray-700"
            placeholder="FirstName"
            placeholderTextColor={"#58616f"}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
          <TextInput
            className="w-1/2 border-2 border-gray-600 rounded-lg p-3 text-gray-700"
            placeholder="LastName"
            placeholderTextColor={"#58616f"}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />
        </View>
        <TextInput
          className="w-full border-2 border-gray-600 rounded-lg p-3 text-gray-700 mb-3"
          placeholder="Email"
          placeholderTextColor={"#58616f"}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {errors.fields.emailAddress?.message && (
          <Text className="text-red-500 mb-2">
            {errors.fields.emailAddress.message}
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
          onPress={handleSignUpPress}
        >
          {fetchStatus === "fetching" ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white text-center text-lg font-semibold">
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-2">
          <Text className="text-gray-700">Already have an account? </Text>
          <Link href="/(auth)/sign-in">
            <Text className="text-blue-600 font-semibold">Sign In</Text>
          </Link>
        </View>

        <View
          className="w-full flex-row justify-center mt-3"
          nativeID="clerk-captcha"
        />
      </View>
    </ScrollView>
  );
}
