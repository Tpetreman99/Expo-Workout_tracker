import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { createSession, db } from "../../db/db";

type MuscleGroupRow = { id: string; name: string };

export default function StartWorkout() {
  const [muscles, setMuscles] = useState<MuscleGroupRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const rows = db.getAllSync<MuscleGroupRow>(
      "SELECT id, name FROM muscle_group ORDER BY name ASC;"
    );
    setMuscles(rows ?? []);
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onContinue() {
    const focus = Array.from(selected);
    const sessionId = createSession(focus);
    router.push(`/workouts/session/${sessionId}`);
  }

  function onSkip() {
    const sessionId = createSession([]);
    router.push(`/workouts/session/${sessionId}`);
  }

  return (
    <View style={{ padding: 16, gap: 14 }}>
      <Text style={{ fontSize: 22, fontWeight: "800" }}>
        What are you training today?
      </Text>

      <Text style={{ opacity: 0.7 }}>
        Select muscle groups to get suggested exercises (templates come later).
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {muscles.map((m) => {
          const on = selected.has(m.id);
          return (
            <Pressable
              key={m.id}
              onPress={() => toggle(m.id)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
                borderWidth: 1,
                opacity: on ? 1 : 0.6,
              }}
            >
              <Text style={{ fontWeight: "600" }}>{m.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: 10, marginTop: 10 }}>
        <Pressable
          onPress={onContinue}
          disabled={selected.size === 0}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 14,
            borderRadius: 12,
            borderWidth: 1,
            opacity: selected.size === 0 ? 0.4 : 1,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700" }}>Continue</Text>
        </Pressable>

        <Pressable
          onPress={onSkip}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 14,
            borderRadius: 12,
            borderWidth: 1,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700" }}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}
