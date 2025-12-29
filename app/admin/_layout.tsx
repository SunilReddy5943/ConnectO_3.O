import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      <Stack.Screen name="deals" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="actions" />
    </Stack>
  );
}
