import { Link, useFocusEffect, router } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View, Pressable } from "react-native";
import { getUnitSystem } from "../../db/db";

export default function Home() {
  const [unit, setUnit] = useState<"kg" | "lb">(getUnitSystem());

  useFocusEffect(
    useCallback(() => {
      setUnit(getUnitSystem());
    }, [])
  );

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Workout Tracker</Text>
      <Text>Current units: {unit.toUpperCase()}</Text>
      <Link href="/settings">Go to Settings</Link>

      <Pressable
        onPress={() => router.push("/workouts/start")}
        style={{
          paddingVertical: 14,
          paddingHorizontal: 14,
          borderRadius: 12,
          borderWidth: 1,
          alignSelf: "flex-start",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "700" }}>Start Workout</Text>
      </Pressable>
    </View>
  );
}