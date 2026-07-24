import { getSafe, postSafe, patchSafe, delSafe } from '../features/requets';
import { Result, matchResult } from './result';
import { z } from 'zod';

const UserSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;

export async function exampleResultPatternUsage() {
    // 1. Safe API call returning Result<User, ErrorWithAction>
    const result: Result<User> = await getSafe('/users/1', UserSchema);

    // 2. Compile-Time Safety Check
    // TypeScript will throw a compile-time error if you attempt to access `result.data` before checking `result.success`
    if (result.success) {
        console.log('User Name:', result.data.name); // 100% Type-Safe User
    } else {
        console.error('Error Title:', result.error.title);
        console.error('User Action:', result.error.action);
    }

    // 3. Alternative: Pattern Matching syntax (inspired by neverthrow / Rust)
    const message = matchResult(result, {
        onSuccess: (user) => `Welcome back, ${user.name}!`,
        onError: (err) => `Failed to load user: ${err.message}`,
    });

    console.log(message);
} 