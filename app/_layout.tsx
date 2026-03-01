import { Stack } from "expo-router";
import { useEffect } from "react";
import { initDb } from "../db/db";

export default function RootLayout() {
  useEffect(() => {
    initDb();
  }, []);

  return (
    <Stack screenOptions={{ 
      headerTitleAlign: "center",
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: "Settings", headerBackTitle: "Home" }} />
    </Stack>
  );
}