import { useUserStore } from "@/store/useUserStore";
import { Text, View } from "react-native";

export default function Home() {
  const isAdmin = useUserStore((state) => state.isAdmin);
  return (
    <View>
      <Text className="">Home</Text>
      <Text className="text-lg font-bold">
        You are an admin! {isAdmin ? "Yes" : "No"}
      </Text>
    </View>
  );
}
