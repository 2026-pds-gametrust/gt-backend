export interface IPaginationQuery {
  page: number;
  pageSize: number;
}

export interface IPaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
