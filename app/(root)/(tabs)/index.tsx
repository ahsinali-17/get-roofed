import { useUserStore } from "@/store/useUserStore";
import { Text, View } from "react-native";

export default function Home() {
  const { isAdmin } = useUserStore();
  return (
    <View>
      <Text className="">Home</Text>
      <Text className="text-lg font-bold mt-12">
        You are an admin! {isAdmin ? "Yes" : "No"}
      </Text>
    </View>
  );
}
