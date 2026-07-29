**Exactly right!** You've identified the key point: In this example, **TanStack Query fetches the data**, but **TanStack Table does ALL the filtering, sorting, and pagination on the client-side** using its built-in models like `getFilteredRowModel`, `getSortedRowModel`, and `getPaginationRowModel`.

## What's happening here:

```tsx
// 1. TanStack Query fetches ALL 100 users once
const { data = [] } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers, // Returns all 100 users
})

// 2. TanStack Table receives ALL 100 users
const table = useReactTable({
  data, // All 100 users in memory
  state: {
    globalFilter,    // User types "admin"
    columnFilters,   // Filter by role = "admin"
    sorting,         // Sort by name
    pagination,      // Show page 1 of 10
  },
  // 3. TanStack Table does ALL the work client-side
  getFilteredRowModel: getFilteredRowModel(), // Filters 100 -> 20
  getSortedRowModel: getSortedRowModel(),     // Sorts the 20
  getPaginationRowModel: getPaginationRowModel(), // Shows 10 of the 20
})
```

## Visual Flow:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. TanStack Query fetches ALL data                              │
│     ┌──────────────────────────────────────────────────────┐    │
│     │  API → Returns 100 users                             │    │
│     └──────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  2. TanStack Table receives ALL 100 users                       │
│     ┌──────────────────────────────────────────────────────┐    │
│     │  data = [100 users]                                 │    │
│     └──────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  3. Client-side filtering (getFilteredRowModel)                 │
│     ┌──────────────────────────────────────────────────────┐    │
│     │  User searches "admin"                              │    │
│     │  Filtered = 20 users                                │    │
│     └──────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  4. Client-side sorting (getSortedRowModel)                     │
│     ┌──────────────────────────────────────────────────────┐    │
│     │  Sort by name A→Z                                   │    │
│     │  Sorted = 20 users                                 │    │
│     └──────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  5. Client-side pagination (getPaginationRowModel)              │
│     ┌──────────────────────────────────────────────────────┐    │
│     │  Show 10 per page                                   │    │
│     │  Page 1 = first 10 users                            │    │
│     └──────────────────────────────────────────────────────┘    │
│                           ↓                                     │
│  6. Render 10 users on screen                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## So the responsibilities are:

| Part | Responsibility |
|------|---------------|
| **TanStack Query** | Fetches data from API, caches it, handles loading/error states |
| **TanStack Table** | Filters, sorts, and paginates the data **on the client** |
| **useState** | Manages the filter/sort/pagination state |

## Why this combination is powerful:

### Benefits:
```tsx
✅ Simple - No complex server-side logic needed
✅ Fast - Filtering/sorting happens instantly (no API calls)
✅ Cached - TanStack Query caches the data
✅ Offline-friendly - Data stays available after fetch
```

### Drawbacks:
```tsx
❌ Can't handle millions of rows (all data must fit in memory)
❌ Initial load fetches ALL data (even if user only sees 10)
❌ Network payload is large for big datasets
```

## When to use this pattern:

```tsx
// ✅ Good for:
- < 10,000 rows
- Fast filtering/sorting required
- Simple CRUD applications
- Admin dashboards with moderate data

// ❌ Not good for:
- Millions of rows
- Slow network connections
- Mobile devices with limited memory
- Real-time data that changes frequently
```

## If you wanted Server-Side Filtering (different approach):

```tsx
// In this case, TanStack Table does NOT filter/sort
// Instead, TanStack Query refetches with new parameters

const [search, setSearch] = useState('')
const [sorting, setSorting] = useState([])
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

// TanStack Query refetches when state changes
const { data } = useQuery({
  queryKey: ['users', { search, sorting, pagination }],
  queryFn: () => fetchUsers({ search, sorting, pagination }),
})

const table = useReactTable({
  data,
  // NOT using client-side models
  manualFiltering: true,
  manualSorting: true,
  manualPagination: true,
})
```

## Summary:

You're absolutely correct! In the example:

1. **TanStack Query** = Data fetching + Caching
2. **TanStack Table** = Client-side filtering, sorting, pagination
3. **useState** = Controls the filter/sort/pagination state

This is the **perfect middle ground** - you get caching from TanStack Query and fast client-side transformations from TanStack Table, all with simple local state!

so in both cases we use useState to manage the (filtering , sorting , pagination) state , weather we are performing transformations (filtering, sorting , pagination) on client or server 


if we perform the transformations on client we import getFilteredRowModel , getSortedRowModel , getPaginatedRowModel , else , if we are performing our transformations on Server , we set manualFiltering and the rest to true


I see you're trying to create a **custom abstraction** around TanStack Table! Let me help you build a clean, reusable utility pattern.

## Complete Implementation of Your Pattern:

### 1. **TableUtils.ts - Utility Configuration**

```tsx
// TableUtils.ts
import { useState } from 'react'

export interface TableState {
  globalFilter: string
  sorting: { id: string; desc: boolean }[]
  pagination: { pageIndex: number; pageSize: number }
}

export interface TableUtilsReturn {
  // State
  state: TableState
  // Setters
  onGlobalFilterChange: (value: string) => void
  onSortingChange: (sorting: { id: string; desc: boolean }[]) => void
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void
  // Client-side flags
  manualFiltering: boolean
  manualSorting: boolean
  manualPagination: boolean
  // Page count for server-side
  pageCount?: number
}

export function useTableUtils(
  mode: 'client' | 'server' = 'client',
  totalPages?: number
): TableUtilsReturn {
  // Local state management
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [pagination, setPagination] = useState({ 
    pageIndex: 0, 
    pageSize: 10 
  })

  const baseUtils = {
    state: {
      globalFilter,
      sorting,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  }

  // Client-side: Use TanStack Table's built-in models
  if (mode === 'client') {
    return {
      ...baseUtils,
      manualFiltering: false,
      manualSorting: false,
      manualPagination: false,
      // Don't need pageCount for client-side
    }
  }

  // Server-side: Tell TanStack Table we'll handle it
  return {
    ...baseUtils,
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
    pageCount: totalPages ?? -1,
  }
}
```

### 2. **Table Component (Generic)**

```tsx
// Table.tsx
import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table'
import { useTableUtils, TableUtilsReturn } from './TableUtils'

interface TableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData, any>[]
  mode?: 'client' | 'server'
  totalPages?: number
  className?: string
}

export function Table<TData>({
  data,
  columns,
  mode = 'client',
  totalPages,
  className = '',
}: TableProps<TData>) {
  // Get table utilities
  const tableUtils = useTableUtils(mode, totalPages)

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    state: tableUtils.state,
    onGlobalFilterChange: tableUtils.onGlobalFilterChange,
    onSortingChange: tableUtils.onSortingChange,
    onPaginationChange: tableUtils.onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    
    // Client-side models (if not manual)
    getFilteredRowModel: mode === 'client' ? getFilteredRowModel() : undefined,
    getSortedRowModel: mode === 'client' ? getSortedRowModel() : undefined,
    getPaginationRowModel: mode === 'client' ? getPaginationRowModel() : undefined,
    
    // Manual flags (for server-side)
    manualFiltering: tableUtils.manualFiltering,
    manualSorting: tableUtils.manualSorting,
    manualPagination: tableUtils.manualPagination,
    pageCount: tableUtils.pageCount,
  })

  return (
    <div className={`w-full ${className}`}>
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={tableUtils.state.globalFilter}
          onChange={(e) => tableUtils.onGlobalFilterChange(e.target.value)}
          placeholder="Search..."
          className="px-4 py-2 border rounded-lg w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' ↑',
                        desc: ' ↓',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            «
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            ‹
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            ›
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            »
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-2 py-1 border rounded text-sm"
          >
            {[10, 25, 50].map(size => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
```

### 3. **Usage Examples**

#### **Client-Side Mode (All data in memory):**

```tsx
// UsersTableClient.tsx
import { Table } from './Table'
import { useQuery } from '@tanstack/react-query'

export function UsersTableClient() {
  // Fetch all data
  const { data = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchAllUsers,
  })

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role' },
  ]

  return (
    <Table
      data={data}
      columns={columns}
      mode="client" // Client-side filtering/sorting/pagination
    />
  )
}
```

#### **Server-Side Mode (With API integration):**

```tsx
// UsersTableServer.tsx
import { Table } from './Table'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

export function UsersTableServer() {
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  // Fetch only current page from server
  const { data } = useQuery({
    queryKey: ['users', { search, sorting, pagination }],
    queryFn: () => fetchUsersFromServer({
      search,
      sorting,
      pagination,
    }),
  })

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role' },
  ]

  // We need to sync state with the Table component
  // (You might want to extract this to a custom hook)
  const [tableState, setTableState] = useState({
    globalFilter: '',
    sorting: [],
    pagination: { pageIndex: 0, pageSize: 10 },
  })

  // When table state changes, update the query
  // This is simplified - in reality you'd use the Table's onStateChange
  useEffect(() => {
    setSearch(tableState.globalFilter)
    setSorting(tableState.sorting)
    setPagination(tableState.pagination)
  }, [tableState])

  return (
    <Table
      data={data?.users ?? []}
      columns={columns}
      mode="server"
      totalPages={data?.totalPages}
    />
  )
}
```

### 4. **Even Better - Enhanced Table with Full Control:**

```tsx
// EnhancedTable.tsx
import React, { useState } from 'react'
import { Table } from './Table'

interface EnhancedTableProps<TData> {
  columns: ColumnDef<TData, any>[]
  fetchData: (params: any) => Promise<{ data: TData[]; total: number }>
  initialPageSize?: number
}

export function EnhancedTable<TData>({
  columns,
  fetchData,
  initialPageSize = 10,
}: EnhancedTableProps<TData>) {
  // Full control over state
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ 
    pageIndex: 0, 
    pageSize: initialPageSize 
  })

  // Fetch data with all filters applied
  const { data, isLoading } = useQuery({
    queryKey: ['table-data', { globalFilter, sorting, pagination }],
    queryFn: () => fetchData({ globalFilter, sorting, pagination }),
    keepPreviousData: true,
  })

  // Custom utilities that connect to your data fetching
  const tableUtils = {
    state: {
      globalFilter,
      sorting,
      pagination,
    },
    onGlobalFilterChange: (value: string) => {
      setGlobalFilter(value)
      setPagination(prev => ({ ...prev, pageIndex: 0 })) // Reset to first page
    },
    onSortingChange: (newSorting: any[]) => {
      setSorting(newSorting)
      setPagination(prev => ({ ...prev, pageIndex: 0 }))
    },
    onPaginationChange: setPagination,
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
    pageCount: data?.totalPages ?? -1,
  }

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    state: tableUtils.state,
    onGlobalFilterChange: tableUtils.onGlobalFilterChange,
    onSortingChange: tableUtils.onSortingChange,
    onPaginationChange: tableUtils.onPaginationChange,
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
    pageCount: data?.totalPages ?? -1,
    getCoreRowModel: getCoreRowModel(),
  })

  // Render table with your custom utils
  // ...
}
```

### 5. **Benefits of This Pattern:**

```tsx
// ✅ Reusable - Use the same Table component everywhere
// ✅ Flexible - Switch between client/server mode with one prop
// ✅ Clean - All table logic abstracted away
// ✅ Type-safe - Full TypeScript support
// ✅ Testable - Utilities are pure functions
// ✅ Extensible - Easy to add more features
```

### 6. **Complete Usage:**

```tsx
// app/page.tsx
export default function HomePage() {
  // Client-side table
  return (
    <div>
      <h1>Client-Side Table</h1>
      <UsersTableClient />
      
      <h1>Server-Side Table</h1>
      <UsersTableServer />
      
      <h1>Enhanced Table</h1>
      <EnhancedTable
        columns={columns}
        fetchData={fetchUsersFromAPI}
      />
    </div>
  )
}
```

This pattern gives you the **best of both worlds** - a reusable table component that can work in either client-side or server-side mode, with clean separation of concerns!

**Excellent question!** You've identified the **interaction handlers** that trigger transformations. Let me show you how they behave differently in client vs server mode:

## Client-Side vs Server-Side: The Handlers

### Client-Side Mode (All transformations in browser)

```tsx
// ALL handlers work with data already in memory
const table = useReactTable({
  data, // All data is in memory
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
})

// These handlers JUST transform the in-memory data
// NO API calls, INSTANT response
const handlers = {
  getToggleSortingHandler: () => {
    // Sorts the data already in memory
    // All 5000 rows are sorted instantly
  },
  onGlobalFilterChange: (value) => {
    // Filters the data already in memory
    // Instantly shows matching rows
  },
  table.setPageIndex: (index) => {
    // Shows different slice of in-memory data
    // No network request
  },
  table.previousPage: () => {
    // Moves to previous page of in-memory data
  },
  table.nextPage: () => {
    // Moves to next page of in-memory data
  },
  table.getCanPreviousPage: () => {
    // Checks if there's previous page in memory
    return table.getState().pagination.pageIndex > 0
  },
  table.getCanNextPage: () => {
    // Checks if there's next page in memory
    return table.getState().pagination.pageIndex < table.getPageCount() - 1
  },
  table.getPageCount: () => {
    // Calculates from in-memory data
    return Math.ceil(data.length / pageSize)
  },
}
```

### Server-Side Mode (Transformations on server)

```tsx
// NOTHING is done in the browser!
const table = useReactTable({
  data, // Only CURRENT PAGE data from server
  manualFiltering: true,
  manualSorting: true,
  manualPagination: true,
  pageCount: totalPagesFromServer,
})

// These handlers TRIGGER NEW API CALLS
const handlers = {
  getToggleSortingHandler: () => {
    // ❌ Does NOT sort data
    // ✅ Updates sorting state → triggers API refetch
    // ✅ New data comes from server pre-sorted
  },
  onGlobalFilterChange: (value) => {
    // ❌ Does NOT filter data
    // ✅ Updates filter state → triggers API refetch
    // ✅ New data comes from server pre-filtered
  },
  table.setPageIndex: (index) => {
    // ❌ Does NOT paginate data
    // ✅ Updates page state → triggers API refetch
    // ✅ New page data comes from server
  },
  table.previousPage: () => {
    // ❌ Doesn't just show previous page
    // ✅ Triggers API call for previous page
  },
  table.nextPage: () => {
    // ❌ Doesn't just show next page
    // ✅ Triggers API call for next page
  },
  table.getCanPreviousPage: () => {
    // ✅ Still works - checks if pageIndex > 0
    // Uses pagination state, not data
    return pagination.pageIndex > 0
  },
  table.getCanNextPage: () => {
    // ✅ Still works - checks if pageIndex < pageCount - 1
    // Uses pageCount from server
    return pagination.pageIndex < totalPagesFromServer - 1
  },
  table.getPageCount: () => {
    // ✅ Uses pageCount provided from server
    // NOT calculated from data.length
    return totalPagesFromServer
  },
}
```

## Complete Comparison Table

| Handler | Client-Side | Server-Side |
|---------|------------|-------------|
| **getToggleSortingHandler()** | Sorts in-memory data instantly | Updates state → API refetch → gets pre-sorted data |
| **onGlobalFilterChange** | Filters in-memory data instantly | Updates state → API refetch → gets pre-filtered data |
| **onColumnFiltersChange** | Filters in-memory data instantly | Updates state → API refetch → gets pre-filtered data |
| **table.setPageIndex()** | Shows different slice of data | Triggers API call for new page |
| **table.previousPage()** | Shows previous slice of data | Triggers API call for previous page |
| **table.nextPage()** | Shows next slice of data | Triggers API call for next page |
| **table.getCanPreviousPage()** | Checks `pageIndex > 0` (same) | Checks `pageIndex > 0` (same) |
| **table.getCanNextPage()** | Checks `pageIndex < pageCount - 1` | Checks `pageIndex < totalPagesFromServer - 1` |
| **table.getPageCount()** | Calculates from `data.length` | Uses `pageCount` from server |
| **table.setPageSize()** | Changes slice size instantly | Triggers API call with new page size |

## Code Example: Server-Side Implementation

```tsx
export default function ServerSideTable() {
  // 1. Local state (same as client)
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [pagination, setPagination] = useState({ 
    pageIndex: 0, 
    pageSize: 10 
  })
  
  // 2. React Query - refetches when state changes
  const { data, isFetching } = useQuery({
    queryKey: ['users', { globalFilter, sorting, pagination }],
    queryFn: () => fetchUsers({
      search: globalFilter,
      sortBy: sorting[0]?.id,
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
      page: pagination.pageIndex,
      limit: pagination.pageSize,
    }),
    keepPreviousData: true,
  })
  
  // 3. Table - all manual
  const table = useReactTable({
    data: data?.users ?? [],
    state: {
      globalFilter,
      sorting,
      pagination,
    },
    // State setters - these trigger API calls
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value)
      setPagination(prev => ({ ...prev, pageIndex: 0 })) // Reset to first page
    },
    onSortingChange: (newSorting) => {
      setSorting(newSorting)
      setPagination(prev => ({ ...prev, pageIndex: 0 })) // Reset to first page
    },
    onPaginationChange: (newPagination) => {
      setPagination(newPagination)
      // This triggers API call for new page
    },
    
    // Manual flags
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
    pageCount: data?.totalPages ?? -1,
    
    getCoreRowModel: getCoreRowModel(),
  })
  
  // 4. Handlers work slightly differently
  const handleSort = (column: Column) => {
    // This triggers getToggleSortingHandler internally
    // But instead of sorting data, it:
    // 1. Updates sorting state
    // 2. Triggers API refetch
    // 3. Returns pre-sorted data from server
    column.getToggleSortingHandler()?.()
  }
  
  const handlePageChange = (newPage: number) => {
    // Instead of just showing different slice:
    // 1. Updates pagination state
    // 2. Triggers API call for new page
    // 3. Shows data from server
    table.setPageIndex(newPage)
  }
  
  return (
    <div>
      {/* Search - triggers API call */}
      <input
        value={globalFilter}
        onChange={(e) => {
          setGlobalFilter(e.target.value)
          // This triggers useQuery to refetch with new filter
        }}
        placeholder="Search..."
      />
      
      {isFetching && <span>Loading...</span>}
      
      {/* Table headers - sorting triggers API call */}
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()} // Triggers API call!
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === 'asc' && ' ↑'}
                  {header.column.getIsSorted() === 'desc' && ' ↓'}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination - triggers API call */}
      <div className="pagination">
        <button
          onClick={() => table.previousPage()} // Triggers API call
          disabled={!table.getCanPreviousPage()} // Works the same
        >
          Previous
        </button>
        
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        
        <button
          onClick={() => table.nextPage()} // Triggers API call
          disabled={!table.getCanNextPage()} // Works the same
        >
          Next
        </button>
      </div>
    </div>
  )
}
```

## Visual Flow Comparison

### Client-Side Flow:
```
User clicks sort header
    ↓
getToggleSortingHandler()
    ↓
Sorts data in memory (instant)
    ↓
Re-renders with sorted data (no network)
```

### Server-Side Flow:
```
User clicks sort header
    ↓
getToggleSortingHandler()
    ↓
Updates sorting state
    ↓
useQuery sees state change
    ↓
Calls API with sort parameters
    ↓
⏳ Wait for response
    ↓
Receives pre-sorted data
    ↓
Re-renders with new data
```

## Summary

| Aspect | Client-Side | Server-Side |
|--------|------------|-------------|
| **Handlers called** | Same functions | Same functions |
| **What they do** | Transform data in memory | Trigger API calls |
| **Speed** | Instant | Network latency |
| **Data size** | All data in memory | Only current page |
| **Network requests** | One initial fetch | One per interaction |

**The handlers don't change!** The difference is:
- **Client**: Handlers transform the data you already have
- **Server**: Handlers trigger new data fetches with transformed parameters

The beauty of TanStack Table is that the **API stays the same** - you use the same handlers regardless of mode! 🎯

