'use client'

import React from 'react'
import { HeaderGroup, flexRender } from '@tanstack/react-table'

interface TableHeaderProps<TData> {
  headerGroups: HeaderGroup<TData>[]
}

export function TableHeader<TData>({ headerGroups }: TableHeaderProps<TData>) {
  return (
    <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 transition-colors">
      {headerGroups.map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const isSortable = header.column.getCanSort()
            const sortDirection = header.column.getIsSorted()

            return (
              <th
                key={header.id}
                colSpan={header.colSpan}
                onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                className={`
                  px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider
                  text-gray-500 dark:text-neutral-400 select-none transition-colors
                  ${isSortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800/50 hover:text-gray-900 dark:hover:text-neutral-100' : ''}
                `}
              >
                <div className="flex items-center gap-1.5">
                  <span>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </span>
                  
                  {isSortable && (
                    <span className="inline-flex text-gray-400 dark:text-neutral-500">
                      {sortDirection === 'asc' ? (
                        <svg className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      ) : sortDirection === 'desc' ? (
                        <svg className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </th>
            )
          })}
        </tr>
      ))}
    </thead>
  )
}
