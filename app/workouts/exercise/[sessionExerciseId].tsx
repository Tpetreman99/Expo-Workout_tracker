import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import {
  addSetEntry,
  getSessionExerciseWithName,
  listSetsForSessionExercise,
  SetEntryRow,
} from "../../../db/db";

function parseIntSafe(s: string): number | null {
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function parseFloatSafe(s: string): number | null {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

export default function ExerciseDetailScreen() {
  const { sessionExerciseId } = useLocalSearchParams<{ sessionExerciseId: string }>();
  const seid = useMemo(
    () => (typeof sessionExerciseId === "string" ? sessionExerciseId : ""),
    [sessionExerciseId]
  );

  const [header, setHeader] = useState<{
    sessionExerciseId: string;
    sessionId: string;
    exerciseId: string;
    exerciseName: string;
  } | null>(null);

  const [sets, setSets] = useState<SetEntryRow[]>([]);
  const [repsText, setRepsText] = useState("");
  const [weightText, setWeightText] = useState("");

  const load = useCallback(() => {
    if (!seid) return;

    const h = getSessionExerciseWithName(seid);
    setHeader(h ?? null);

    const rows = listSetsForSessionExercise(seid);
    setSets(rows);
  }, [seid]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const canSave = useMemo(() => {
    const reps = parseIntSafe(repsText);
    const weight = parseFloatSafe(weightText);
    return reps != null && reps > 0 && weight != null;
  }, [repsText, weightText]);

  function onAddSet() {
    if (!seid) return;

    const reps = parseIntSafe(repsText);
    if (reps == null || reps <= 0) return;

    const weight = parseFloatSafe(weightText);
    if (weight == null) return;
    addSetEntry({
      sessionExerciseId: seid,
      reps,
      weightKg: weight,
    });

    setRepsText("");
    setWeightText("");
    load();
  }

  if (!seid) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Exercise</Text>
        <Text style={{ marginTop: 8 }}>Missing sessionExerciseId in route.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        onPress={() => router.back()}
        style={{
          alignSelf: "flex-start",
          paddingVertical: 8,
          paddingHorizontal: 10,
          borderRadius: 10,
          borderWidth: 1,
        }}
      >
        <Text style={{ fontWeight: "700" }}>Back</Text>
      </Pressable>

      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 22, fontWeight: "800" }}>
          {header?.exerciseName ?? "Exercise"}
        </Text>
        <Text style={{ opacity: 0.7 }}>Log sets for this exercise.</Text>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "800" }}>Add Set</Text>

        <View style={{ gap: 8 }}>
          <Text style={{ opacity: 0.7 }}>Reps</Text>
          <TextInput
            value={repsText}
            onChangeText={setRepsText}
            keyboardType="number-pad"
            placeholder="e.g., 8"
            style={{
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ opacity: 0.7 }}>Weight (kg)</Text>
          <TextInput
            value={weightText}
            onChangeText={setWeightText}
            keyboardType="decimal-pad"
            placeholder="e.g., 60"
            style={{
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />
        </View>

        <Pressable
          onPress={onAddSet}
          disabled={!canSave}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 14,
            borderRadius: 12,
            borderWidth: 1,
            opacity: canSave ? 1 : 0.4,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "800" }}>Add Set</Text>
        </Pressable>
      </View>

      <View style={{ gap: 10, marginTop: 6 }}>
        <Text style={{ fontSize: 16, fontWeight: "800" }}>Sets</Text>

        {sets.length === 0 ? (
          <Text style={{ fontSize: 16 }}>No sets yet.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {sets.map((s, idx) => (
              <View
                key={s.id}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 14, opacity: 0.7 }}>Set {s.setNumber}</Text>
                <Text style={{ fontSize: 16, fontWeight: "800" }}>
                  {s.reps} reps
                  {s.weightKg != null ? ` @ ${s.weightKg} kg` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}