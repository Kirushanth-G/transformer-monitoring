# Pagination Implementation Guide

This guide explains how the frontend has been updated to handle paginated responses from the backend.

## Overview

The backend now returns paginated responses using a `PagedResponse<T>` wrapper for both transformers and inspections. The frontend has been updated to handle these responses and provide pagination functionality.

## Backend API Response Structure

The backend returns responses in this format:

```json
{
  "content": [/* array of DTOs */],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 100,
  "totalPages": 10,
  "last": false,
  "first": true,
  "empty": false
}
```

## Frontend Implementation

### 1. New API Functions

#### `src/api/transformerApi.js`
- `getTransformers(page, size)` - Get paginated transformers
- `getAllTransformers()` - Get all transformers (for backwards compatibility)
- `createTransformer(data)`, `updateTransformer(id, data)`, `deleteTransformer(id)` - CRUD operations

#### `src/api/inspectionApi.js`
- `getInspections(page, size)` - Get paginated inspections
- `getAllInspections()` - Get all inspections (for backwards compatibility)
- `createInspection(data)`, `updateInspection(id, data)`, `deleteInspection(id)` - CRUD operations

### 2. Updated Hooks

#### `src/hooks/useTransformers.js`
- **Existing `useTransformers()`** - Uses `getAllTransformers()` for backwards compatibility
- **New `usePaginatedTransformers(initialPage, initialSize)`** - Provides pagination functionality

#### `src/hooks/useInspections.js`
- **Existing `useInspections()`** - Uses `getAllInspections()` for backwards compatibility
- **New `usePaginatedInspections(initialPage, initialSize)`** - Provides pagination functionality

### 3. Pagination Component

#### `src/components/Pagination.jsx`
A reusable pagination component that provides:
- Previous/Next navigation
- Page number navigation
- Page size selector
- Results information display
- Mobile-responsive design

### 4. Example Pages

#### `src/pages/PaginatedTransformersPage.jsx`
Demonstrates how to use the paginated transformers hook.

#### `src/pages/PaginatedInspectionsPage.jsx`
Demonstrates how to use the paginated inspections hook.

## Usage Examples

### Using Paginated Transformers

```jsx
import { usePaginatedTransformers } from '../hooks/useTransformers';
import Pagination from '../components/Pagination';

function MyComponent() {
  const {
    transformers,
    loading,
    error,
    pagination,
    goToPage,
    changePageSize,
    nextPage,
    previousPage,
  } = usePaginatedTransformers(0, 10); // Start at page 0, 10 items per page

  const handlePageChange = (newPage) => {
    goToPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    changePageSize(newSize);
  };

  return (
    <div>
      {/* Your content */}
      {transformers.map(transformer => (
        <div key={transformer.id}>{transformer.transformerId}</div>
      ))}
      
      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
```

### Using Paginated Inspections

```jsx
import { usePaginatedInspections } from '../hooks/useInspections';
import Pagination from '../components/Pagination';

function MyComponent() {
  const {
    inspections,
    loading,
    error,
    isUsingMockData,
    pagination,
    goToPage,
    changePageSize,
  } = usePaginatedInspections(0, 20); // Start at page 0, 20 items per page

  return (
    <div>
      {isUsingMockData && (
        <div className="warning">Using mock data - API not available</div>
      )}
      
      {/* Your content */}
      {inspections.map(inspection => (
        <div key={inspection.id}>{inspection.inspectionId}</div>
      ))}
      
      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={goToPage}
        onPageSizeChange={changePageSize}
      />
    </div>
  );
}
```

## Pagination Hook Return Values

Both `usePaginatedTransformers` and `usePaginatedInspections` return:

```jsx
{
  // Data
  transformers: [],        // Current page items
  loading: false,          // Loading state
  error: null,             // Error message
  isUsingMockData: false,  // (inspections only) Using fallback data

  // Pagination info
  pagination: {
    pageNumber: 0,         // Current page (0-based)
    pageSize: 10,          // Items per page
    totalElements: 100,    // Total items across all pages
    totalPages: 10,        // Total number of pages
    first: true,           // Is this the first page?
    last: false,           // Is this the last page?
    empty: false           // Is this page empty?
  },

  // Navigation functions
  refetch: () => {},       // Refresh current page
  goToPage: (page) => {},  // Go to specific page
  changePageSize: (size) => {}, // Change page size (resets to page 0)
  nextPage: () => {},      // Go to next page
  previousPage: () => {}, // Go to previous page

  // CRUD operations (inspections only)
  deleteInspection: async (id) => {},
  updateInspection: async (id, data) => {}
}
```

## Backwards Compatibility

The existing hooks (`useTransformers` and `useInspections`) continue to work as before, using `getAllTransformers()` and `getAllInspections()` respectively. This ensures existing pages don't break.

## Migration Guide

To migrate existing pages to use pagination:

1. **Replace the hook import:**
   ```jsx
   // Old
   import { useTransformers } from '../hooks/useTransformers';
   
   // New
   import { usePaginatedTransformers } from '../hooks/useTransformers';
   ```

2. **Update the hook usage:**
   ```jsx
   // Old
   const { transformers, loading, error } = useTransformers();
   
   // New
   const { 
     transformers, 
     loading, 
     error, 
     pagination, 
     goToPage, 
     changePageSize 
   } = usePaginatedTransformers(0, 10);
   ```

3. **Add the pagination component:**
   ```jsx
   import Pagination from '../components/Pagination';
   
   // In your JSX
   <Pagination
     pagination={pagination}
     onPageChange={goToPage}
     onPageSizeChange={changePageSize}
   />
   ```

## API Query Parameters

When calling the backend endpoints, the frontend sends these query parameters:

- `page` (integer, optional, default: 0) - Page number (0-based)
- `size` (integer, optional, default: 10) - Number of items per page

Example requests:
- `GET /transformers?page=0&size=10`
- `GET /inspections?page=1&size=20`

## Testing

To test the pagination functionality:

1. Visit `/paginated-transformers` to see the paginated transformers demo
2. Visit `/paginated-inspections` to see the paginated inspections demo
3. These pages show the pagination information and provide navigation controls

Note: If the backend API is not available, the inspections page will show mock data with simulated pagination.
