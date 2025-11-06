import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import type { TRPCRouter } from '@kittypup/api'; // Import from your API service
import Constants from 'expo-constants';
import { useAuthStore } from '../store/authStore';

export const trpc = createTRPCReact<TRPCRouter>();

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      headers() {
        const userId = useAuthStore.getState().userId;
        return {
          'x-user-id': userId || '',
        };
      },
    }),
  ],
});

