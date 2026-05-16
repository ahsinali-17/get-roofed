import { useUserStore } from "@/store/useUserStore";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  const { isAdmin } = useUserStore();
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
        <Icon sf="heart.fill" drawable="custom_saved_drawable" />
        <Label>Saved</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf="person.circle" drawable="custom_profile_drawable" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
