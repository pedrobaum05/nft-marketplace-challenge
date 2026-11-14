export type ID = string

/**
 * Valores monetários devem trafegar como strings decimais.
 * Exemplo: "0.12500000" ETH.
 */
export type DecimalString = string

export type ISODateString = string

export interface ApiError {
  code: string
  message: string
  status: number
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type SortDirection = "asc" | "desc"

export interface PaginationParams {
  page: number
  pageSize: number
}