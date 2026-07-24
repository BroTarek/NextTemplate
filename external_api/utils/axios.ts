import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { z, ZodError } from 'zod';
import { DetailedValidationError } from '../errors/DetailedValidationError';
import { analyzeNetworkError } from './analyzeNetworkError';
import { analyzeHttpError } from './analyzeHttpError';
import { getSchemaShape } from './validationHelper';
import {
    RetryConfig,
    DEFAULT_RETRY_CONFIG,
    calculateDelay,
    isRetryableError,
    parseRetryAfterHeader,
} from './retry';
import { globalCircuitBreaker } from './circuitBreaker';

declare module 'axios' {
    export interface AxiosRequestConfig {
        schema?: z.ZodSchema;
        zodSchema?: z.ZodSchema;
        skipValidation?: boolean;
        schemaDescription?: Record<string, any>;
        retryConfig?: RetryConfig;
        _retry?: boolean;
        retryCount?: number;
    }
}

const apiClient: AxiosInstance = axios.create({
    baseURL: (import.meta as any).env?.VITE_API_BASE_URL || '/api',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

function createValidationError(
    schema: z.ZodSchema,
    data: unknown,
    endpoint: string,
    schemaDescription?: Record<string, any>
): DetailedValidationError | null {
    try {
        schema.parse(data);
        return null;
    } catch (error) {
        if (error instanceof ZodError) {
            return new DetailedValidationError(
                schemaDescription || getSchemaShape(schema),
                data,
                error
            );
        }
        throw error;
    }
}

// --- Response Interceptor (Success) ---
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        globalCircuitBreaker.recordSuccess();

        const schema = response.config.schema || response.config.zodSchema;
        const schemaDescription = response.config.schemaDescription;

        if (schema && !response.config.skipValidation) {
            const validationError = createValidationError(
                schema,
                response.data,
                response.config.url || 'unknown endpoint',
                schemaDescription
            );

            if (validationError) {
                console.error('[API Validation Error]', validationError.toJSON());
                return Promise.reject(validationError);
            }
        }
        return response;
    },
    // --- Response Interceptor (Error) ---
    async (error: AxiosError) => {
        const config = error.config;

        // 1. Check Circuit Breaker
        if (globalCircuitBreaker.isOpen()) {
            console.warn('[Axios Interceptor] Request blocked by CircuitBreaker');
            return Promise.reject(new Error('Circuit breaker is currently OPEN. Request blocked.'));
        }

        // Handle cancellations cleanly
        if (axios.isCancel(error)) {
            return Promise.reject(analyzeNetworkError(error));
        }

        // Convert error to Domain Error
        const domainError = !error.response
            ? analyzeNetworkError(error)
            : analyzeHttpError(error);

        // 2. Retry Logic Evaluation
        if (config) {
            const mergedConfig: Required<RetryConfig> = {
                ...DEFAULT_RETRY_CONFIG,
                ...config.retryConfig,
            };

            config.retryCount = config.retryCount || 0;

            const canRetry =
                config.retryCount < mergedConfig.maxRetries &&
                isRetryableError(domainError, mergedConfig);

            if (canRetry) {
                config.retryCount++;

                // Respect 'Retry-After' header if present (especially on 429)
                const retryAfterHeader = error.response?.headers?.['retry-after'];
                const serverDelay = parseRetryAfterHeader(retryAfterHeader);
                const delay = serverDelay ?? calculateDelay(config.retryCount, mergedConfig);

                console.warn(
                    `[Axios Retry] Retrying ${config.url} (Attempt ${config.retryCount}/${mergedConfig.maxRetries}) after ${delay}ms`
                );

                await new Promise((resolve) => setTimeout(resolve, delay));
                return apiClient(config);
            }
        }

        // Record failure in Circuit Breaker if non-retryable error
        globalCircuitBreaker.recordFailure();

        return Promise.reject(domainError);
    }
);

export const axiosInstance = apiClient;
export default apiClient;