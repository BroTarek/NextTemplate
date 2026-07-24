export enum NetworkErrorType {
    DNS_LOOKUP_FAILED = 'DNS_LOOKUP_FAILED',
    CONNECTION_REFUSED = 'CONNECTION_REFUSED',
    CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
    NO_INTERNET = 'NO_INTERNET',
    SSL_CERTIFICATE_ERROR = 'SSL_CERTIFICATE_ERROR',
    PROXY_ERROR = 'PROXY_ERROR',
    FIREWALL_BLOCK = 'FIREWALL_BLOCK',
    CORS_ERROR = 'CORS_ERROR',
    UNKNOWN_NETWORK_ERROR = 'UNKNOWN_NETWORK_ERROR',
    ABORTED = 'ABORTED',
    MALFORMED_JSON = 'MALFORMED_JSON',
}

export class NetworkError extends Error {
    override name = 'NetworkError' as const;

    constructor(
        public type: NetworkErrorType,
        message: string,
        public originalError?: any,
        public url?: string,
    ) {
        super(message);
        Object.setPrototypeOf(this, NetworkError.prototype);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NetworkError);
        }
    }
}