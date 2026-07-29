import { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table'

export type TableMode = 'client' | 'server'

export interface TableState {
  globalFilter: string
  sorting: SortingState
  pagination: PaginationState
}

export interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData, any>[]
  mode?: TableMode
  totalPages?: number
  className?: string
  
  // Optional controlled states for server-side
  state?: Partial<TableState>
  onStateChange?: (state: TableState) => void
  
  // Placeholder text for search
  searchPlaceholder?: string
  showSearch?: boolean
}
