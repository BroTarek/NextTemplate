// Helper to create consistent query keys
export const createKeys = (base: string) => ({
    all: [base] as const,
    lists: () => [base, 'list'] as const,
    list: (filters: any) => [base, 'list', { filters }] as const,
    details: () => [base, 'detail'] as const,
    detail: (id: string | number) => [base, 'detail', id] as const,
});