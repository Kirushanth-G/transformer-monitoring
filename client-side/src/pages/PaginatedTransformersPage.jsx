import { usePaginatedTransformers } from '../hooks/useTransformers';
import { useFavorites } from '../hooks/useFavorites';
import { useTransformerFilters } from '../hooks/useTransformerFilters';
import { useNotifications } from '../hooks/useNotifications';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import TransformerView from '../components/TransformerView';
import NotificationManager from '../components/NotificationManager';
import { PlusIcon } from '../components/ui/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PaginatedTransformersPage() {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(10);

  // Use the paginated hook
  const {
    transformers,
    loading,
    error,
    pagination,
    goToPage,
    changePageSize,
    nextPage,
    previousPage,
  } = usePaginatedTransformers(0, pageSize);

  const { favorites, toggleFavorite } = useFavorites();
  const { notifications, removeNotification, showSuccess, showError } =
    useNotifications();

  // Use the filter hook (this will filter client-side within the current page)
  const {
    filters,
    setters,
    filterOptions,
    filteredTransformers,
    resetFilters,
  } = useTransformerFilters(transformers, favorites);

  // Handle pagination
  const handlePageChange = newPage => {
    goToPage(newPage);
  };

  const handlePageSizeChange = newSize => {
    setPageSize(newSize);
    changePageSize(newSize);
  };

  // Handle viewing transformer details
  const handleViewTransformer = transformer => {
    navigate(`/transformers/${transformer.id}`);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-[#E5E4E2] p-8'>
        <LoadingSpinner message='Loading transformers...' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-[#E5E4E2] p-8'>
        <div className='flex flex-col items-center justify-center p-8'>
          <div className='mb-2 text-lg font-semibold text-red-600'>
            Error loading transformers
          </div>
          <div className='mb-4 text-gray-600'>{error}</div>
          <button
            onClick={() => window.location.reload()}
            className='rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#E5E4E2] p-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>
            Paginated Transformers
          </h1>
          <p className='text-gray-600'>
            Manage and monitor power transformers with pagination
          </p>
        </div>
        <button
          onClick={() =>
            showSuccess('Demo', 'This is a demo page showing pagination')
          }
          className='flex items-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
        >
          <PlusIcon className='mr-2 h-5 w-5' />
          Demo Notification
        </button>
      </div>

      {/* Pagination info */}
      <div className='mb-4 rounded-lg bg-blue-50 p-4'>
        <h3 className='mb-2 text-sm font-medium text-blue-800'>
          Pagination Information
        </h3>
        <div className='space-y-1 text-sm text-blue-700'>
          <p>
            Current Page: {pagination.pageNumber + 1} of {pagination.totalPages}
          </p>
          <p>Page Size: {pagination.pageSize}</p>
          <p>Total Elements: {pagination.totalElements}</p>
          <p>Is First Page: {pagination.first ? 'Yes' : 'No'}</p>
          <p>Is Last Page: {pagination.last ? 'Yes' : 'No'}</p>
          <p>Is Empty: {pagination.empty ? 'Yes' : 'No'}</p>
        </div>
      </div>

      {/* Transformer View Component */}
      <div className='rounded-lg bg-white shadow-sm'>
        <TransformerView
          transformers={filteredTransformers}
          filterOptions={filterOptions}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          searchTerm={filters.searchTerm}
          setSearchTerm={setters.setSearchTerm}
          searchField={filters.searchField}
          setSearchField={setters.setSearchField}
          showFavoritesOnly={filters.showFavoritesOnly}
          setShowFavoritesOnly={setters.setShowFavoritesOnly}
          locationFilter={filters.locationFilter}
          setLocationFilter={setters.setLocationFilter}
          typeFilter={filters.typeFilter}
          setTypeFilter={setters.setTypeFilter}
          resetFilters={resetFilters}
          onDeleteTransformer={() =>
            showError('Demo', 'Delete not implemented in demo')
          }
          onEditTransformer={() =>
            showError('Demo', 'Edit not implemented in demo')
          }
          onViewTransformer={handleViewTransformer}
          isDeleting={null}
        />

        {/* Pagination Component */}
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Quick Navigation Demo */}
      <div className='mt-6 rounded-lg bg-gray-50 p-4'>
        <h3 className='mb-3 text-sm font-medium text-gray-800'>
          Quick Navigation Demo
        </h3>
        <div className='flex gap-2'>
          <button
            onClick={previousPage}
            disabled={pagination.first}
            className='rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:bg-gray-400'
          >
            Previous Page
          </button>
          <button
            onClick={nextPage}
            disabled={pagination.last}
            className='rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:bg-gray-400'
          >
            Next Page
          </button>
          <button
            onClick={() => goToPage(0)}
            disabled={pagination.first}
            className='rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:bg-gray-400'
          >
            First Page
          </button>
          <button
            onClick={() => goToPage(pagination.totalPages - 1)}
            disabled={pagination.last}
            className='rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:bg-gray-400'
          >
            Last Page
          </button>
        </div>
      </div>

      {/* Notification Manager */}
      <NotificationManager
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </div>
  );
}

export default PaginatedTransformersPage;
