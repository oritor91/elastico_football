import { Stack } from 'expo-router';

export default function MatchDayLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="teams" />
    </Stack>
  );
}