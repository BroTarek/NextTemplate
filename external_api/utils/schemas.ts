export interface JobField {
    id: number;
    name: string;
    company: string[];
    [key: string]: any;
}

export interface pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
