'use client'

import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'

import { DataTableProps } from './types'
import { useTableState } from './use-table-state'
import { TableHeader } from './table-header'
import { TablePagination } from './table-pagination'

export function DataTable<TData>({
  data,
  columns,
  mode = 'client',
  totalPages,
  className = '',
  state: controlledState,
  onStateChange,
  searchPlaceholder = 'Search all columns...',
  showSearch = true,
}: DataTableProps<TData>) {
  // Use local table state hook
  const localTableState = useTableState({
    mode,
    totalPages,
  })

  // Support controlled or uncontrolled state
  const isControlled = !!controlledState && !!onStateChange
  
  const state = isControlled ? controlledState! : localTableState.state
  
  const handleGlobalFilterChange = (value: string) => {
    if (isControlled) {
      onStateChange!({ ...state, globalFilter: value, pagination: { ...state.pagination, pageIndex: 0 } })
    } else {
      localTableState.onGlobalFilterChange(value)
    }
  }

  const handleSortingChange = (updater: any) => {
    if (isControlled) {
      const nextSorting = typeof updater === 'function' ? updater(state.sorting) : updater
      onStateChange!({ ...state, sorting: nextSorting, pagination: { ...state.pagination, pageIndex: 0 } })
    } else {
      localTableState.onSortingChange(updater)
    }
  }

  const handlePaginationChange = (updater: any) => {
    if (isControlled) {
      const nextPagination = typeof updater === 'function' ? updater(state.pagination) : updater
      onStateChange!({ ...state, pagination: nextPagination })
    } else {
      localTableState.onPaginationChange(updater)
    }
  }

  // Initialize React Table
  const table = useReactTable({
    data,
    columns,
    state,
    onGlobalFilterChange: handleGlobalFilterChange,
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    
    // Client-side models (only if mode is 'client')
    getFilteredRowModel: mode === 'client' ? getFilteredRowModel() : undefined,
    getSortedRowModel: mode === 'client' ? getSortedRowModel() : undefined,
    getPaginationRowModel: mode === 'client' ? getPaginationRowModel() : undefined,
    
    // Server-side manual transformation flags
    manualFiltering: mode === 'server',
    manualSorting: mode === 'server',
    manualPagination: mode === 'server',
    pageCount: mode === 'server' ? totalPages : undefined,
  })

  return (
    <div className={`w-full flex flex-col gap-4 ${className}`}>
      {/* Search Bar / Top Controls */}
      {showSearch && (
        <div className="flex items-center justify-between gap-4 px-1">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={state.globalFilter ?? ''}
              onChange={(e) => handleGlobalFilterChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <TableHeader headerGroups={table.getHeaderGroups()} />
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-800 text-gray-900 dark:text-neutral-100 transition-colors">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4.5 text-sm font-medium whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-neutral-400">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <TablePagination table={table} />
      </div>
    </div>
  )
}
