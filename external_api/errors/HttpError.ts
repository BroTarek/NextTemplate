export enum HttpErrorType {
    BAD_REQUEST = 'BAD_REQUEST',           // 400
    UNAUTHORIZED = 'UNAUTHORIZED',         // 401
    FORBIDDEN = 'FORBIDDEN',               // 403
    NOT_FOUND = 'NOT_FOUND',               // 404
    METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED', // 405
    CONFLICT = 'CONFLICT',                 // 409
    UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY', // 422
    TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS', // 429
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR', // 500
    BAD_GATEWAY = 'BAD_GATEWAY',           // 502
    SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE', // 503
    GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',   // 504
    UNKNOWN_HTTP_ERROR = 'UNKNOWN_HTTP_ERROR',
}

export class HttpError extends Error {
    override name = 'HttpError' as const;

    constructor(
        public type: HttpErrorType,
        public status: number,
        message: string,
        public data?: any,
        public url?: string,
    ) {
        super(message);
        Object.setPrototypeOf(this, HttpError.prototype);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HttpError);
        }
    }
}