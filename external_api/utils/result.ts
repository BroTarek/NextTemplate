import { getUserFriendlyError, ErrorWithAction } from './getUserFriendlyError';

/**
 * Discriminated Union Result Type (Kyle / Web Dev Simplified Pattern)
 * Provides 10/10 Compile-Time Safety in TypeScript.
 */
export type Ok<T> = {
    readonly success: true;
    readonly data: T;
};

export type Err<E> = {
    readonly success: false;
    readonly error: E;
};

export type Result<T, E = ErrorWithAction> = Ok<T> | Err<E>;

// Helper Constructors
export const ok = <T>(data: T): Ok<T> => ({
    success: true,
    data,
});

export const err = <E>(error: E): Err<E> => ({
    success: false,
    error,
});

/**
 * Wraps any Promise or Async Function into a compile-time safe Result object.
 * Catches all thrown errors and translates them via getUserFriendlyError.
 */
export async function toResult<T>(
    promise: Promise<T>
): Promise<Result<T, ErrorWithAction>> {
    try {
        const data = await promise;
        return ok(data);
    } catch (e) {
        const friendlyError = getUserFriendlyError(e);
        return err(friendlyError);
    }
}

/**
 * Pattern matching helper for Result objects
 */
export function matchResult<T, E, R>(
    result: Result<T, E>,
    matchers: {
        onSuccess: (data: T) => R;
        onError: (error: E) => R;
    }
): R {
    if (result.success) {
        return matchers.onSuccess(result.data);
    } else {
        return matchers.onError(result.error);
    }
}
