'use client'

import React from 'react'
import { Table } from '@tanstack/react-table'

interface TablePaginationProps<TData> {
  table: Table<TData>
}

export function TablePagination<TData>({ table }: TablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageCount = table.getPageCount()
  const canPrevious = table.getCanPreviousPage()
  const canNext = table.getCanNextPage()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700 dark:text-neutral-300">
          Show
        </span>
        <select
          value={pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value))
          }}
          className="px-2 py-1.5 text-sm bg-gray-50 dark:bg-neutral-850 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
        >
          {[10, 20, 30, 40, 50].map((size) => (
            <option key={size} value={size}>
              {size} rows
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500 dark:text-neutral-400">
          per page
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700 dark:text-neutral-300">
          Page <strong className="font-semibold text-gray-900 dark:text-white">{pageIndex + 1}</strong> of{' '}
          <strong className="font-semibold text-gray-900 dark:text-white">{pageCount > 0 ? pageCount : 1}</strong>
        </span>

        <div className="inline-flex items-center -space-x-px rounded-md shadow-xs bg-white dark:bg-neutral-900">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!canPrevious}
            className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-l-md hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="First Page"
          >
            «
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!canPrevious}
            className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            ‹
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!canNext}
            className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            ›
          </button>
          <button
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!canNext}
            className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-r-md hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Last Page"
          >
            »
          </button>
        </div>
      </div>
    </div>
  )
}
