import { Text, View, Pressable, ScrollView } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { useCallback, useState } from "react";
import { db } from "../../db/db";

type HistoryRow = {
  id: string;
  date: string;
  finishedAt: string;
};

export default function HistoryScreen() {
  const [rows, setRows] = useState<HistoryRow[]>([]);

  const load = useCallback(() => {
    const r = 
      db.getAllSync<HistoryRow>(
        `SELECT id, date, finishedAt
        FROM workout_session
        WHERE finishedAt IS NOT NULL
        AND deletedAt IS NULL
        ORDER BY finishedAt DESC;`
      ) ?? [];
      setRows(r);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return( 
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "800" }}>History</Text>

      {rows.length === 0 ? (
        <Text style={{ opacity: 0.7 }}>
          No finished workouts yet. Start a session and press Finish.
        </Text>
      ) : (
        <View style={{ gap: 10 }}>
          {rows.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => router.push(`/workouts/session/${s.id}`)}
              style={{
                borderWidth: 1,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 12,
              }}
            >
              <Text style={{ fontWeight: "800" }}>
                {new Date(s.finishedAt).toLocaleString()}
              </Text>
              <Text style={{ opacity: 0.7 }}>
                Session started: {new Date(s.date).toLocaleString()}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}