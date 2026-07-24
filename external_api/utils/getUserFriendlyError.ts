import axios from 'axios';
import type { ZodIssue } from 'zod';
import { NetworkError, NetworkErrorType } from '../errors/NetworkError';
import { HttpError, HttpErrorType } from '../errors/HttpError';
import { DetailedValidationError } from '../errors/DetailedValidationError';

export interface ErrorWithAction {
    title: string;
    message: string;
    action?: string;
    actionType?: 'retry' | 'check_network' | 'check_url' | 'contact_support' | 'refresh' | 'check_input' | 'login';
    technicalDetails?: string;
    status?: number;
}

export function getUserFriendlyError(error: unknown): ErrorWithAction {
    // HTTP Errors
    if (error instanceof HttpError) {
        switch (error.type) {
            case HttpErrorType.BAD_REQUEST:
                return {
                    title: 'Invalid Request',
                    message: error.message || 'The request data is invalid.',
                    action: 'Please check your input and try again.',
                    actionType: 'check_input',
                    technicalDetails: error.data ? JSON.stringify(error.data) : undefined,
                    status: error.status,
                };

            case HttpErrorType.UNAUTHORIZED:
                return {
                    title: 'Session Expired',
                    message: error.message || 'Your session has expired. Please log in again.',
                    action: 'Please log in to continue.',
                    actionType: 'login',
                    technicalDetails: error.data ? JSON.stringify(error.data) : undefined,
                    status: error.status,
                };

            case HttpErrorType.FORBIDDEN:
                return {
                    title: 'Access Denied',
                    message: error.message || "You don't have permission to access this resource.",
                    action: 'Contact your administrator if you believe this is an error.',
                    actionType: 'contact_support',
                    technicalDetails: error.data ? JSON.stringify(error.data) : undefined,
                    status: error.status,
                };

            case HttpErrorType.NOT_FOUND:
                return {
                    title: 'Not Found',
                    message: error.message || 'The requested resource could not be found.',
                    action: 'Please check the URL or try a different search.',
                    actionType: 'refresh',
                    technicalDetails: error.data ? JSON.stringify(error.data) : undefined,
                    status: error.status,
                };

            case HttpErrorType.CONFLICT:
                return {
                    title: 'Conflict',
                    message: error.message || 'There was a conflict with the current state.',
                    action: 'Refresh the page and try again.',
                    actionType: 'refresh',
                    technicalDetails: error.data ? JSON.stringify(error.data) : undefined,
                    status: error.status,
                };

            case HttpErrorType.UNPROCESSABLE_ENTITY:
                return {
                    title: 'Validation Error',
                    message: error.message || 'Please correct the highlighted fields.',
                    action: 'Check your input and try again.',
                    actionType: 'check_input',
                    technicalDetails: error.data ? JSON.stringify(error.data) : undefined,
                    status: error.status,
                };

            case HttpErrorType.TOO_MANY_REQUESTS:
                return {
                    title: 'Rate Limit Exceeded',
                    message: error.message || 'You are sending too many requests. Please wait.',
                    action: 'Wait a few seconds before trying again.',
                    actionType: 'retry',
                    technicalDetails: error.data ? JSON.stringify(error.data) : undefined,
                    status: error.status,
                };

            case HttpErrorType.INTERNAL_SERVER_ERROR:
                return {
                    title: 'Server Error',
                    message: error.message || 'Something went wrong on our servers.',
                    action: 'Please try again later. If the problem persists, contact support.',
                    actionType: 'contact_support',
                    technicalDetails: error.data ? JSON.stringify(error.data) : undefined,
                    status: error.status,
                };

            case HttpErrorType.SERVICE_UNAVAILABLE:
                return {
                    title: 'Service Unavailable',
                    message: error.message || 'The service is temporarily unavailable.',
                    action: 'Please try again in a few minutes.',
                    actionType: 'retry',
                    technicalDetails: error.data ? JSON.stringify(error.data) : undefined,
                    status: error.status,
                };

            case HttpErrorType.GATEWAY_TIMEOUT:
                return {
                    title: 'Gateway Timeout',
                    message: error.message || 'The upstream server is not responding.',
                    action: 'Please try again later.',
                    actionType: 'retry',
                    technicalDetails: error.data ? JSON.stringify(error.data) : undefined,
                    status: error.status,
                };

            default:
                return {
                    title: `HTTP Error ${error.status}`,
                    message: error.message || 'An HTTP error occurred.',
                    action: 'Please try again or contact support.',
                    actionType: 'retry',
                    technicalDetails: error.data ? JSON.stringify(error.data) : undefined,
                    status: error.status,
                };
        }
    }

    // Network errors
    if (error instanceof NetworkError) {
        switch (error.type) {
            case NetworkErrorType.DNS_LOOKUP_FAILED:
                return {
                    title: 'Website Not Found',
                    message: "The server address couldn't be resolved. Please check if the domain exists.",
                    action: 'Contact support if the issue persists.',
                    actionType: 'contact_support',
                    technicalDetails: error.message,
                };

            case NetworkErrorType.CONNECTION_REFUSED:
                return {
                    title: 'Server Unavailable',
                    message: 'Our servers are currently unreachable. This might be due to maintenance or heavy load.',
                    action: 'Try again in a few minutes.',
                    actionType: 'retry',
                    technicalDetails: error.message,
                };

            case NetworkErrorType.CONNECTION_TIMEOUT:
                return {
                    title: 'Slow Response',
                    message: 'The server is taking too long to respond. Your internet might be slow or the server is overloaded.',
                    action: 'Check your internet connection or try again later.',
                    actionType: 'check_network',
                    technicalDetails: error.message,
                };

            case NetworkErrorType.NO_INTERNET:
                return {
                    title: 'No Internet Connection',
                    message: 'Please check your internet connection and try again.',
                    action: 'Check network settings',
                    actionType: 'check_network',
                    technicalDetails: error.message,
                };

            case NetworkErrorType.SSL_CERTIFICATE_ERROR:
                return {
                    title: 'Security Certificate Error',
                    message: 'The server has a security certificate issue. This could be a security risk.',
                    action: 'Contact support if this is a trusted service.',
                    actionType: 'contact_support',
                    technicalDetails: error.message,
                };

            case NetworkErrorType.PROXY_ERROR:
                return {
                    title: 'Proxy Connection Failed',
                    message: 'Unable to connect through your proxy server. Please check your proxy settings.',
                    action: 'Check proxy configuration',
                    actionType: 'check_network',
                    technicalDetails: error.message,
                };

            case NetworkErrorType.FIREWALL_BLOCK:
                return {
                    title: 'Connection Blocked',
                    message: 'Your network or firewall is blocking the connection to our servers.',
                    action: 'Check firewall settings or try a different network.',
                    actionType: 'check_network',
                    technicalDetails: error.message,
                };

            case NetworkErrorType.CORS_ERROR:
                return {
                    title: 'Cross-Origin Request Blocked',
                    message: 'The server has misconfigured cross-origin settings. This is usually a server-side issue.',
                    action: 'Contact support with the technical details.',
                    actionType: 'contact_support',
                    technicalDetails: error.message,
                };

            case NetworkErrorType.MALFORMED_JSON:
                return {
                    title: 'Data Format Error',
                    message: 'The server returned data in an unexpected format.',
                    action: 'Contact support with the technical details.',
                    actionType: 'contact_support',
                    technicalDetails: error.message,
                };

            case NetworkErrorType.ABORTED:
                return {
                    title: 'Request Cancelled',
                    message: 'The request was cancelled before completing.',
                    action: 'Try again.',
                    actionType: 'retry',
                    technicalDetails: error.message,
                };

            default:
                return {
                    title: 'Network Error',
                    message: 'An unexpected network error occurred. Please try again.',
                    action: 'Try again or check your internet connection.',
                    actionType: 'retry',
                    technicalDetails: error.message,
                };
        }
    }

    // Schema Validation errors
    if (error instanceof DetailedValidationError) {
        const details = error.validationErrors
            ? error.validationErrors.map((e: ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ')
            : error.message;

        return {
            title: 'Data Validation Error',
            message: 'The server sent data in an unexpected format. Please refresh the page.',
            action: 'Refresh the page or contact support.',
            actionType: 'refresh',
            technicalDetails: details,
        };
    }

    // Fallback Axios Errors
    if (axios.isAxiosError(error) && error.response) {
        return {
            title: `HTTP ${error.response.status}`,
            message: error.response.data?.message || error.message || 'An HTTP error occurred.',
            action: 'Please try again or contact support.',
            actionType: 'retry',
            technicalDetails: error.response.data ? JSON.stringify(error.response.data) : undefined,
            status: error.response.status,
        };
    }

    // Unknown errors
    return {
        title: 'Unexpected Error',
        message: 'Something went wrong. Please try again later.',
        action: 'Contact support if the issue persists.',
        actionType: 'contact_support',
        technicalDetails: error instanceof Error ? error.message : String(error),
    };
}