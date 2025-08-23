import InspectionView from '../components/InspectionView';
import LoadingSpinner from '../components/LoadingSpinner';
import AddInspectionModal from '../components/AddInspectionModal';
import EditInspectionModal from '../components/EditInspectionModal';
import NotificationManager from '../components/NotificationManager';
import { useInspections } from '../hooks/useInspections';
import { useNotifications } from '../hooks/useNotifications';
import { PlusIcon } from '../components/ui/icons';
import { useFavorites } from '../hooks/useFavorites';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';

function InspectionsPage() {
  const navigate = useNavigate();

  // API hooks
  const {
    inspections,
    loading,
    error,
    isUsingMockData,
    refetch,
    deleteInspection,
    updateInspection,
  } = useInspections();
  const { notifications, removeNotification, showSuccess, showError } =
    useNotifications();

  // Favorites hook
  const { favorites, toggleFavorite } = useFavorites();

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle opening the add modal
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Handle closing the add modal
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  // Handle opening the edit modal
  const handleEdit = inspection => {
    setSelectedInspection(inspection);
    setIsEditModalOpen(true);
  };

  // Handle closing the edit modal
  const handleCloseEditModal = () => {
    setSelectedInspection(null);
    setIsEditModalOpen(false);
  };

  // Handle viewing inspection details
  const handleView = inspection => {
    navigate(`/inspections/${inspection.id}`);
  };

  // Handle delete
  const handleDelete = async id => {
    setIsSubmitting(true);
    try {
      const result = await deleteInspection(id);

      if (result.success) {
        showSuccess('Success!', 'Inspection has been deleted successfully.');
        refetch(); // Refresh the list
      } else {
        showError('Delete Failed', result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      showError('Error', 'Something went wrong while deleting the inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle saving new inspection
  const handleSaveInspection = async inspectionData => {
    setIsSubmitting(true);
    try {
      // Make POST request to save inspection
      const response = await axios.post('/inspections', inspectionData);

      if (response.status === 200 || response.status === 201) {
        // Success - show success notification
        showSuccess(
          'Success!',
          `Inspection for transformer ${inspectionData.transformerId} has been added successfully.`,
        );

        // Close modal
        handleCloseAddModal();

        // Refresh the inspections list
        refetch();
      }
    } catch (error) {
      console.error('Error saving inspection:', error);

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
            `Transformer ${inspectionData.transformerId} not found`,
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
        showError('Error', 'Something went wrong while adding the inspection');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating inspection
  const handleUpdateInspection = async inspectionData => {
    setIsSubmitting(true);
    try {
      const result = await updateInspection(
        selectedInspection.id,
        inspectionData,
      );

      if (result.success) {
        showSuccess('Success!', 'Inspection has been updated successfully.');
        handleCloseEditModal();
        refetch(); // Refresh the list
      } else {
        showError('Update Failed', result.error);
      }
    } catch (error) {
      console.error('Update error:', error);
      showError('Error', 'Something went wrong while updating the inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-[#E5E4E2] p-8'>
        <LoadingSpinner message='Loading inspections...' />
      </div>
    );
  }

  // Error state
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

  // Ensure we have inspections data
  if (!inspections || !Array.isArray(inspections)) {
    return (
      <div className='min-h-screen bg-[#E5E4E2] p-8'>
        <div className='flex flex-col items-center justify-center p-8'>
          <div className='mb-2 text-lg font-semibold text-gray-600'>
            No inspection data available
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
                  The API server is not available. Showing sample data. Edit and
                  delete operations are disabled.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Inspections</h1>
          <p className='text-gray-600'>
            Monitor transformer inspection records
          </p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={handleOpenAddModal}
            className='flex items-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
          >
            <PlusIcon className='mr-2 h-5 w-5' />
            Add Inspection
          </button>
        </div>
      </div>

      {/* Inspection View Component */}
      <InspectionView
        inspections={inspections}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isSubmitting}
      />

      {/* Add Inspection Modal */}
      <AddInspectionModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleSaveInspection}
        isLoading={isSubmitting}
      />

      {/* Edit Inspection Modal */}
      <EditInspectionModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdateInspection}
        inspection={selectedInspection}
        isLoading={isSubmitting}
      />

      {/* Notification Manager */}
      <NotificationManager
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </div>
  );
}

export default InspectionsPage;
