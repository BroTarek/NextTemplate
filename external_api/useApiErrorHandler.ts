import { useState, useEffect, useCallback } from 'react';
import { globalErrorNotifier } from './errorNotifier';
import { getUserFriendlyError, ErrorWithAction } from './utils/getUserFriendlyError';
import { NetworkError } from './errors/NetworkError';
import { HttpError } from './errors/HttpError';
import { DetailedValidationError } from './errors/DetailedValidationError';

/**
 * Hook to access global error state or manually dispatch errors to the global popup modal.
 * Works seamlessly with Option A (Global React Query Listener).
 */
export function useApiErrorHandler() {
    const [error, setError] = useState<ErrorWithAction | null>(() => globalErrorNotifier.getError());

    useEffect(() => {
        const unsubscribe = globalErrorNotifier.subscribe((err) => {
            setError(err);
        });
        return unsubscribe;
    }, []);

    // Manually trigger global error popup modal
    const handleError = useCallback((err: unknown): ErrorWithAction => {
        const friendlyError = getUserFriendlyError(err);
        globalErrorNotifier.showError(friendlyError);
        return friendlyError;
    }, []);

    // Clear active error popup
    const clearError = useCallback(() => {
        globalErrorNotifier.clearError();
    }, []);

    // Check if an error is retryable
    const isRetryableError = useCallback((err: unknown): boolean => {
        if (err instanceof NetworkError) {
            return ['CONNECTION_TIMEOUT', 'CONNECTION_REFUSED', 'UNKNOWN_NETWORK_ERROR'].includes(err.type);
        }
        if (err instanceof HttpError) {
            return [408, 429, 500, 502, 503, 504].includes(err.status);
        }
        return false;
    }, []);

    // Extract validation errors (422 HTTP or Zod Schema failures)
    const getValidationErrors = useCallback((err: unknown): Record<string, string[]> | null => {
        if (err instanceof HttpError && err.status === 422 && err.data) {
            return err.data.errors || err.data;
        }
        if (err instanceof DetailedValidationError && err.validationErrors) {
            const formatted: Record<string, string[]> = {};
            for (const issue of err.validationErrors) {
                const path = issue.path.join('.') || 'root';
                formatted[path] = formatted[path] || [];
                formatted[path].push(issue.message);
            }
            return formatted;
        }
        return null;
    }, []);

    // Check if error is auth-related
    const isAuthError = useCallback((err: unknown): boolean => {
        return err instanceof HttpError && (err.status === 401 || err.status === 403);
    }, []);

    return {
        error,
        handleError,
        clearError,
        isRetryableError,
        getValidationErrors,
        isAuthError,
    };
}