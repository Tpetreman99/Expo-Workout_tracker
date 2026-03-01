import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {

  return (
    <Tabs screenOptions={{headerTitleAlign: "center"}}>
      <Tabs.Screen name="home" options={{ title: "Home"}}/>
      <Tabs.Screen name="history" options={{ title: "History"}}/>
      <Tabs.Screen name="summary" options={{ title: "Summary"}}/>
    </Tabs>
  );
}
