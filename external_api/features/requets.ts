import { JobField } from "../schemas";
import { ZodSchema } from "zod";
import { axiosInstance } from "../utils/axios";
import { RequestManager } from "../RequestManager";
import { toResult, Result } from "../utils/result";
import { ErrorWithAction } from "../utils/getUserFriendlyError";

const requestManager = new RequestManager();

// Generic GET with Zod validation and clean signal separation
export const get = async <T>(
    url: string,
    schema?: ZodSchema<T>,
    params?: any,
    externalSignal?: AbortSignal
): Promise<T> => {
    // If React Query provided a signal, bypass RequestManager to avoid signal/key conflicts
    if (externalSignal) {
        const res = await axiosInstance.get(url, {
            zodSchema: schema,
            params,
            signal: externalSignal,
        });
        return res.data as T;
    }

    // Otherwise use RequestManager for standalone deduplicated calls
    const controller = requestManager.getController(url, params);
    try {
        const res = await axiosInstance.get(url, {
            zodSchema: schema,
            params,
            signal: controller.signal,
        });
        return res.data as T;
    } finally {
        requestManager.removeController(url, params);
    }
};

// Generic POST
export const post = async <T>(
    url: string,
    body: JobField | Partial<JobField>,
    schema?: ZodSchema<T>
): Promise<T> => {
    const res = await axiosInstance.post(url, body, {
        zodSchema: schema,
    });
    return res.data as T;
};

// Generic DELETE
export const del = async <T>(
    url: string,
    schema?: ZodSchema<T>
): Promise<T> => {
    const res = await axiosInstance.delete(url, {
        zodSchema: schema,
    });
    return res.data as T;
};

// Generic PUT
export const put = async <T>(
    url: string,
    body: Partial<JobField>,
    schema?: ZodSchema<T>
): Promise<T> => {
    const res = await axiosInstance.put(url, body, {
        zodSchema: schema,
    });
    return res.data as T;
};

// Generic PATCH
export const patch = async <T>(
    url: string,
    body: Partial<JobField>,
    schema?: ZodSchema<T>
): Promise<T> => {
    const res = await axiosInstance.patch(url, body, {
        zodSchema: schema,
    });
    return res.data.data as T;
};

// --- SAFE RESULT-BASED WRAPPERS (Kyle's Pattern for 10/10 Compile-Time Safety) ---

export const getSafe = <T>(
    url: string,
    schema?: ZodSchema<T>,
    params?: any,
    externalSignal?: AbortSignal
): Promise<Result<T, ErrorWithAction>> =>
    toResult(get<T>(url, schema, params, externalSignal));

export const postSafe = <T>(
    url: string,
    body: JobField | Partial<JobField>,
    schema?: ZodSchema<T>
): Promise<Result<T, ErrorWithAction>> =>
    toResult(post<T>(url, body, schema));

export const putSafe = <T>(
    url: string,
    body: Partial<JobField>,
    schema?: ZodSchema<T>
): Promise<Result<T, ErrorWithAction>> =>
    toResult(put<T>(url, body, schema));

export const patchSafe = <T>(
    url: string,
    body: Partial<JobField>,
    schema?: ZodSchema<T>
): Promise<Result<T, ErrorWithAction>> =>
    toResult(patch<T>(url, body, schema));

export const delSafe = <T>(
    url: string,
    schema?: ZodSchema<T>
): Promise<Result<T, ErrorWithAction>> =>
    toResult(del<T>(url, schema));

export const cancelAllRequests = () => {
    requestManager.cancelAll();
};