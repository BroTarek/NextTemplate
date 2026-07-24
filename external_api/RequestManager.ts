export class RequestManager {
    private controllers: Map<string, AbortController> = new Map();

    // Generate a unique key for the request
    private getRequestKey(url: string, params?: any): string {
        return `${url}-${JSON.stringify(params || {})}`;
    }

    // Cancel any existing request with the same key
    cancelExisting(key: string) {
        const existingController = this.controllers.get(key);
        if (existingController) {
            existingController.abort();
            this.controllers.delete(key);
            console.log(`Cancelled existing request for ${key}`);
        }
    }

    // Get a new controller for a request
    getController(url: string, params?: any): AbortController {
        const key = this.getRequestKey(url, params);
        this.cancelExisting(key);
        const controller = new AbortController();
        this.controllers.set(key, controller);
        return controller;
    }

    // Clean up after request completes
    removeController(url: string, params?: any) {
        const key = this.getRequestKey(url, params);
        this.controllers.delete(key);
    }

    // Cancel all pending requests
    cancelAll() {
        for (const [key, controller] of this.controllers) {
            controller.abort();
            console.log(`Cancelled request: ${key}`);
        }
        this.controllers.clear();
    }
}

export const globalRequestManager = new RequestManager();
