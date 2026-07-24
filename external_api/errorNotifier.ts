import { ErrorWithAction } from './utils/getUserFriendlyError';

type Listener = (error: ErrorWithAction | null) => void;

class GlobalErrorNotifier {
    private currentError: ErrorWithAction | null = null;
    private listeners: Set<Listener> = new Set();

    showError(error: ErrorWithAction) {
        // Prevent SSR state leakage
        if (typeof window === 'undefined') return;
        this.currentError = error;
        this.notify();
    }

    clearError() {
        this.currentError = null;
        this.notify();
    }

    getError(): ErrorWithAction | null {
        return this.currentError;
    }

    subscribe(listener: Listener) {
        if (typeof window === 'undefined') {
            return () => {};
        }
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notify() {
        this.listeners.forEach((listener) => listener(this.currentError));
    }
}

export const globalErrorNotifier = new GlobalErrorNotifier();
