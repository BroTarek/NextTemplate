import axios, { AxiosError } from 'axios';
import { NetworkError, NetworkErrorType } from '../errors/NetworkError';

export function analyzeNetworkError(error: AxiosError): NetworkError {
    const url = error.config?.url || 'unknown URL';

    // 1. Check for request abort
    if (error.code === 'ERR_CANCELED' || axios.isCancel(error)) {
        return new NetworkError(
            NetworkErrorType.ABORTED,
            'Request was cancelled',
            error,
            url
        );
    }

    // 2. Check if it's a response error (backend reached but returned error)
    if (error.response) {
        return new NetworkError(
            NetworkErrorType.UNKNOWN_NETWORK_ERROR,
            `HTTP ${error.response.status}: ${error.message}`,
            error,
            url
        );
    }

    // 3. No response - network-level error
    if (error.request) {
        const code = error.code;
        const message = error.message?.toLowerCase() || '';

        // DNS lookup failure
        if (code === 'ENOTFOUND' || message.includes('getaddrinfo') || message.includes('dns')) {
            return new NetworkError(
                NetworkErrorType.DNS_LOOKUP_FAILED,
                `DNS lookup failed for ${getHostname(url)}. Please check the domain name.`,
                error,
                url
            );
        }

        // Connection refused
        if (code === 'ECONNREFUSED' || message.includes('connection refused')) {
            return new NetworkError(
                NetworkErrorType.CONNECTION_REFUSED,
                `Server at ${getHostname(url)} refused the connection. The server might be down or unreachable.`,
                error,
                url
            );
        }

        // Connection timeout
        if (code === 'ETIMEDOUT' || code === 'ECONNABORTED' || message.includes('timeout')) {
            return new NetworkError(
                NetworkErrorType.CONNECTION_TIMEOUT,
                `Connection to ${getHostname(url)} timed out. The server is taking too long to respond.`,
                error,
                url
            );
        }

        // No internet connection
        if (code === 'ENETUNREACH' || code === 'EHOSTUNREACH' || message.includes('network unreachable')) {
            return new NetworkError(
                NetworkErrorType.NO_INTERNET,
                'No internet connection. Please check your network settings.',
                error,
                url
            );
        }

        // SSL/TLS certificate errors
        if (
            code === 'ERR_BAD_SSL' ||
            code === 'ERR_SSL_PROTOCOL_ERROR' ||
            message.includes('certificate') ||
            message.includes('ssl') ||
            message.includes('tls')
        ) {
            return new NetworkError(
                NetworkErrorType.SSL_CERTIFICATE_ERROR,
                `SSL certificate error when connecting to ${getHostname(url)}. The certificate might be expired or invalid.`,
                error,
                url
            );
        }

        // Proxy errors
        if (code === 'ERR_PROXY_CONNECTION_FAILED' || message.includes('proxy')) {
            return new NetworkError(
                NetworkErrorType.PROXY_ERROR,
                'Proxy connection failed. Please check your proxy settings.',
                error,
                url
            );
        }

        // CORS errors
        if (
            (code === 'ERR_NETWORK' && (message.includes('cors') || message.includes('blocked by cors'))) ||
            (error.response === null && error.request?.status === 0)
        ) {
            return new NetworkError(
                NetworkErrorType.CORS_ERROR,
                `CORS policy blocked request to ${url}. Please check the server's CORS configuration.`,
                error,
                url
            );
        }

        // Firewall blocking
        if (code === 'ERR_NETWORK' || message.includes('network error')) {
            return new NetworkError(
                NetworkErrorType.FIREWALL_BLOCK,
                `Network request to ${getHostname(url)} was blocked. This could be due to firewall or security policies.`,
                error,
                url
            );
        }
    }

    // 4. Malformed JSON
    if (error.message?.includes('Unexpected token') || error.message?.includes('JSON')) {
        return new NetworkError(
            NetworkErrorType.MALFORMED_JSON,
            'Server returned malformed JSON response.',
            error,
            url
        );
    }

    // 5. Unknown network error
    return new NetworkError(
        NetworkErrorType.UNKNOWN_NETWORK_ERROR,
        `Network error: ${error.message || 'Unknown error'}`,
        error,
        url
    );
}

function getHostname(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}