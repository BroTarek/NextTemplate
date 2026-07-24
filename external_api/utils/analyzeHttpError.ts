import { AxiosError } from 'axios';
import { HttpError, HttpErrorType } from '../errors/HttpError';

interface ServerErrorResponse {
    message?: string;
    error?: string;
    errors?: Record<string, string[]> | string[];
    [key: string]: any;
}

export function analyzeHttpError(error: AxiosError): HttpError {
    const status = error.response?.status || 0;
    const url = error.config?.url || 'unknown URL';
    const data = error.response?.data as ServerErrorResponse | undefined;

    // Extract meaningful error message from server response
    let message = data?.message || data?.error || error.message || 'An HTTP error occurred';

    // Handle validation errors specially (422)
    if (status === 422 && data?.errors) {
        const validationMessages = Array.isArray(data.errors)
            ? data.errors.join(', ')
            : Object.entries(data.errors)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                .join('; ');
        message = `Validation failed: ${validationMessages}`;
    }

    switch (status) {
        case 400:
            return new HttpError(
                HttpErrorType.BAD_REQUEST,
                status,
                message || 'Bad request. Please check your input.',
                data,
                url
            );

        case 401:
            return new HttpError(
                HttpErrorType.UNAUTHORIZED,
                status,
                message || 'You need to be logged in to access this resource.',
                data,
                url
            );

        case 403:
            return new HttpError(
                HttpErrorType.FORBIDDEN,
                status,
                message || 'You do not have permission to access this resource.',
                data,
                url
            );

        case 404:
            return new HttpError(
                HttpErrorType.NOT_FOUND,
                status,
                message || 'The requested resource was not found.',
                data,
                url
            );

        case 405:
            return new HttpError(
                HttpErrorType.METHOD_NOT_ALLOWED,
                status,
                message || 'This HTTP method is not allowed for this endpoint.',
                data,
                url
            );

        case 409:
            return new HttpError(
                HttpErrorType.CONFLICT,
                status,
                message || 'There was a conflict with the current state of the resource.',
                data,
                url
            );

        case 422:
            return new HttpError(
                HttpErrorType.UNPROCESSABLE_ENTITY,
                status,
                message || 'The request data is invalid.',
                data,
                url
            );

        case 429:
            return new HttpError(
                HttpErrorType.TOO_MANY_REQUESTS,
                status,
                message || 'Too many requests. Please slow down and try again later.',
                data,
                url
            );

        case 500:
            return new HttpError(
                HttpErrorType.INTERNAL_SERVER_ERROR,
                status,
                message || 'Something went wrong on our servers. Please try again later.',
                data,
                url
            );

        case 502:
            return new HttpError(
                HttpErrorType.BAD_GATEWAY,
                status,
                message || 'The server received an invalid response from an upstream service.',
                data,
                url
            );

        case 503:
            return new HttpError(
                HttpErrorType.SERVICE_UNAVAILABLE,
                status,
                message || 'The service is temporarily unavailable. Please try again later.',
                data,
                url
            );

        case 504:
            return new HttpError(
                HttpErrorType.GATEWAY_TIMEOUT,
                status,
                message || 'The upstream server timed out.',
                data,
                url
            );

        default:
            return new HttpError(
                HttpErrorType.UNKNOWN_HTTP_ERROR,
                status,
                `HTTP ${status}: ${message}`,
                data,
                url
            );
    }
}