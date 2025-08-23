import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import AddInspectionModal from '../components/AddInspectionModal';
import EditInspectionModal from '../components/EditInspectionModal';
import InspectionActionDropdown from '../components/InspectionActionDropdown';
import TransformerImageDisplay from '../components/TransformerImageDisplay';
import NotificationManager from '../components/NotificationManager';
import { useNotifications } from '../hooks/useNotifications';
import { StarIcon, PlusIcon } from '../components/ui/icons';
import { displayValue, isNullValue } from '../utils/displayHelpers';
import axios from '../api/axiosConfig';

function TransformerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notifications, removeNotification, showSuccess, showError } =
    useNotifications();

  const [transformer, setTransformer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [isSubmittingInspection, setIsSubmittingInspection] = useState(false); // Fetch transformer details
  useEffect(() => {
    const fetchTransformerDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/transformers/${id}`);
        setTransformer(response.data);
      } catch (err) {
        console.error('Error fetching transformer details:', err);
        if (err.response?.status === 404) {
          setError('Transformer not found');
        } else {
          setError('Failed to load transformer details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTransformerDetails();
    }
  }, [id]);

  // Handle opening inspection modal
  const handleOpenInspectionModal = () => {
    setIsInspectionModalOpen(true);
  };

  // Handle closing inspection modal
  const handleCloseInspectionModal = () => {
    setIsInspectionModalOpen(false);
  };

  // Handle saving new inspection
  const handleSaveInspection = async inspectionData => {
    setIsSubmittingInspection(true);
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
        handleCloseInspectionModal();

        // Refresh the transformer details to show new inspection
        const refreshResponse = await axios.get(`/transformers/${id}`);
        setTransformer(refreshResponse.data);
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
      setIsSubmittingInspection(false);
    }
  };

  // Handle viewing inspection details
  const handleViewInspection = inspection => {
    navigate(`/inspections/${inspection.id}`);
  };

  // Handle editing inspection
  const handleEdit = inspection => {
    setSelectedInspection(inspection);
    setIsEditModalOpen(true);
  };

  // Handle closing edit modal
  const handleCloseEditModal = () => {
    setSelectedInspection(null);
    setIsEditModalOpen(false);
  };

  // Handle updating inspection
  const handleUpdateInspection = async inspectionData => {
    setIsSubmittingInspection(true);
    try {
      const response = await axios.put(
        `/inspections/${selectedInspection.id}`,
        inspectionData,
      );

      if (response.status === 200 || response.status === 204) {
        showSuccess('Success!', 'Inspection has been updated successfully.');
        handleCloseEditModal();

        // Refresh the transformer details
        const refreshResponse = await axios.get(`/transformers/${id}`);
        setTransformer(refreshResponse.data);
      }
    } catch (error) {
      console.error('Update error:', error);

      if (error.response?.status === 404) {
        showError('Not Found', 'Inspection not found');
      } else if (error.response?.status === 400) {
        showError(
          'Validation Error',
          error.response.data?.message || 'Invalid data',
        );
      } else {
        showError(
          'Error',
          'Something went wrong while updating the inspection',
        );
      }
    } finally {
      setIsSubmittingInspection(false);
    }
  };

  // Handle deleting inspection
  const handleDelete = async inspectionId => {
    setIsSubmittingInspection(true);
    try {
      const response = await axios.delete(`/inspections/${inspectionId}`);

      if (response.status === 200 || response.status === 204) {
        showSuccess('Success!', 'Inspection has been deleted successfully.');

        // Refresh the transformer details
        const refreshResponse = await axios.get(`/transformers/${id}`);
        setTransformer(refreshResponse.data);
      }
    } catch (error) {
      console.error('Delete error:', error);

      if (error.response?.status === 404) {
        showError('Not Found', 'Inspection not found');
      } else {
        showError(
          'Error',
          'Something went wrong while deleting the inspection',
        );
      }
    } finally {
      setIsSubmittingInspection(false);
    }
  };

  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = dateString => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className='flex h-screen bg-[#E5E4E2]'>
        <Sidebar />
        <div className='ml-64 flex flex-1 items-center justify-center'>
          <LoadingSpinner message='Loading transformer details...' />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-screen bg-[#E5E4E2]'>
        <Sidebar />
        <div className='ml-64 flex flex-1 items-center justify-center p-8'>
          <div className='text-center'>
            <div className='mb-2 text-lg font-semibold text-red-600'>
              {error}
            </div>
            <button
              onClick={() => navigate('/transformers')}
              className='rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
            >
              Back to Transformers
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!transformer) {
    return (
      <div className='flex h-screen bg-[#E5E4E2]'>
        <Sidebar />
        <div className='ml-64 flex flex-1 items-center justify-center p-8'>
          <div className='text-center'>
            <div className='mb-2 text-lg font-semibold text-gray-600'>
              No transformer data available
            </div>
            <button
              onClick={() => navigate('/transformers')}
              className='rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
            >
              Back to Transformers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen bg-[#E5E4E2]'>
      <Sidebar />

      <div className='ml-64 flex-1 overflow-auto'>
        <div className='p-8'>
          {/* Transformer Details Header */}
          <div className='mb-6 rounded-lg bg-white p-6 shadow-sm'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white'>
                  {transformer.transformerId?.charAt(0) || 'T'}
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-800'>
                    {displayValue(transformer.transformerId)}
                  </h1>
                  <p className='text-gray-600'>Transformer Details</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/transformers')}
                className='rounded-md bg-blue-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-300'
              >
                Back to List
              </button>
            </div>

            {/* Transformer Info Grid */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-5'>
              <div className='rounded-lg bg-gray-50 p-4'>
                <h3 className='mb-1 text-sm font-medium text-gray-500 text-center'>
                  Location
                </h3>
                <p
                  className={`text-lg font-semibold ${isNullValue(transformer.location) ? 'text-gray-400 italic' : 'text-gray-900 text-center'}`}
                >
                  {displayValue(transformer.location)}
                </p>
              </div>
              <div className='rounded-lg bg-gray-50 p-4'>
                <h3 className='mb-1 text-sm font-medium text-gray-500 text-center'>Type</h3>
                <p
                  className={`text-lg font-semibold ${isNullValue(transformer.type) ? 'text-gray-400 italic' : 'text-gray-900 text-center'}`}
                >
                  {displayValue(transformer.type)}
                </p>
              </div>
              <div className='rounded-lg bg-gray-50 p-4'>
                <h3 className='mb-1 text-sm font-medium text-gray-500 text-center'>
                  Pole Number
                </h3>
                <p
                  className={`text-lg font-semibold ${isNullValue(transformer.poleNo) ? 'text-gray-400 italic' : 'text-gray-900 text-center'}`}
                >
                  {displayValue(transformer.poleNo)}
                </p>
              </div>
              <div className='rounded-lg bg-gray-50 p-4'>
                <TransformerImageDisplay
                  transformerId={transformer.id}
                  showSuccess={showSuccess}
                  showError={showError}
                />
              </div>
            </div>
          </div>

          {/* Inspections Section */}
          <div className='rounded-lg bg-white shadow-sm'>
            <div className='flex items-center justify-between border-b border-gray-200 p-6'>
              <h2 className='text-xl font-semibold text-gray-800'>
                Transformer Inspections
              </h2>
              <button
                onClick={handleOpenInspectionModal}
                className='flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700'
              >
                <PlusIcon className='mr-2 h-4 w-4' />
                Add Inspection
              </button>
            </div>

            {/* Inspections Table */}
            <div className='overflow-x-auto'>
              <table className='w-full table-auto'>
                <thead>
                  <tr className='border-b border-gray-200 bg-gray-50'>
                    <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                      <StarIcon className='h-4 w-4' />
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                      Inspection No. ↕
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                      Inspected Date
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                      Maintenance Date
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase'>
                      Actions
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase'>
                      Menu
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 bg-white'>
                  {transformer.inspections &&
                  transformer.inspections.length > 0 ? (
                    transformer.inspections.map((inspection, index) => (
                      <tr
                        key={inspection.id || index}
                        className='hover:bg-gray-50'
                      >
                        <td className='px-6 py-4 text-center'>
                          <button className='focus:outline-none'>
                            <StarIcon className='h-5 w-5 text-gray-300 hover:text-yellow-400' />
                          </button>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={
                              isNullValue(inspection.inspectionNo)
                                ? 'text-gray-400 italic'
                                : 'text-gray-900'
                            }
                          >
                            {displayValue(inspection.inspectionNo)}
                          </span>
                        </td>
                        <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-900'>
                          {formatDate(inspection.inspectedAt)}
                        </td>
                        <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-900'>
                          {formatDate(inspection.maintenanceAt)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(inspection.status)}`}
                          >
                            {displayValue(inspection.status)}
                          </span>
                        </td>
                        <td className='px-6 py-4 text-center'>
                          <button
                            onClick={() => handleViewInspection(inspection)}
                            className='rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700'
                          >
                            View
                          </button>
                        </td>
                        <td className='px-6 py-4 text-center'>
                          <InspectionActionDropdown
                            inspection={inspection}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            isLoading={isSubmittingInspection}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan='7'
                        className='px-6 py-8 text-center text-gray-500'
                      >
                        No inspections found for this transformer
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Inspection Modal */}
      <AddInspectionModal
        isOpen={isInspectionModalOpen}
        onClose={handleCloseInspectionModal}
        onSave={handleSaveInspection}
        transformerId={transformer?.transformerId}
        isLoading={isSubmittingInspection}
      />

      {/* Edit Inspection Modal */}
      <EditInspectionModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdateInspection}
        inspection={selectedInspection}
        isLoading={isSubmittingInspection}
      />

      {/* Notification Manager */}
      <NotificationManager
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </div>
  );
}

export default TransformerDetailPage;
