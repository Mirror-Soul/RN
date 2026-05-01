import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="call-detail" />
        <Stack.Screen name="voice-update" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
