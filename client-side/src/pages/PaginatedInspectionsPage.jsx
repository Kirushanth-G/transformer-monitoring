import { usePaginatedInspections } from '../hooks/useInspections';
import { useFavorites } from '../hooks/useFavorites';
import { useNotifications } from '../hooks/useNotifications';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import InspectionView from '../components/InspectionView';
import NotificationManager from '../components/NotificationManager';
import { PlusIcon } from '../components/ui/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PaginatedInspectionsPage() {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(10);

  // Use the paginated hook
  const {
    inspections,
    loading,
    error,
    isUsingMockData,
    pagination,
    goToPage,
    changePageSize,
    nextPage,
    previousPage,
    deleteInspection,
  } = usePaginatedInspections(0, pageSize);

  const { favorites, toggleFavorite } = useFavorites();
  const { notifications, removeNotification, showSuccess, showError } =
    useNotifications();

  // Handle pagination
  const handlePageChange = newPage => {
    goToPage(newPage);
  };

  const handlePageSizeChange = newSize => {
    setPageSize(newSize);
    changePageSize(newSize);
  };

  // Handle viewing inspection details
  const handleView = inspection => {
    navigate(`/inspections/${inspection.id}`);
  };

  // Handle delete
  const handleDelete = async id => {
    try {
      const result = await deleteInspection(id);

      if (result.success) {
        showSuccess('Success!', 'Inspection has been deleted successfully.');
        // Note: In a real implementation, you'd want to refresh the current page
        // or handle the deletion more gracefully
      } else {
        showError('Delete Failed', result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      showError('Error', 'Something went wrong while deleting the inspection');
    }
  };

  // Handle edit
  const handleEdit = () => {
    showError('Demo', 'Edit functionality not implemented in this demo page');
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-[#E5E4E2] p-8'>
        <LoadingSpinner message='Loading inspections...' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-[#E5E4E2] p-8'>
        <div className='flex flex-col items-center justify-center p-8'>
          <div className='mb-2 text-lg font-semibold text-red-600'>
            Error loading inspections
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
      {/* Mock Data Warning */}
      {isUsingMockData && (
        <div className='mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-yellow-400'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-yellow-800'>
                Using Mock Data
              </h3>
              <div className='mt-2 text-sm text-yellow-700'>
                <p>
                  The API server is not available. Showing sample data with
                  simulated pagination.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>
            Paginated Inspections
          </h1>
          <p className='text-gray-600'>
            Monitor transformer inspection records with pagination
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

      {/* Inspection View Component */}
      <div className='rounded-lg bg-white shadow-sm'>
        <InspectionView
          inspections={inspections}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          isLoading={false}
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

export default PaginatedInspectionsPage;
