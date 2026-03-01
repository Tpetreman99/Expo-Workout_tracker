import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { addExerciseToSession, db } from "../../db/db";

type ExerciseRow = {
  id: string;
  name: string;
  primaryMuscleGroupId: string;
  secondaryMuscleGroupId: string | null;
};

type SessionRow = {
  focusMuscleGroupIds: string; // JSON
};

type MuscleGroupRow = {
  id: string;
  name: string;
};

function safeParseStringArray(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed)
      ? parsed.filter((v) => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

export default function ExercisePicker() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const sid = typeof sessionId === "string" ? sessionId : "";

  const [search, setSearch] = useState("");
  const [focusIds, setFocusIds] = useState<string[]>([]);
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [muscleMap, setMuscleMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!sid) return;

    const session = db.getFirstSync<SessionRow>(
      "SELECT focusMuscleGroupIds FROM workout_session WHERE id = ? AND deletedAt IS NULL;",
      [sid]
    );

    setFocusIds(safeParseStringArray(session?.focusMuscleGroupIds ?? "[]"));

    const muscles = db.getAllSync<MuscleGroupRow>(
      "SELECT id, name FROM muscle_group ORDER BY name ASC;"
    );
    const map: Record<string, string> = {};
    for (const m of muscles ?? []) {
      map[m.id] = m.name;
    }
    setMuscleMap(map);

    const rows = db.getAllSync<ExerciseRow>(
      `SELECT MIN(id) as id,
              name,
              primaryMuscleGroupId,
              secondaryMuscleGroupId
       FROM exercise
       WHERE deletedAt IS NULL
       GROUP BY name, primaryMuscleGroupId, secondaryMuscleGroupId
       ORDER BY name ASC;`
    );
    setExercises(rows ?? []);
  }, [sid]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exercises.filter((e) => e.name.toLowerCase().includes(q));
  }, [exercises, search]);

  const suggested = useMemo(() => {
    if (focusIds.length === 0) return [];
    const set = new Set(focusIds);
    return filtered.filter(
      (e) =>
        set.has(e.primaryMuscleGroupId) ||
        (e.secondaryMuscleGroupId != null && set.has(e.secondaryMuscleGroupId))
    );
  }, [filtered, focusIds]);

  const others = useMemo(() => {
    if (focusIds.length === 0) return filtered;
    const suggestedIds = new Set(suggested.map((s) => s.id));
    return filtered.filter((e) => !suggestedIds.has(e.id));
  }, [filtered, focusIds, suggested]);

  const groupedOthers = useMemo(() => {
    const groups: Record<string, ExerciseRow[]> = {};

    for (const e of others) {
      const groupName = muscleMap[e.primaryMuscleGroupId] ?? "Other";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(e);
    }

    // Sort groups A→Z and sort exercises within each group A→Z
    const sortedGroupNames = Object.keys(groups).sort((a, b) =>
      a.localeCompare(b)
    );

    return sortedGroupNames.map((name) => ({
      name,
      items: groups[name].sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [others, muscleMap]);

  function pickExercise(exerciseId: string) {
    if (!sid) return;
    addExerciseToSession(sid, exerciseId);
    router.back();
  }

  if (!sid) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Pick Exercise</Text>
        <Text style={{ marginTop: 8 }}>Missing sessionId in route.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ fontSize: 22, fontWeight: "800" }}>Pick an Exercise</Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search exercises..."
        style={{
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      />

      {focusIds.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={{ opacity: 0.7 }}>Suggested</Text>
          {suggested.length === 0 ? (
            <Text>No suggestions match your search.</Text>
          ) : (
            <View style={{ gap: 8 }}>
              {suggested.map((e) => (
                <Pressable
                  key={e.id}
                  onPress={() => pickExercise(e.id)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "700" }}>
                    {e.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={{ gap: 8 }}>
        <Text style={{ opacity: 0.7 }}>All Exercises</Text>
        {others.length === 0 ? (
          <Text>No exercises match your search.</Text>
        ) : (
          <View style={{ gap: 14 }}>
            {groupedOthers.map((group) => (
              <View key={group.name} style={{ gap: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", opacity: 0.8 }}>
                  {group.name}
                </Text>

                <View style={{ gap: 8 }}>
                  {group.items.map((e) => (
                    <Pressable
                      key={e.id}
                      onPress={() => pickExercise(e.id)}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: "700" }}>
                        {e.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}