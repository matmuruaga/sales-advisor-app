// src/lib/pagination.ts
import { SupabaseClient } from '@supabase/supabase-js';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}

export const DEFAULT_PAGE_SIZES = {
  small: 10,
  medium: 25,
  large: 50,
  xlarge: 100
} as const;

export const DEFAULT_ANALYTICS_LIMIT = 50;
export const MAX_ANALYTICS_LIMIT = 500;

/**
 * Execute a paginated query with offset/limit pagination
 */
export async function executeOffsetPaginatedQuery<T>(
  query: any,
  options: PaginationOptions = {}
): Promise<PaginatedResponse<T>> {
  const {
    page = 1,
    limit = DEFAULT_PAGE_SIZES.large,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options;

  // Ensure valid pagination parameters
  const currentPage = Math.max(1, page);
  const pageSize = Math.min(Math.max(1, limit), MAX_ANALYTICS_LIMIT);
  const offset = (currentPage - 1) * pageSize;

  // Add pagination and sorting
  const paginatedQuery = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1);

  // Execute query with count
  const { data, error, count } = await paginatedQuery;

  if (error) throw error;

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data: data || [],
    pagination: {
      currentPage,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    }
  };
}

/**
 * Execute a cursor-based paginated query for real-time data
 */
export async function executeCursorPaginatedQuery<T>(
  query: any,
  options: {
    limit?: number;
    cursor?: string;
    cursorColumn?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<CursorPaginatedResponse<T>> {
  const {
    limit = DEFAULT_PAGE_SIZES.large,
    cursor,
    cursorColumn = 'created_at',
    sortOrder = 'desc'
  } = options;

  const pageSize = Math.min(Math.max(1, limit), MAX_ANALYTICS_LIMIT);

  // Apply cursor filtering if provided
  let paginatedQuery = query;
  if (cursor) {
    const operator = sortOrder === 'desc' ? 'lt' : 'gt';
    paginatedQuery = paginatedQuery[operator](cursorColumn, cursor);
  }

  // Add sorting and limit (+1 to check if there's a next page)
  paginatedQuery = paginatedQuery
    .order(cursorColumn, { ascending: sortOrder === 'asc' })
    .limit(pageSize + 1);

  const { data, error } = await paginatedQuery;

  if (error) throw error;

  const results = data || [];
  const hasNextPage = results.length > pageSize;
  const hasPreviousPage = !!cursor;

  // Remove the extra item used for hasNextPage check
  if (hasNextPage) {
    results.pop();
  }

  // Extract cursors
  const nextCursor = hasNextPage && results.length > 0
    ? results[results.length - 1][cursorColumn]
    : undefined;
  
  const previousCursor = hasPreviousPage ? cursor : undefined;

  return {
    data: results,
    pagination: {
      limit: pageSize,
      hasNextPage,
      hasPreviousPage,
      nextCursor,
      previousCursor
    }
  };
}

/**
 * Create a debounced function for search queries
 */
export function createDebouncer(delay: number = 300) {
  let timeoutId: NodeJS.Timeout;
  
  return function debounce<T extends (...args: any[]) => any>(
    func: T,
    ...args: Parameters<T>
  ): void {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Merge multiple paginated responses for aggregated queries
 */
export function mergePaginatedResponses<T>(
  responses: Array<{ data: T[]; pagination: any }>
): { data: T[]; totalCount: number } {
  const allData = responses.flatMap(response => response.data);
  const totalCount = responses.reduce(
    (sum, response) => sum + (response.pagination.totalCount || response.data.length),
    0
  );

  return {
    data: allData,
    totalCount
  };
}

/**
 * Apply client-side filtering and sorting for complex aggregations
 */
export function applyClientSideFiltering<T>(
  data: T[],
  filters: Record<string, any> = {},
  sortBy?: keyof T,
  sortOrder: 'asc' | 'desc' = 'desc'
): T[] {
  let filtered = [...data];

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      filtered = filtered.filter(item => {
        const itemValue = (item as any)[key];
        if (typeof value === 'string') {
          return itemValue?.toString().toLowerCase().includes(value.toLowerCase());
        }
        return itemValue === value;
      });
    }
  });

  // Apply sorting
  if (sortBy) {
    filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal > bVal ? 1 : -1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  return filtered;
}

/**
 * Cache key generator for query results
 */
export function generateCacheKey(
  tableName: string,
  filters: Record<string, any> = {},
  pagination: PaginationOptions = {}
): string {
  const filterString = Object.entries(filters)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}:${value}`)
    .sort()
    .join('|');
  
  const paginationString = Object.entries(pagination)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}:${value}`)
    .sort()
    .join('|');

  return `${tableName}:${filterString}:${paginationString}`;
}