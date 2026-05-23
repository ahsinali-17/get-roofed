import { useSupabase } from "@/hooks/useSupabase";
import { useSaveCountStore } from "@/store/saveCountStore";
import { useUserStore } from "@/store/useUserStore";
import { useAuth } from "@clerk/expo";
import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { useEffect } from "react";
import { Platform, Text, View } from "react-native";

function IOSLayout({ isAdmin, saveCount }) {
  return (
    <NativeTabs scrollEnabled>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <Icon sf="magnifyingglass" drawable="custom_search_drawable" />
        <Label>Search</Label>
      </NativeTabs.Trigger>
      {isAdmin && (
        <NativeTabs.Trigger name="create">
          <Label>Add Property</Label>
          <Icon sf="plus" drawable="custom_plus_drawable" />
        </NativeTabs.Trigger>
      )}
      <NativeTabs.Trigger name="saved">
        <View style={{ position: "relative" }}>
          <Icon sf="heart.fill" drawable="custom_saved_drawable" />
          {saveCount > 0 && (
            <View
              style={{
                position: "absolute",
                right: -8,
                top: -8,
                backgroundColor: "#ff3333",
                borderRadius: 12,
                width: 24,
                height: 24,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
                {saveCount}
              </Text>
            </View>
          )}
        </View>
        <Label>Saved</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf="person.circle" drawable="custom_profile_drawable" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function AndroidLayout({ isAdmin, saveCount }) {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0066cc",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#ddd",
          borderTopWidth: 1,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="search" size={24} color={color} />
          ),
        }}
      />

      {isAdmin ? (
        <Tabs.Screen
          name="create"
          options={{
            title: "Add Property",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="plus" size={24} color={color} />
            ),
          }}
        />
      ) : null}

      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="heart" size={24} color={color} />
          ),
          tabBarBadge: saveCount > 0 ? saveCount : null,
          badgeStyle: {
            backgroundColor: "#ff3333",
            color: "#fff",
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  const isAdmin = useUserStore((state) => state.isAdmin);
  const { saveCount, setSaveCount } = useSaveCountStore();
  const authSupabase = useSupabase();
  const { userId } = useAuth();

  const fetchSaveCount = async () => {
    if (!userId) return;
    const { data, error } = await authSupabase
      .from("saved_properties")
      .select("id", { count: "exact" })
      .eq("user_clerk_id", userId);
    if (error) {
      console.error("Error fetching save count:", error);
    } else {
      setSaveCount(data.length);
    }
  };

  useEffect(() => {
    fetchSaveCount();
  }, [userId]);

  return Platform.OS === "ios" ? (
    <IOSLayout isAdmin={isAdmin} saveCount={saveCount} />
  ) : (
    <AndroidLayout isAdmin={isAdmin} saveCount={saveCount} />
  );
}
