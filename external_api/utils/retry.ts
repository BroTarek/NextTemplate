import axios from 'axios';
import { HttpError } from '../errors/HttpError';
import { NetworkError, NetworkErrorType } from '../errors/NetworkError';

export interface RetryConfig {
    maxRetries?: number;
    initialDelay?: number;       // Base delay in ms (default 1000)
    maxDelay?: number;           // Maximum delay cap (default 30000)
    backoffFactor?: number;      // Multiplier (default 2)
    jitter?: boolean;            // Add randomness to prevent thundering herd
    retryableStatuses?: number[]; // HTTP statuses to retry
    retryableErrors?: string[];   // Error types to retry
}

export const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
    jitter: true,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', 'ERR_NETWORK'],
};

/**
 * Calculates exponential backoff delay with optional jitter.
 */
export function calculateDelay(
    attempt: number,
    config: Required<RetryConfig> = DEFAULT_RETRY_CONFIG
): number {
    let delay = config.initialDelay * Math.pow(config.backoffFactor, attempt);
    delay = Math.min(delay, config.maxDelay);

    if (config.jitter) {
        // Decorrelated jitter: random between 50% and 100% of calculated delay
        delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
}

/**
 * Checks if a given error qualifies for a retry attempt.
 */
export function isRetryableError(
    error: unknown,
    config: Required<RetryConfig> = DEFAULT_RETRY_CONFIG
): boolean {
    // 1. Never retry explicitly aborted requests
    if (axios.isCancel(error) || (error instanceof NetworkError && error.type === NetworkErrorType.ABORTED)) {
        return false;
    }

    // 2. Custom HttpError
    if (error instanceof HttpError) {
        return config.retryableStatuses.includes(error.status);
    }

    // 3. Custom NetworkError
    if (error instanceof NetworkError) {
        return [
            NetworkErrorType.CONNECTION_TIMEOUT,
            NetworkErrorType.CONNECTION_REFUSED,
            NetworkErrorType.UNKNOWN_NETWORK_ERROR,
        ].includes(error.type);
    }

    // 4. Axios error check
    if (axios.isAxiosError(error)) {
        if (error.code && config.retryableErrors.includes(error.code)) {
            return true;
        }
        if (error.response?.status) {
            return config.retryableStatuses.includes(error.response.status);
        }
    }

    return false;
}

/**
 * Parses server-sent 'Retry-After' header (in seconds or HTTP Date format)
 */
export function parseRetryAfterHeader(headerValue?: string): number | null {
    if (!headerValue) return null;

    // Check if it's seconds
    const seconds = parseInt(headerValue, 10);
    if (!isNaN(seconds)) {
        return seconds * 1000;
    }

    // Check if it's an HTTP Date string
    const dateMs = Date.parse(headerValue);
    if (!isNaN(dateMs)) {
        const diff = dateMs - Date.now();
        return diff > 0 ? diff : 0;
    }

    return null;
}
