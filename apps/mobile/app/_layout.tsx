import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '../utils/trpc';
import { useEffect } from 'react';
import { registerForPushNotificationsAsync } from '../utils/notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60, // 1 minute
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    // Request notification permissions on mount
    registerForPushNotificationsAsync().catch(console.error);
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <Stack>
            <Stack.Screen name="index" options={{ title: 'Baby Pet', headerShown: false }} />
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
            <Stack.Screen name="purchase" options={{ title: 'Get Premium' }} />
          </Stack>
        </SafeAreaProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

