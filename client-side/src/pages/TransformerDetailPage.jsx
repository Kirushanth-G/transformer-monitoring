import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
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
  const [isSubmittingInspection, setIsSubmittingInspection] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile and handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  }; // Fetch transformer details
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
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isMobile={isMobile}
        />
        {isMobile && isSidebarOpen && (
          <div
            className='bg-opacity-50 fixed inset-0 z-40 bg-black'
            onClick={closeSidebar}
          />
        )}
        <div
          className={`flex flex-1 flex-col transition-all duration-300 ${
            !isMobile && isSidebarOpen ? 'md:ml-64' : 'ml-0'
          }`}
        >
          <Topbar onToggleSidebar={toggleSidebar} />
          <div className='flex flex-1 items-center justify-center'>
            <LoadingSpinner message='Loading transformer details...' />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-screen bg-[#E5E4E2]'>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isMobile={isMobile}
        />
        {isMobile && isSidebarOpen && (
          <div
            className='bg-opacity-50 fixed inset-0 z-40 bg-black'
            onClick={closeSidebar}
          />
        )}
        <div
          className={`flex flex-1 flex-col transition-all duration-300 ${
            !isMobile && isSidebarOpen ? 'md:ml-64' : 'ml-0'
          }`}
        >
          <Topbar onToggleSidebar={toggleSidebar} />
          <div className='flex flex-1 items-center justify-center p-4 sm:p-8'>
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
      </div>
    );
  }

  if (!transformer) {
    return (
      <div className='flex h-screen bg-[#E5E4E2]'>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isMobile={isMobile}
        />
        {isMobile && isSidebarOpen && (
          <div
            className='bg-opacity-50 fixed inset-0 z-40 bg-black'
            onClick={closeSidebar}
          />
        )}
        <div
          className={`flex flex-1 flex-col transition-all duration-300 ${
            !isMobile && isSidebarOpen ? 'md:ml-64' : 'ml-0'
          }`}
        >
          <Topbar onToggleSidebar={toggleSidebar} />
          <div className='flex flex-1 items-center justify-center p-4 sm:p-8'>
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
      </div>
    );
  }

  return (
    <div className='flex h-screen bg-[#E5E4E2]'>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isMobile={isMobile}
      />
      {isMobile && isSidebarOpen && (
        <div
          className='bg-opacity-50 fixed inset-0 z-40 bg-black'
          onClick={closeSidebar}
        />
      )}

      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          !isMobile && isSidebarOpen ? 'md:ml-64' : 'ml-0'
        }`}
      >
        <Topbar onToggleSidebar={toggleSidebar} />

        <div className='flex-1 overflow-auto'>
          <div className='max-w-full p-2 sm:p-4 lg:p-6 xl:p-8'>
            {/* Transformer Details Header */}
            <div className='mb-3 rounded-lg bg-white p-3 shadow-sm sm:mb-4 sm:p-4 lg:mb-6 lg:p-6'>
              <div className='mb-3 flex flex-col justify-between gap-3 sm:mb-4 sm:flex-row sm:items-center sm:gap-4'>
                <div className='flex items-center'>
                  <div className='mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-base font-bold text-white sm:mr-4 sm:h-12 sm:w-12 sm:text-lg'>
                    {transformer.transformerId?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h1 className='text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl'>
                      {displayValue(transformer.transformerId)}
                    </h1>
                    <p className='text-sm text-gray-600 sm:text-base'>
                      Transformer Details
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/transformers')}
                  className='w-full rounded-md bg-blue-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-300 sm:w-auto'
                >
                  Back to List
                </button>
              </div>

              {/* Transformer Info Grid - Full width responsive */}
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 2xl:grid-cols-5'>
                <div className='rounded-lg bg-gray-200 p-3 sm:p-4'>
                  <h3 className='mb-1 text-center text-xs font-medium text-gray-500 sm:text-sm'>
                    Location
                  </h3>
                  <p
                    className={`text-base font-semibold sm:text-lg ${isNullValue(transformer.location) ? 'text-gray-400 italic' : 'text-gray-900'} text-center`}
                  >
                    {displayValue(transformer.location)}
                  </p>
                </div>
                <div className='rounded-lg bg-gray-200 p-3 sm:p-4'>
                  <h3 className='mb-1 text-center text-xs font-medium text-gray-500 sm:text-sm'>
                    Type
                  </h3>
                  <p
                    className={`text-base font-semibold sm:text-lg ${isNullValue(transformer.type) ? 'text-gray-400 italic' : 'text-gray-900'} text-center`}
                  >
                    {displayValue(transformer.type)}
                  </p>
                </div>
                <div className='rounded-lg bg-gray-200 p-3 sm:p-4'>
                  <h3 className='mb-1 text-center text-xs font-medium text-gray-500 sm:text-sm'>
                    Pole Number
                  </h3>
                  <p
                    className={`text-base font-semibold sm:text-lg ${isNullValue(transformer.poleNo) ? 'text-gray-400 italic' : 'text-gray-900'} text-center`}
                  >
                    {displayValue(transformer.poleNo)}
                  </p>
                </div>
                <div className='rounded-lg bg-gray-200 p-3 sm:col-span-2 sm:p-4 lg:col-span-1 xl:col-span-1'>
                  <h3 className='mb-1 text-center text-xs font-medium text-gray-500 sm:text-sm'>
                    Baseline Image
                  </h3>
                  <div className='flex justify-center'>
                    <TransformerImageDisplay
                      transformerId={transformer.id}
                      showSuccess={showSuccess}
                      showError={showError}
                    />
                  </div>
                </div>

                {/* Additional fields to utilize full width */}
                {transformer.voltage && (
                  <div className='rounded-lg bg-gray-200 p-3 sm:p-4'>
                    <h3 className='mb-1 text-center text-xs font-medium text-gray-500 sm:text-sm'>
                      Voltage (kV)
                    </h3>
                    <p
                      className={`text-base font-semibold sm:text-lg ${isNullValue(transformer.voltage) ? 'text-gray-400 italic' : 'text-gray-900'} text-center`}
                    >
                      {displayValue(transformer.voltage)}
                    </p>
                  </div>
                )}

                {transformer.capacity && (
                  <div className='rounded-lg bg-gray-200 p-3 sm:p-4'>
                    <h3 className='mb-1 text-center text-xs font-medium text-gray-500 sm:text-sm'>
                      Capacity (MVA)
                    </h3>
                    <p
                      className={`text-base font-semibold sm:text-lg ${isNullValue(transformer.capacity) ? 'text-gray-400 italic' : 'text-gray-900'} text-center`}
                    >
                      {displayValue(transformer.capacity)}
                    </p>
                  </div>
                )}

                {transformer.manufacturer && (
                  <div className='rounded-lg bg-gray-200 p-3 sm:p-4'>
                    <h3 className='mb-1 text-center text-xs font-medium text-gray-500 sm:text-sm'>
                      Manufacturer
                    </h3>
                    <p
                      className={`text-base font-semibold sm:text-lg ${isNullValue(transformer.manufacturer) ? 'text-gray-400 italic' : 'text-gray-900'} text-center`}
                    >
                      {displayValue(transformer.manufacturer)}
                    </p>
                  </div>
                )}

                {transformer.installationDate && (
                  <div className='rounded-lg bg-gray-200 p-3 sm:p-4'>
                    <h3 className='mb-1 text-center text-xs font-medium text-gray-500 sm:text-sm'>
                      Installation Date
                    </h3>
                    <p
                      className={`text-base font-semibold sm:text-lg ${isNullValue(transformer.installationDate) ? 'text-gray-400 italic' : 'text-gray-900'} text-center`}
                    >
                      {displayValue(transformer.installationDate)}
                    </p>
                  </div>
                )}

                {transformer.serialNumber && (
                  <div className='rounded-lg bg-gray-200 p-3 sm:p-4'>
                    <h3 className='mb-1 text-center text-xs font-medium text-gray-500 sm:text-sm'>
                      Serial Number
                    </h3>
                    <p
                      className={`text-base font-semibold sm:text-lg ${isNullValue(transformer.serialNumber) ? 'text-gray-400 italic' : 'text-gray-900'} text-center`}
                    >
                      {displayValue(transformer.serialNumber)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Inspections Section */}
            <div className='rounded-lg bg-white shadow-sm'>
              <div className='flex flex-col justify-between gap-3 border-b border-gray-200 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4 lg:p-6'>
                <h2 className='text-lg font-semibold text-gray-800 sm:text-xl lg:text-2xl'>
                  Transformer Inspections
                </h2>
                <button
                  onClick={handleOpenInspectionModal}
                  className='flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700'
                >
                  <PlusIcon className='mr-2 h-4 w-4' />
                  Add Inspection
                </button>
              </div>

              {/* Inspections Table */}
              <div className='overflow-x-auto'>
                <table className='w-full table-auto'>
                  <thead>
                    <tr className='border-b border-gray-200 bg-blue-200'>
                      <th className='w-8 px-2 py-2 text-center text-xs font-medium tracking-wider text-gray-900 uppercase sm:px-6 sm:py-3'></th>
                      <th className='px-2 py-2 text-left text-xs font-medium tracking-wider text-gray-900 uppercase sm:px-6 sm:py-3'>
                        Inspection No. ↕
                      </th>
                      <th className='hidden px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-900 uppercase sm:table-cell'>
                        Inspected Date
                      </th>
                      <th className='hidden px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-900 uppercase md:table-cell'>
                        Maintenance Date
                      </th>
                      <th className='px-2 py-2 text-left text-xs font-medium tracking-wider text-gray-900 uppercase sm:px-6 sm:py-3'>
                        Status
                      </th>
                      <th className='hidden px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-900 uppercase sm:table-cell'>
                        Actions
                      </th>
                      <th className='px-2 py-2 text-center text-xs font-medium tracking-wider text-gray-900 uppercase sm:px-6 sm:py-3'>
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
                          <td className='w-8 px-2 py-2 text-center sm:px-6 sm:py-4'>
                            <button className='focus:outline-none'>
                              <StarIcon className='h-4 w-4 text-gray-300 hover:text-yellow-400 sm:h-5 sm:w-5' />
                            </button>
                          </td>
                          <td className='px-2 py-2 whitespace-nowrap sm:px-6 sm:py-4'>
                            <span
                              className={
                                isNullValue(inspection.inspectionNo)
                                  ? 'text-gray-400 italic'
                                  : 'text-gray-900'
                              }
                            >
                              {displayValue(inspection.inspectionNo)}
                            </span>
                            {/* Mobile additional info */}
                            <div className='mt-1 text-xs text-gray-500 sm:hidden'>
                              {formatDate(inspection.inspectedAt)}
                            </div>
                          </td>
                          <td className='hidden px-6 py-4 text-sm whitespace-nowrap text-gray-900 sm:table-cell'>
                            {formatDate(inspection.inspectedAt)}
                          </td>
                          <td className='hidden px-6 py-4 text-sm whitespace-nowrap text-gray-900 md:table-cell'>
                            {formatDate(inspection.maintenanceAt)}
                          </td>
                          <td className='px-2 py-2 whitespace-nowrap sm:px-6 sm:py-4'>
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(inspection.status)}`}
                            >
                              {displayValue(inspection.status)}
                            </span>
                          </td>
                          <td className='hidden px-6 py-4 text-center sm:table-cell'>
                            <button
                              onClick={() => handleViewInspection(inspection)}
                              className='rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700'
                            >
                              View
                            </button>
                          </td>
                          <td className='px-2 py-2 text-center sm:px-6 sm:py-4'>
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
                          className='px-2 py-4 text-center text-gray-500 sm:px-6 sm:py-8'
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
    </div>
  );
}

export default TransformerDetailPage;
