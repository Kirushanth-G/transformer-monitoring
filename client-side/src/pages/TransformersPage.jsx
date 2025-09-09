import TransformerView from '../components/TransformerView';
import LoadingSpinner from '../components/LoadingSpinner';
import AddTransformerModal from '../components/AddTransformerModal';
import EditTransformerModal from '../components/EditTransformerModal';
import NotificationManager from '../components/NotificationManager';
import { usePaginatedTransformers } from '../hooks/useTransformers';
import { useFavorites } from '../hooks/useFavorites';
import { useTransformerFilters } from '../hooks/useTransformerFilters';
import { useNotifications } from '../hooks/useNotifications';
import { PlusIcon } from '../components/ui/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createTransformer,
  updateTransformer,
  deleteTransformer,
} from '../api/transformerApi';
import Pagination from '../components/Pagination';

function TransformersPage() {
  const navigate = useNavigate();

  // Use paginated transformers with 10 items per page
  const {
    transformers,
    loading,
    error,
    pagination,
    sortConfig,
    goToPage,
    changePageSize,
    changeSorting,
    refetch,
  } = usePaginatedTransformers(0, 10);

  const { favorites, toggleFavorite } = useFavorites();
  const { notifications, removeNotification, showSuccess, showError } =
    useNotifications();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransformer, setSelectedTransformer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null); // Track which transformer is being deleted
  const [isEditing, setIsEditing] = useState(false); // Track if currently editing

  // Use the filter hook with cleaner destructuring
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
    changePageSize(newSize);
  };

  // Handle opening the modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle saving new transformer
  const handleSaveTransformer = async transformerData => {
    try {
      // Make POST request to save transformer
      await createTransformer(transformerData);

      // Success - show success notification
      showSuccess(
        'Success!',
        `Transformer ${transformerData.transformerId} has been saved successfully.`,
      );

      // Close modal and refresh data
      handleCloseModal();
      refetch();
    } catch (error) {
      console.error('Error saving transformer:', error);

      // Handle different error scenarios with notifications
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message =
          error.response.data?.message || 'Unknown error occurred';

        if (status === 400) {
          showError('Validation Error', message);
        } else if (status === 409) {
          showError(
            'Duplicate Transformer',
            `Transformer with ID ${transformerData.transformerId} already exists`,
          );
        } else if (status === 500) {
          showError('Server Error', 'Please try again later');
        } else {
          showError('Error', message);
        }
      } else if (error.request) {
        // Network error
        showError(
          'Network Error',
          'Please check your connection and try again',
        );
      } else {
        // Other error
        showError('Error', 'Something went wrong while saving the transformer');
      }
    }
  };

  // Handle deleting transformer
  const handleDeleteTransformer = async transformer_Id => {
    setIsDeleting(transformer_Id);
    // get transformer first
    const transformer = transformers.find(trans => trans.id === transformer_Id);
    try {
      // Make DELETE request to remove transformer
      await deleteTransformer(transformer_Id);

      // Success - show success notification
      showSuccess(
        'Deleted!',
        `Transformer ${transformer?.transformerId} has been deleted successfully.`,
      );

      refetch();
    } catch (error) {
      console.error('Error deleting transformer:', error);

      // Handle different error scenarios with notifications
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message =
          error.response.data?.message || 'Unknown error occurred';

        if (status === 404) {
          showError('Not Found', `Transformer ${transformer_Id} not found`);
        } else if (status === 403) {
          showError(
            'Permission Denied',
            'You do not have permission to delete this transformer',
          );
        } else if (status === 500) {
          showError('Server Error', 'Please try again later');
        } else {
          showError('Error', message);
        }
      } else if (error.request) {
        // Network error
        showError(
          'Network Error',
          'Please check your connection and try again',
        );
      } else {
        // Other error
        showError(
          'Error',
          'Something went wrong while deleting the transformer',
        );
      }
    } finally {
      setIsDeleting(null);
    }
  };

  // Handle opening edit modal
  const handleEditTransformer = transformer => {
    setSelectedTransformer(transformer);
    setIsEditModalOpen(true);
  };

  // Handle closing edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTransformer(null);
  };

  // Handle saving edited transformer
  const handleSaveEditedTransformer = async updatedData => {
    setIsEditing(true);
    try {
      // Make PUT request to update transformer
      await updateTransformer(selectedTransformer.id, updatedData);

      // Success - show success notification
      showSuccess(
        'Updated!',
        `Transformer ${updatedData.transformerId} has been updated successfully.`,
      );

      // Close modal and refresh data
      handleCloseEditModal();
      refetch();
    } catch (error) {
      console.error('Error updating transformer:', error);

      // Handle different error scenarios with notifications
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message =
          error.response.data?.message || 'Unknown error occurred';

        if (status === 400) {
          showError('Validation Error', message);
        } else if (status === 404) {
          showError(
            'Not Found',
            `Transformer ${updatedData.transformerId} not found`,
          );
        } else if (status === 409) {
          showError(
            'Conflict',
            `Another transformer with ID ${updatedData.transformerId} already exists`,
          );
        } else if (status === 500) {
          showError('Server Error', 'Please try again later');
        } else {
          showError('Error', message);
        }
      } else if (error.request) {
        // Network error
        showError(
          'Network Error',
          'Please check your connection and try again',
        );
      } else {
        // Other error
        showError(
          'Error',
          'Something went wrong while updating the transformer',
        );
      }
    } finally {
      setIsEditing(false);
    }
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

  if (!transformers || !Array.isArray(transformers)) {
    return (
      <div className='min-h-screen bg-[#E5E4E2] p-8'>
        <div className='flex flex-col items-center justify-center p-8'>
          <div className='mb-2 text-lg font-semibold text-gray-600'>
            No transformer data available
          </div>
          <button
            onClick={() => window.location.reload()}
            className='rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#E5E4E2] p-3 sm:p-6 lg:p-8'>
      <div className='mb-4 flex flex-col justify-between gap-4 sm:mb-6 sm:flex-row sm:items-center'>
        <div>
          <h1 className='text-xl font-bold text-gray-800 sm:text-2xl'>
            Transformers
          </h1>
          <p className='text-sm text-gray-600 sm:text-base'>
            Manage and monitor power transformers
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className='flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto sm:px-4 sm:text-base'
        >
          <PlusIcon className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
          Add Transformer
        </button>
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
          onDeleteTransformer={handleDeleteTransformer}
          onEditTransformer={handleEditTransformer}
          onViewTransformer={handleViewTransformer}
          isDeleting={isDeleting}
          sortConfig={sortConfig}
          onSortChange={changeSorting}
        />

        {/* Pagination Component */}
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Add Transformer Modal */}
      <AddTransformerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTransformer}
      />

      {/* Edit Transformer Modal */}
      <EditTransformerModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEditedTransformer}
        transformer={selectedTransformer}
        isLoading={isEditing}
      />

      {/* Notification Manager */}
      <NotificationManager
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </div>
  );
}

export default TransformersPage;
