/**
 * Hybrid Architecture Blueprint (RSC + Server Actions + TanStack Query Hydration)
 * Compatible with your existing external_api error-handling and Result structures.
 */

import { revalidateTag } from 'next/cache';
import { Result, ok, err } from '../utils/result';
import { ErrorWithAction } from '../utils/getUserFriendlyError';
import { JobField } from '../schemas';
import { fetchFields, createField } from '../features/Fields/api';

// ============================================================================
// 1. DATA LAYER: Next.js Server-Side Caching (use cache / Fetch Cache)
// ============================================================================
export async function getCachedFields(): Promise<JobField[]> {
    // Next.js caching layer (e.g., calling fetch with revalidate tag)
    // Marks this request with the invalidation tag: 'fields-feed'
    const res = await fetch(`${process.env.VITE_API_BASE_URL || '/api'}/fields`, {
        next: { tags: ['fields-feed'] },
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch fields on server');
    }
    
    const result = await res.json();
    return result.data || result;
}

// ============================================================================
// 2. MUTATION LAYER: Next.js Server Action
// ============================================================================
/**
 * Server Action to create a field.
 * Uses Kyle's compile-time safe Result pattern to report success or errors to the client.
 */
export async function createFieldAction(
    newField: Partial<JobField>
): Promise<Result<JobField, ErrorWithAction>> {
    'use server'; // Marks this function to run exclusively on the server

    try {
        // 1. Call your direct API execution layer to write to .NET backend
        const createdField = await createField(newField);

        // 2. Invalidate Server-side cache tag immediately (purges the server cache)
        revalidateTag('fields-feed');

        // 3. Return a type-safe Ok response
        return ok(createdField);
    } catch (error) {
        // 4. If mutation fails, return a type-safe Err response (without throwing runtime exceptions)
        return err({
            title: 'Server Action Failed',
            message: error instanceof Error ? error.message : 'Could not create field',
            action: 'Please correct your details and try again.',
            actionType: 'check_input',
        });
    }
}

// ============================================================================
// 3. CLIENT COMPONENT INTERFACE (Example Usage)
// ============================================================================
/**
 * How to wire this up inside your Client Feed Component:
 * 
 * ```tsx
 * 'use client';
 * 
 * import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 * import { createFieldAction } from './hybridApproach';
 * 
 * export function FieldsFeedClient({ initialData }) {
 *   const queryClient = useQueryClient();
 * 
 *   // 1. TanStack Query Hydrated with Server Cached Data
 *   const { data: fields } = useQuery({
 *     queryKey: ['fields', 'feed'],
 *     queryFn: () => fetch('/api/fields').then(res => res.json()), // client background fetches
 *     initialData: initialData,
 *     staleTime: 1000 * 60 * 5, // 5 min client staletime
 *   });
 * 
 *   // 2. Mutation utilizing Server Action + Kyle's Result Pattern + Optimistic Updates
 *   const mutation = useMutation({
 *     mutationFn: createFieldAction,
 *     onMutate: async (newField) => {
 *       await queryClient.cancelQueries({ queryKey: ['fields', 'feed'] });
 *       const previous = queryClient.getQueryData(['fields', 'feed']);
 * 
 *       // Optimistic update
 *       queryClient.setQueryData(['fields', 'feed'], (old: any) => [
 *         { id: 'temp-id', ...newField },
 *         ...(old || [])
 *       ]);
 * 
 *       return { previous };
 *     },
 *     onError: (err, newField, context) => {
 *       // Rollback on failure
 *       queryClient.setQueryData(['fields', 'feed'], context?.previous);
 *     },
 *     onSuccess: (result) => {
 *       // Handle the safe Result pattern response
 *       if (result.success) {
 *         // 3. Soft client refresh (re-fetches from purged server cache)
 *         queryClient.invalidateQueries({ queryKey: ['fields', 'feed'] });
 *       } else {
 *         // Handle validation/HTTP errors inline
 *         alert(result.error.message);
 *       }
 *     }
 *   });
 * }
 * ```
 */
