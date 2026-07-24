import { z, ZodError, ZodIssue } from 'zod';

export class DetailedValidationError extends Error {
    override name = 'DetailedValidationError' as const;
    expected: Record<string, any>;
    received: unknown;
    validationErrors?: ZodIssue[];

    constructor(
        expected: Record<string, any>,
        received: unknown,
        zodError?: ZodError
    ) {
        const issues: ZodIssue[] = zodError?.issues || (zodError as any)?.errors || [];
        const message = issues.length > 0
            ? `Schema validation failed: ${issues.map((e: ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
            : 'Schema validation failed';

        super(message);
        Object.setPrototypeOf(this, DetailedValidationError.prototype);
        this.expected = expected;
        this.received = received;
        this.validationErrors = issues;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DetailedValidationError);
        }
    }

    // Compare expected vs actual
    getDifferences() {
        if (!this.received || typeof this.received !== 'object') {
            return { error: 'Received data is not an object' };
        }

        const receivedObj = this.received as Record<string, any>;
        const differences: {
            missing: string[];
            extra: string[];
            mismatched: Array<{ field: string; expected: any; received: any }>;
        } = {
            missing: [],
            extra: [],
            mismatched: []
        };

        // Check expected fields
        for (const key of Object.keys(this.expected)) {
            if (!(key in receivedObj)) {
                differences.missing.push(key);
            } else if (typeof receivedObj[key] !== this.expected[key]?.type) {
                differences.mismatched.push({
                    field: key,
                    expected: this.expected[key],
                    received: receivedObj[key]
                });
            }
        }

        // Check extra fields
        for (const key of Object.keys(receivedObj)) {
            if (!(key in this.expected)) {
                differences.extra.push(key);
            }
        }

        return differences;
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            expected: this.expected,
            received: this.received,
            validationErrors: this.validationErrors,
            differences: this.getDifferences()
        };
    }
}

// Alias for backwards compatibility
export { DetailedValidationError as ValidationError };