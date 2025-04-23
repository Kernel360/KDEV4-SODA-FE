export interface Log {
  id: string;
  entityName: string;
  entityId: number | null;
  action: string;
  operator: string;
  timestamp: string;
  beforeData: any | null;
  afterData: any | null;
  diff: any | null;
}

export interface LogResponse {
  content: Log[];
  totalPages: number;
  totalElements: number;
}

export interface LogQueryParams {
  entityName?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string[];
  keyword?: string;
} 