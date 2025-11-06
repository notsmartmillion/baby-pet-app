import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '../utils/trpc';
import { useEffect } from 'react';
import { registerForPushNotificationsAsync } from '../utils/notifications';
import { useAuthStore } from '../store/authStore';
import { detectUserRegion } from '../utils/geolocation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60, // 1 minute
    },
  },
});

export default function RootLayout() {
  const setUserRegion = useAuthStore((state) => state.setUserRegion);

  useEffect(() => {
    // Request notification permissions on mount
    registerForPushNotificationsAsync().catch(console.error);
    
    // Detect user region for GDPR compliance
    detectUserRegion().then((region) => {
      setUserRegion(region);
      console.log('User region detected:', region);
    });
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <Stack>
            <Stack.Screen name="index" options={{ title: 'Kittypup', headerShown: false }} />
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
            <Stack.Screen name="purchase" options={{ title: 'Get Premium' }} />
            <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
            <Stack.Screen name="terms" options={{ title: 'Terms of Service' }} />
          </Stack>
        </SafeAreaProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

