export interface PaginatedResponse<T> {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  items: T[];
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}