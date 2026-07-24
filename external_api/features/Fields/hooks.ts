import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    fetchFields,
    fetchFieldById,
    createField,
    updateField,
    deleteField,
} from './api';
import { fieldKeys } from "./keys";
import { safeArray, safeString, safeNumber, safeObject } from "../../utils/utilities";
import { DetailedValidationError } from '../../errors/DetailedValidationError';
import { NetworkError, NetworkErrorType } from '../../errors/NetworkError';

export type Field = {
    id: number;
    name: string;
    company: string[];
};

function normaliseField(raw: unknown): Field {
    const obj = safeObject<Record<string, unknown>>(raw);
    return {
        id: safeNumber(obj.id),
        name: safeString(obj.name),
        company: safeArray<string>(obj.company),
    };
}

// 1. Hook for fetching all Topics (Fields)
export const useFields = (filters = {}) => {
    return useQuery({
        queryKey: fieldKeys.list(filters),
        select: normaliseField,
        queryFn: ({ signal }: { signal?: AbortSignal }) => fetchFields(filters, signal),
        retry: (failureCount, error) => {
            if (axios.isCancel(error) || (error instanceof NetworkError && error.type === NetworkErrorType.ABORTED)) {
                return false; // Don't retry cancelled requests
            }
            if (error instanceof DetailedValidationError) {
                return false; // Don't retry validation errors
            }
            return failureCount < 3;
        },
    });
};

// 2. Hook for fetching a single Topic
export const useField = (id: string) => {
    return useQuery({
        queryKey: fieldKeys.detail(id),
        queryFn: ({ signal }: { signal?: AbortSignal }) => fetchFieldById(id, signal),
        select: normaliseField,
        enabled: !!id,
    });
};

// 4. Hook for creating a Field
export const useCreateField = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createField,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: fieldKeys.lists() });
        },
    });
};

// 5. Hook for updating a Field
export const useUpdateField = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...updates }: { id: string } & Partial<any>) => updateField(id, updates),
        onSuccess: (_data: unknown, variables: { id: string }) => {
            queryClient.invalidateQueries({ queryKey: fieldKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: fieldKeys.lists() });
        },
    });
};

// 6. Hook for deleting a Field
export const useDeleteField = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteField,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: fieldKeys.lists() });
        },
    });
};
