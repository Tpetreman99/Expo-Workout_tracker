import { useMemo, useState } from "react";
import { Text, View, Pressable } from "react-native";
import { getUnitSystem, setUnitSystem } from "../db/db";

export default function Settings() {
  const initial = useMemo(() => getUnitSystem(), []);
  const [unit, setUnit] = useState<"kg" | "lb">(initial);

  function choose(next: "kg" | "lb") {
    setUnit(next);
    setUnitSystem(next);
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Units</Text>

      <View style={{ flexDirection: "row", gap: 12 }}>
        {(["lb", "kg"] as const).map((u) => (
          <Pressable
            key={u}
            onPress={() => choose(u)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              borderWidth: 1,
              opacity: unit === u ? 1 : 0.6,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600" }}>{u.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ opacity: 0.7 }}>
        Stored locally now. Later, this will sync with your account.
      </Text>
    </View>
  );
}