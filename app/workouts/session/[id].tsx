import { useFocusEffect, useLocalSearchParams, router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { db, listSetsForSession, SessionSetRow } from "../../../db/db";

type SessionRow = {
  id: string;
  date: string;
  focusMuscleGroupIds: string; // JSON string
};

type MuscleGroupRow = {
  id: string;
  name: string;
};

type SessionExerciseRow = {
  sessionExerciseId: string;
  exerciseName: string;
};

function safeParseStringArray(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = useMemo(() => (typeof id === "string" ? id : ""), [id]);

  const [session, setSession] = useState<SessionRow | null>(null);
  const [muscleMap, setMuscleMap] = useState<Record<string, string>>({});
  const [sessionExercises, setSessionExercises] = useState<SessionExerciseRow[]>(
    []
  );
  const [setsBySeid, setSetsBySeid] = useState<Record<string, SessionSetRow[]>>({});

  const loadSession = useCallback(() => {
    if (!sessionId) return;

    const row = db.getFirstSync<SessionRow>(
      "SELECT id, date, focusMuscleGroupIds FROM workout_session WHERE id = ? AND deletedAt IS NULL;",
      [sessionId]
    );
    setSession(row ?? null);

    const muscles = db.getAllSync<MuscleGroupRow>(
      "SELECT id, name FROM muscle_group ORDER BY name ASC;"
    );
    const map: Record<string, string> = {};
    for (const m of muscles) map[m.id] = m.name;
    setMuscleMap(map);

    const exRows = db.getAllSync<SessionExerciseRow>(
      `SELECT se.id as sessionExerciseId, e.name as exerciseName
       FROM session_exercise se
       JOIN exercise e ON e.id = se.exerciseId
       WHERE se.sessionId = ? AND se.deletedAt IS NULL
       ORDER BY se.orderIndex ASC;`,
      [sessionId]
    );
    setSessionExercises(exRows ?? []);

    const allSets = listSetsForSession(sessionId);
    const setMap: Record<string, SessionSetRow[]> = {};

    for (const s of allSets) {
      if (!setMap[s.sessionExerciseId]) setMap[s.sessionExerciseId] = [];
      setMap[s.sessionExerciseId].push(s);
    }

    setSetsBySeid(setMap);
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useFocusEffect(
    useCallback(() => {
      loadSession();
    }, [loadSession])
  );

  const focusIds = useMemo(() => {
    if (!session) return [];
    return safeParseStringArray(session.focusMuscleGroupIds);
  }, [session]);

  const focusNames = useMemo(() => {
    return focusIds.map((mid) => muscleMap[mid] ?? mid);
  }, [focusIds, muscleMap]);

  if (!sessionId) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Session</Text>
        <Text style={{ marginTop: 8 }}>Missing session id in the route.</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ padding: 16, gap: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Session</Text>
        <Text>Could not find a session with id:</Text>
        <Text style={{ fontFamily: "Courier" }}>{sessionId}</Text>

        <Pressable
          onPress={() => router.back()}
          style={{
            marginTop: 10,
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 10,
            borderWidth: 1,
            alignSelf: "flex-start",
          }}
        >
          <Text style={{ fontWeight: "600" }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ padding: 16, gap: 14 }}>
      <Text style={{ fontSize: 22, fontWeight: "800" }}>Active Session</Text>

      <View style={{ gap: 6 }}>
        <Text style={{ opacity: 0.7 }}>Date</Text>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>
          {new Date(session.date).toLocaleString()}
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ opacity: 0.7 }}>Focus</Text>
        {focusNames.length === 0 ? (
          <Text style={{ fontSize: 16 }}>No focus selected (skipped).</Text>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {focusNames.map((name) => (
              <View
                key={name}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                }}
              >
                <Text style={{ fontWeight: "600" }}>{name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={{ gap: 8, marginTop: 4 }}>
        <Text style={{ opacity: 0.7 }}>Exercises</Text>

        {sessionExercises.length === 0 ? (
          <Text style={{ fontSize: 16 }}>No exercises added yet.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {sessionExercises.map((ex) => (
              <View
                key={ex.sessionExerciseId}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "700" }}>
                  {ex.exerciseName}
                </Text>
                <View style={{ marginTop: 8 }}>
                  {(setsBySeid[ex.sessionExerciseId] ?? []).length === 0 ? (
                    <Text style={{ opacity: 0.6 }}>No sets yet</Text>
                  ) : (
                    (setsBySeid[ex.sessionExerciseId] ?? []).map((s) => (
                      <Text key={`${ex.sessionExerciseId}-${s.setNumber}`}>
                        Set {s.setNumber}: {s.reps} reps @ {s.weightKg} kg
                      </Text>
                    ))
                  )}
                </View>
                <Pressable
                  onPress={() =>
                    router.push(`/workouts/exercise/${ex.sessionExerciseId}`)
                  }
                  style={{
                    marginTop: 6,
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>Log Sets</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={{ marginTop: 10, gap: 10 }}>
        <Pressable
          onPress={() => router.push(`/workouts/picker?sessionId=${sessionId}`)}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 14,
            borderRadius: 12,
            borderWidth: 1,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700" }}>Add Exercise</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            if (!sessionId) return;

            const finishedAt = new Date().toISOString();

            db.runSync(
              "UPDATE workout_session SET finishedAt = ?, updatedAt = ? WHERE id = ?;",
              [finishedAt, finishedAt, sessionId]
            );

            router.replace("/history");
          }}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 14,
            borderRadius: 12,
            borderWidth: 1,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700" }}>
            Finish
          </Text>
        </Pressable>
      </View>
    </View>
  );
}