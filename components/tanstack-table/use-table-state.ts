'use client'

import { useState, useTransition } from 'react'
import { SortingState, PaginationState } from '@tanstack/react-table'
import { TableMode, TableState } from './types'

export interface UseTableStateOptions {
  mode?: TableMode
  initialPageSize?: number
  totalPages?: number
}

export function useTableState({
  mode = 'client',
  initialPageSize = 10,
  totalPages = -1,
}: UseTableStateOptions = {}) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  // We can use useTransition to avoid blocking UI during fast filter/search typings if needed
  const [isPending, startTransition] = useTransition()

  const handleGlobalFilterChange = (value: string) => {
    startTransition(() => {
      setGlobalFilter(value)
      // Reset page index on search/filter change
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    })
  }

  const handleSortingChange = (updaterOrValue: SortingState | ((prev: SortingState) => SortingState)) => {
    setSorting((prev) => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue
      // Reset page index on sorting change
      setPagination((current) => ({ ...current, pageIndex: 0 }))
      return next
    })
  }

  const handlePaginationChange = (
    updaterOrValue: PaginationState | ((prev: PaginationState) => PaginationState)
  ) => {
    setPagination((prev) => {
      return typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue
    })
  }

  const tableState: TableState = {
    globalFilter,
    sorting,
    pagination,
  }

  return {
    state: tableState,
    onGlobalFilterChange: handleGlobalFilterChange,
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    
    // Server-side manual flags
    manualFiltering: mode === 'server',
    manualSorting: mode === 'server',
    manualPagination: mode === 'server',
    pageCount: mode === 'server' ? totalPages : undefined,
    isPending,
  }
}
