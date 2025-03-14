export interface IMetaData {
    total: number;
    page: number;
    limit: number;
}

export interface IPaginatedQuery {
    cursor_id?: any;
    cursor?: any;
    limit?: number;
    search?: string;
    sort_order?: string;
    sort_by?: string;
}
