import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import axios from 'axios';
import { getUserFriendlyError } from './utils/getUserFriendlyError';
import { globalErrorNotifier } from './errorNotifier';
import { DetailedValidationError } from './errors/DetailedValidationError';
import { NetworkError, NetworkErrorType } from './errors/NetworkError';
import { calculateDelay } from './utils/retry';

export const createConfiguredQueryClient = () => {
    return new QueryClient({
        queryCache: new QueryCache({
            onError: (error: unknown) => {
                const friendlyError = getUserFriendlyError(error);
                console.error('[Global Query Error Intercepted]', friendlyError);
                globalErrorNotifier.showError(friendlyError);
            },
        }),
        mutationCache: new MutationCache({
            onError: (error: unknown) => {
                const friendlyError = getUserFriendlyError(error);
                console.error('[Global Mutation Error Intercepted]', friendlyError);
                globalErrorNotifier.showError(friendlyError);
            },
        }),
        defaultOptions: {
            queries: {
                // Set default retry to false because Axios Interceptor already handles
                // transport-level exponential backoff retries with jitter and rate-limit headers.
                // This prevents the "Double Retry" flaw (3 x 3 = 9 requests).
                retry: false,
                staleTime: 5 * 60 * 1000, // 5 minutes
                gcTime: 10 * 60 * 1000,    // 10 minutes
                refetchOnWindowFocus: false,
            },
        },
    });
};

export const queryClient = createConfiguredQueryClient();
