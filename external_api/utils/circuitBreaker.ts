export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
    private failures: number = 0;
    private lastFailureTime: number = 0;
    private state: CircuitBreakerState = 'CLOSED';
    private readonly threshold: number;
    private readonly timeout: number; // Duration to remain OPEN in ms

    constructor(threshold: number = 5, timeout: number = 60000) {
        this.threshold = threshold;
        this.timeout = timeout;
    }

    isOpen(): boolean {
        if (this.state === 'CLOSED') {
            return false;
        }

        if (this.state === 'OPEN') {
            // Transition to HALF_OPEN if reset timeout has elapsed
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'HALF_OPEN';
                console.warn('[CircuitBreaker] State: HALF_OPEN - Allowing trial request');
                return false;
            }
            return true;
        }

        // HALF_OPEN allows a trial request
        return false;
    }

    recordSuccess(): void {
        if (this.state === 'HALF_OPEN') {
            console.log('[CircuitBreaker] Trial request succeeded! State: CLOSED');
            this.state = 'CLOSED';
            this.failures = 0;
        } else if (this.state === 'CLOSED') {
            this.failures = 0;
        }
    }

    recordFailure(): void {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.threshold) {
            this.state = 'OPEN';
            console.error(`[CircuitBreaker] Tripped OPEN! (${this.failures} consecutive failures)`);
        }
    }

    reset(): void {
        this.failures = 0;
        this.state = 'CLOSED';
        console.log('[CircuitBreaker] Reset to CLOSED');
    }

    getState(): CircuitBreakerState {
        return this.state;
    }
}

export const globalCircuitBreaker = new CircuitBreaker(5, 60000);
