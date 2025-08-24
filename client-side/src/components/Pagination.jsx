import { ChevronLeftIcon, ChevronRightIcon } from './ui/icons';

const Pagination = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  pageSizeOptions = [2, 5, 10, 20, 50],
}) => {
  const { pageNumber, pageSize, totalElements, totalPages, first, last } =
    pagination;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const pages = [];
    const start = Math.max(0, pageNumber - delta);
    const end = Math.min(totalPages - 1, pageNumber + delta);

    // Add first page if not in range
    if (start > 0) {
      pages.push(0);
      if (start > 1) pages.push('...');
    }

    // Add pages in range
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add last page if not in range
    if (end < totalPages - 1) {
      if (end < totalPages - 2) pages.push('...');
      pages.push(totalPages - 1);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if only one page
  }

  return (
    <div className='flex flex-col items-center justify-between gap-2 border-t border-gray-200 bg-white px-3 py-2 sm:flex-row sm:gap-4 sm:px-6 sm:py-3'>
      {/* Results info */}
      <div className='flex flex-1 justify-center text-center sm:hidden'>
        <span className='text-xs text-gray-700 sm:text-sm'>
          Showing {pageNumber * pageSize + 1} to{' '}
          {Math.min((pageNumber + 1) * pageSize, totalElements)} of{' '}
          {totalElements} results
        </span>
      </div>

      <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <p className='text-sm text-gray-700'>
            Showing{' '}
            <span className='font-medium'>{pageNumber * pageSize + 1}</span> to{' '}
            <span className='font-medium'>
              {Math.min((pageNumber + 1) * pageSize, totalElements)}
            </span>{' '}
            of <span className='font-medium'>{totalElements}</span> results
          </p>

          {showPageSizeSelector && (
            <div className='flex items-center gap-2'>
              <label htmlFor='pageSize' className='text-sm text-gray-700'>
                Show:
              </label>
              <select
                id='pageSize'
                value={pageSize}
                onChange={e => onPageSizeChange(Number(e.target.value))}
                className='rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className='flex items-center gap-1'>
          {/* Previous button */}
          <button
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={first}
            className='relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <span className='sr-only'>Previous</span>
            <ChevronLeftIcon className='h-5 w-5' />
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                page === pageNumber
                  ? 'z-10 border-blue-500 bg-blue-50 text-blue-600'
                  : page === '...'
                    ? 'cursor-default border-gray-300 bg-white text-gray-500'
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {typeof page === 'number' ? page + 1 : page}
            </button>
          ))}

          {/* Next button */}
          <button
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={last}
            className='relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <span className='sr-only'>Next</span>
            <ChevronRightIcon className='h-5 w-5' />
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className='flex w-full items-center justify-between sm:hidden'>
        <button
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={first}
          className='relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Previous
        </button>
        <span className='flex items-center text-xs font-medium text-gray-700'>
          Page {pageNumber + 1} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={last}
          className='relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
