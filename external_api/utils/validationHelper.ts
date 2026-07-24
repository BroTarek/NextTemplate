import { z, ZodError } from 'zod';
import { DetailedValidationError } from '../errors/DetailedValidationError';

export function validateWithSchema<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    schemaDescription?: Record<string, any>
): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof ZodError) {
            const expected = schemaDescription || {
                type: 'ZodSchema',
                shape: getSchemaShape(schema),
            };

            throw new DetailedValidationError(expected, data, error);
        }
        throw error;
    }
}

export function getSchemaShape(schema: any): Record<string, any> {
    if (!schema) return { type: 'unknown' };

    if (schema instanceof z.ZodObject || schema?._def?.typeName === 'ZodObject') {
        const shape: Record<string, any> = {};
        const shapeObj = schema.shape || schema._def?.shape?.();
        if (shapeObj) {
            for (const key of Object.keys(shapeObj)) {
                shape[key] = getSchemaShape(shapeObj[key]);
            }
        }
        return shape;
    }

    if (schema instanceof z.ZodArray || schema?._def?.typeName === 'ZodArray') {
        const element = schema.element || schema._def?.type;
        return { type: 'array', items: getSchemaShape(element) };
    }

    if (schema instanceof z.ZodString || schema?._def?.typeName === 'ZodString') return { type: 'string' };
    if (schema instanceof z.ZodNumber || schema?._def?.typeName === 'ZodNumber') return { type: 'number' };
    if (schema instanceof z.ZodBoolean || schema?._def?.typeName === 'ZodBoolean') return { type: 'boolean' };

    if (schema instanceof z.ZodNullable || schema?._def?.typeName === 'ZodNullable') {
        const inner = typeof schema.unwrap === 'function' ? schema.unwrap() : schema._def?.innerType;
        return { type: 'nullable', inner: getSchemaShape(inner) };
    }

    if (schema instanceof z.ZodOptional || schema?._def?.typeName === 'ZodOptional') {
        const inner = typeof schema.unwrap === 'function' ? schema.unwrap() : schema._def?.innerType;
        return { type: 'optional', inner: getSchemaShape(inner) };
    }

    return { type: 'unknown' };
}