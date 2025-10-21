import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import LoadingSpinner from '../components/LoadingSpinner';
import NotificationManager from '../components/NotificationManager';
import ThermalAnalysisForm from '../components/ThermalAnalysisForm';
import ThermalAnalysisResults from '../components/ThermalAnalysisResults';
import { useNotifications } from '../hooks/useNotifications';
import { displayValue, isNullValue } from '../utils/displayHelpers';
import { thermalApi } from '../services/thermalApi';
import { getAllTransformers } from '../api/transformerApi';
import axios from '../api/axiosConfig';
import AnnotateImageModal from '../components/AnnotateImageModal';

function InspectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notifications, removeNotification, showSuccess, showError } =
    useNotifications();

  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Transformer state (for database ID)
  const [transformer, setTransformer] = useState(null);
  const [loadingTransformer, setLoadingTransformer] = useState(false);

  // Mobile state management
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Thermal analysis state
  const [showThermalAnalysis, setShowThermalAnalysis] = useState(false);
  const [thermalAnalysisResult, setThermalAnalysisResult] = useState(null);
  const [serviceHealth, setServiceHealth] = useState(null);
  const [loadingServiceHealth, setLoadingServiceHealth] = useState(true);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [imageAnalysisHistory, setImageAnalysisHistory] = useState([]);
  const [loadingImageHistory, setLoadingImageHistory] = useState(false);
  
  // Inspection image state
  const [inspectionImage, setInspectionImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  
  // Transformer baseline image state
  const [transformerBaselineImage, setTransformerBaselineImage] = useState(null);
  const [loadingTransformerImage, setLoadingTransformerImage] = useState(false);
  
  // Image upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [environmentalCondition, setEnvironmentalCondition] = useState('Sunny');
  const [uploaderName, setUploaderName] = useState('');

  // Annotation states
  const [isAnnotateModalOpen, setIsAnnotateModalOpen] = useState(false);

  // Image modal states
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageData, setModalImageData] = useState(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => isMobile && setIsSidebarOpen(false);

  // Check thermal service health
  useEffect(() => {
    const checkServiceHealth = async () => {
      try {
        await thermalApi.checkServiceHealth();
        setServiceHealth('healthy');
      } catch (error) {
        console.log('Thermal service check failed:', error.message);
        setServiceHealth('unhealthy');
      } finally {
        setLoadingServiceHealth(false);
      }
    };
    checkServiceHealth();
  }, []);

  // Handle window resize for overlay positioning
  useEffect(() => {
    const handleResize = () => {
      if (thermalAnalysisResult) {
        // Force re-render to recalculate overlay positions
        console.log('ThermalAnalysisResult exists, forcing re-render on window resize', thermalAnalysisResult);
        setThermalAnalysisResult(prev => ({...prev}));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [thermalAnalysisResult]);

  const handleAnalysisComplete = (result) => {
    setThermalAnalysisResult(result);
    console.log('Thermal analysis completed:', result);
    setShowThermalAnalysis(false);
    
    // Force a re-render after a brief delay to ensure image is loaded
    setTimeout(() => {
      setThermalAnalysisResult(prev => ({...prev}));
    }, 100);

    // Refresh both analysis histories after new analysis
    fetchAnalysisHistory();
    fetchImageAnalysisHistory();
  };

  // Fetch transformer details by transformerId (code)
  const fetchTransformerDetails = useCallback(async () => {
    if (!inspection?.transformerId) return;
    try {
      setLoadingTransformer(true);
      console.log('Fetching transformer details for code:', inspection.transformerId);
      
      // Get all transformers and find the one with matching transformerId (code)
      const allTransformers = await getAllTransformers();
      console.log('All transformers:', allTransformers);
      console.log('Looking for transformer with code:', inspection.transformerId);
      
      const foundTransformer = allTransformers.find(t => {
        console.log('Checking transformer:', t.id, t.transformerId);
        return t.transformerId === inspection.transformerId || 
               t.id === inspection.transformerId ||
               t.id.toString() === inspection.transformerId;
      });
      
      if (foundTransformer) {
        setTransformer(foundTransformer);
        console.log('Transformer found:', foundTransformer);
      } else {
        console.warn('Transformer not found for code:', inspection.transformerId);
        console.log('Available transformer codes:', allTransformers.map(t => t.transformerId));
      }
    } catch (error) {
      console.error('Error fetching transformer details:', error);
    } finally {
      setLoadingTransformer(false);
    }
  }, [inspection?.transformerId]);

  // Fetch thermal analysis history for this equipment
  const fetchAnalysisHistory = useCallback(async () => {
    if (!inspectionImage?.id) return;
    try {
      setLoadingHistory(true);
      console.log('Fetching analysis history for inspection:', inspection?.id, 'image:', inspectionImage?.id);
      
      let history = [];
      
      // Only show analysis history if there's an inspection image
      if (inspectionImage?.id) {
        console.log('Fetching analyses for inspection image ID:', inspectionImage.id);
        
        try {
          // Try the image-specific endpoint first
          const imageHistory = await thermalApi.getImageHistory(inspectionImage.id, 0, 10);
          history = imageHistory.content || imageHistory || [];
          console.log('Image-specific analysis history:', history);
        } catch (endpointError) {
          console.log('Image history endpoint not available, filtering from all analyses');
          
          // Fallback: Filter all analyses by maintenanceImageId
          const allAnalyses = await thermalApi.getCriticalAnalyses();
          history = allAnalyses.filter(analysis => 
            analysis.maintenanceImageId && 
            analysis.maintenanceImageId.toString() === inspectionImage.id.toString()
          );
          console.log('Filtered analyses for image ID', inspectionImage.id, ':', history);
        }
      } else {
        console.log('No inspection image available, not showing analysis history');
        history = [];
      }
      
      setAnalysisHistory(history);
      console.log('Final analysis history set:', history);
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      setAnalysisHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [inspectionImage?.id, inspection?.id]);

  // Fetch thermal analysis history for this specific image (Restore functionality)
  const fetchImageAnalysisHistory = useCallback(async () => {
    if (!inspectionImage?.id) return;
    try {
      setLoadingImageHistory(true);
      console.log('Fetching image analysis history for image ID:', inspectionImage.id);
      
      let history;
      
      try {
        // Try the new image-specific endpoint first
        history = await thermalApi.getImageHistory(inspectionImage.id, 0, 10);
        console.log('Image-specific history from new endpoint:', history);
      } catch (endpointError) {
        console.log('Image history endpoint not available, using fallback method');
        
        // Fallback: Filter existing analyses by maintenanceImageId
        const allCriticalAnalyses = await thermalApi.getCriticalAnalyses();
        const imageSpecificAnalyses = allCriticalAnalyses.filter(analysis => 
          analysis.maintenanceImageId && analysis.maintenanceImageId.toString() === inspectionImage.id.toString()
        );
        
        history = { content: imageSpecificAnalyses };
        console.log('Filtered image-specific history:', imageSpecificAnalyses);
      }
      
      setImageAnalysisHistory(history.content || history || []);
      console.log('Final image analysis history set:', history.content || history || []);
    } catch (error) {
      console.error('Error fetching image analysis history:', error);
      setImageAnalysisHistory([]);
    } finally {
      setLoadingImageHistory(false);
    }
  }, [inspectionImage?.id]);

  // Get latest analysis for current image
  const getLatestImageAnalysis = useCallback(async () => {
    if (!inspectionImage?.id) return null;

    try {
      // Try the new latest image endpoint first
      const latest = await thermalApi.getLatestImageAnalysis(inspectionImage.id);
      return latest;
    } catch (error) {
      console.log('Latest image analysis endpoint not available, using fallback');
      
      // Fallback: Get the most recent analysis for this image
      if (imageAnalysisHistory.length > 0) {
        const sortedHistory = [...imageAnalysisHistory].sort((a, b) => 
          new Date(b.analysisTimestamp) - new Date(a.analysisTimestamp)
        );
        return sortedHistory[0];
      }
      return null;
    }
  }, [inspectionImage?.id, imageAnalysisHistory]);

  // Restore a previous analysis result
  const restoreAnalysisResult = (analysis) => {
    setThermalAnalysisResult(analysis);
    setShowThermalAnalysis(false);
    showSuccess(`Restored analysis #${analysis.id} from ${new Date(analysis.analysisTimestamp).toLocaleString()}`);
    
    // Force a re-render after a brief delay to ensure overlays are positioned correctly
    setTimeout(() => {
      setThermalAnalysisResult(prev => ({...prev}));
    }, 100);
  };

  // Auto-restore latest analysis for this image on page load
  const autoRestoreLatestAnalysis = useCallback(async () => {
    if (imageAnalysisHistory.length > 0 && !thermalAnalysisResult) {
      const latest = await getLatestImageAnalysis();
      if (latest) {
        console.log('Auto-restoring latest analysis for this image:', latest);
        setThermalAnalysisResult(latest);
      }
    }
  }, [imageAnalysisHistory, thermalAnalysisResult, getLatestImageAnalysis]);

  // Fetch transformer baseline image
  const fetchTransformerBaselineImage = async (transformerDatabaseId) => {
    try {
      setLoadingTransformerImage(true);
      console.log('Fetching transformer baseline image for database ID:', transformerDatabaseId);
      const response = await axios.get(`/images/transformers/${transformerDatabaseId}`);
      console.log('Raw baseline image response:', response.data);
      setTransformerBaselineImage(response.data);
      console.log('Transformer baseline image set in state:', response.data);
    } catch (error) {
      console.error('Error fetching transformer baseline image:', error);
      setTransformerBaselineImage(null);
    } finally {
      setLoadingTransformerImage(false);
    }
  };

  // Fetch inspection image for thermal analysis
  const fetchInspectionImage = async (inspectionId) => {
    try {
      setLoadingImage(true);
      console.log('Fetching inspection image for ID:', inspectionId);
      const response = await axios.get(`/images/inspections/${inspectionId}`);
      console.log('Inspection image response:', response.data);
      
      // Check if response is a text message indicating no image
      if (typeof response.data === 'string') {
        console.log('Text response received:', response.data);
        setInspectionImage(null);
      } else if (response.data && typeof response.data === 'object' && response.data.id && response.data.imageUrl) {
        console.log('Inspection image loaded successfully:', response.data);
        setInspectionImage(response.data);
      } else {
        console.log('Unexpected response format:', response.data);
        setInspectionImage(null);
      }
    } catch (error) {
      console.error('Error fetching inspection image:', error);
      if (error.response?.status === 404) {
        console.log('No image found for inspection:', inspectionId, '- this is expected if no image was uploaded');
      }
      setInspectionImage(null);
    } finally {
      setLoadingImage(false);
    }
  };

  // Upload inspection image
  const uploadInspectionImage = async () => {
    if (!selectedFile || !inspection?.id) {
      showError('Please select a file to upload');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('environmentalCondition', environmentalCondition);
      if (uploaderName.trim()) {
        formData.append('uploaderName', uploaderName.trim());
      }

      console.log('Uploading image for inspection:', inspection.id);
      const response = await axios.post(`/images/inspections/${inspection.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setInspectionImage(response.data);
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploaderName('');
      showSuccess('Image uploaded successfully!');
      console.log('Image uploaded:', response.data);
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error.response?.status === 409) {
        showError('Inspection already has an image. Please delete the existing image first.');
      } else if (error.response?.status === 404) {
        showError('Inspection not found');
      } else {
        showError(error.response?.data?.message || 'Failed to upload image');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  /**
   * Handles saving the feedback from the annotation modal.
   * This function receives the user's changes and sends them to the backend.
   */
  const handleSaveAnnotations = useCallback(
    async (feedback) => {
      if (!inspection?.id || !inspectionImage?.id) {
        showError('Cannot save annotations without an inspection and image ID.');
        return;
      }
      console.log('Saving annotation feedback:', feedback);
      try {
        await axios.post(`/api/inspections/${id}/annotations`, {
          imageId: inspectionImage.id,
          feedback,
        });
        showSuccess('Annotations saved successfully!');
        fetchImageAnalysisHistory();
      } catch (error) {
        console.error('Failed to save annotations:', error);
        showError('Could not save annotations. Please try again.');
      }
    },
    [id, inspection?.id, inspectionImage?.id, showSuccess, showError, fetchImageAnalysisHistory]
  );

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  // Opens an image in a wider modal view
  const openImageModal = (imageData) => {
    setModalImageData(imageData);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setModalImageData(null);
  };

  // Fetch transformer details when inspection is loaded
  useEffect(() => {
    if (inspection) {
      console.log('Inspection loaded, fetching transformer details for:', inspection.transformerId);
      fetchTransformerDetails();
    }
  }, [inspection, fetchTransformerDetails]);

  // Fetch transformer baseline image when transformer details are loaded
  useEffect(() => {
    if (transformer?.id) {
      console.log('Transformer state updated, fetching baseline image for database ID:', transformer.id);
      console.log('Full transformer object:', transformer);
      fetchTransformerBaselineImage(transformer.id);
    } else {
      console.log('No transformer ID available yet, transformer state:', transformer);
    }
  }, [transformer?.id]);

  // Fetch inspection image when inspection is loaded
  useEffect(() => {
    if (inspection?.id) {
      fetchInspectionImage(inspection.id);
    }
  }, [inspection?.id]);

  // Fetch analysis history when inspection image is loaded
  useEffect(() => {
    console.log('Inspection or image state changed, fetching analysis history');
    fetchAnalysisHistory();
  }, [fetchAnalysisHistory]);

  // Fetch image-specific analysis history when inspection image is loaded
  useEffect(() => {
    if (inspectionImage?.id) {
      console.log('Inspection image loaded, fetching image analysis history:', inspectionImage);
      fetchImageAnalysisHistory();
    }
  }, [inspectionImage?.id, fetchImageAnalysisHistory]);

  // Auto-restore latest analysis when image history is loaded
  useEffect(() => {
    if (imageAnalysisHistory.length > 0) {
      autoRestoreLatestAnalysis();
    }
  }, [imageAnalysisHistory, autoRestoreLatestAnalysis]);

  // Fetch inspection details
  useEffect(() => {
    const fetchInspectionDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/inspections/${id}`);
        setInspection(response.data);
      } catch (err) {
        console.error('Error fetching inspection details:', err);
        if (err.response?.status === 404) {
          setError('Inspection not found');
        } else {
          setError('Failed to load inspection details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInspectionDetails();
    }
  }, [id]);

  // Note: Inspection image fetching is handled by the main fetchInspectionImage function above

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
            <LoadingSpinner message='Loading inspection details...' />
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
                onClick={() => navigate('/inspections')}
                className='rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
              >
                Back to Inspections
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!inspection) {
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
                No inspection data available
              </div>
              <button
                onClick={() => navigate('/inspections')}
                className='rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
              >
                Back to Inspections
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
          <div className='p-3 sm:p-6 lg:p-8'>
            {/* Inspection Details Header */}
            <div className='mb-4 rounded-lg bg-white p-4 shadow-sm sm:mb-6 sm:p-6'>
              <div className='mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
                <div className='flex items-center'>
                  <div className='mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-base font-bold text-white sm:mr-4 sm:h-12 sm:w-12 sm:text-lg'>
                    {inspection.inspectionNo?.charAt(0) || 'I'}
                  </div>
                  <div>
                    <h1 className='text-xl font-bold text-gray-800 sm:text-2xl'>
                      {displayValue(inspection.inspectionNo)}
                    </h1>
                    <p className='text-sm text-gray-600 sm:text-base'>
                      Transformer No : {displayValue(inspection.transformerId)}
                      {transformer && (
                        <span className='ml-2 text-xs text-blue-600'>(DB ID: {transformer.id})</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className='flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3'>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(inspection.status)}`}
                  >
                    {displayValue(inspection.status)}
                  </span>
                  <button
                    onClick={() => navigate('/inspections')}
                    className='w-full rounded-md bg-blue-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-300 sm:w-auto'
                  >
                    Back to List
                  </button>
                </div>
              </div>

              {/* Basic Information Grid */}
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4'>
                <div className='rounded-lg bg-gray-200 p-3 sm:p-4'>
                  <h3 className='mb-1 text-center text-xs font-medium text-gray-500 sm:text-sm'>
                    Inspected Date
                  </h3>
                  <p className='text-center text-base font-semibold text-gray-900 sm:text-lg'>
                    {formatDate(inspection.inspectedAt)}
                  </p>
                </div>
                <div className='rounded-lg bg-gray-200 p-3 sm:p-4'>
                  <h3 className='mb-1 text-center text-xs font-medium text-gray-500 sm:text-sm'>
                    Maintenance Date
                  </h3>
                  <p className='text-center text-base font-semibold text-gray-900 sm:text-lg'>
                    {formatDate(inspection.maintenanceAt)}
                  </p>
                </div>
                {/* <div className='rounded-lg bg-gray-50 p-4'>
                  <h3 className='mb-1 text-sm font-medium text-gray-500'>
                    Transformer ID
                  </h3>
                  <p
                    className={`text-lg font-semibold ${isNullValue(inspection.transformerId) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.transformerId)}
                  </p>
                </div> */}
              </div>
            </div>

            {/* Technical Parameters */}
            <div className='mb-4 rounded-lg bg-white p-4 shadow-sm sm:mb-6 sm:p-6'>
              <h2 className='mb-3 text-lg font-semibold text-gray-800 sm:mb-4 sm:text-xl'>
                Technical Parameters
              </h2>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3'>
                <div className='rounded-lg bg-gray-50 p-3 sm:p-4'>
                  <h3 className='mb-1 text-xs font-medium text-gray-500 sm:text-sm'>
                    Oil Level
                  </h3>
                  <p
                    className={`text-base font-semibold sm:text-lg ${isNullValue(inspection.oilLevel) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.oilLevel)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-3 sm:p-4'>
                  <h3 className='mb-1 text-xs font-medium text-gray-500 sm:text-sm'>
                    Oil Temperature (°C)
                  </h3>
                  <p
                    className={`text-base font-semibold sm:text-lg ${isNullValue(inspection.oilTemperature) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.oilTemperature)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-3 sm:p-4'>
                  <h3 className='mb-1 text-xs font-medium text-gray-500 sm:text-sm'>
                    Winding Temperature (°C)
                  </h3>
                  <p
                    className={`text-base font-semibold sm:text-lg ${isNullValue(inspection.windingTemperature) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.windingTemperature)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-3 sm:p-4'>
                  <h3 className='mb-1 text-xs font-medium text-gray-500 sm:text-sm'>
                    Load Current (A)
                  </h3>
                  <p
                    className={`text-base font-semibold sm:text-lg ${isNullValue(inspection.loadCurrent) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.loadCurrent)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-3 sm:p-4'>
                  <h3 className='mb-1 text-xs font-medium text-gray-500 sm:text-sm'>
                    Power Factor
                  </h3>
                  <p
                    className={`text-base font-semibold sm:text-lg ${isNullValue(inspection.powerFactor) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.powerFactor)}
                  </p>
                </div>

                <div className='rounded-lg bg-gray-50 p-3 sm:p-4'>
                  <h3 className='mb-1 text-xs font-medium text-gray-500 sm:text-sm'>
                    Noise Level (dB)
                  </h3>
                  <p
                    className={`text-base font-semibold sm:text-lg ${isNullValue(inspection.noiseLevel) ? 'text-gray-400 italic' : 'text-gray-900'}`}
                  >
                    {displayValue(inspection.noiseLevel)}
                  </p>
                </div>
              </div>
            </div>

            {/* Thermal Image Comparison Section */}
            <div className='mb-4 rounded-lg bg-white p-4 shadow-sm sm:mb-6 sm:p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-semibold text-gray-800 sm:text-xl'>
                  Thermal Image Comparison
                </h2>
                <div className='flex items-center space-x-2'>
                  {/* Service Health Status */}
                  {!loadingServiceHealth && (
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      serviceHealth === 'healthy' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Thermal API {serviceHealth === 'healthy' ? 'Ready' : 'Not Available'}
                    </div>
                  )}
                  
                  {/* Annotation Tools */}
                  <div className='flex items-center space-x-1 text-gray-500'>
                    <span className='text-xs'>Annotation Tools</span>
                    <button
                      onClick={() => setIsAnnotateModalOpen(true)}
                      className='p-1 hover:bg-gray-100 rounded'>
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
                      </svg>
                    </button>
                    <button className='p-1 hover:bg-gray-100 rounded'>
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                    </button>
                    <button className='p-1 hover:bg-gray-100 rounded'>
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Comparison Grid */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                {/* Baseline Image */}
                <div className='bg-gray-50 rounded-lg overflow-hidden'>
                  <div className={`text-white px-4 py-2 text-sm font-medium flex justify-between items-center ${
                    transformerBaselineImage ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    <span>Baseline (Transformer)</span>
                    {transformerBaselineImage && (
                      <span className='px-2 py-1 rounded text-xs font-bold bg-green-700'>
                        ENHANCED ANALYSIS
                      </span>
                    )}
                  </div>
                  <div className='aspect-video bg-gray-100 relative flex items-center justify-center'>
                    {loadingTransformerImage ? (
                      <div className='text-gray-500'>Loading baseline image...</div>
                    ) : transformerBaselineImage ? (
                      <>
                        <img 
                          src={transformerBaselineImage.imageUrl} 
                          alt="Transformer Baseline"
                          className='w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity'
                          onClick={() => openImageModal({
                            url: transformerBaselineImage.imageUrl,
                            title: 'Transformer Baseline Image',
                            subtitle: `Transformer ${transformerBaselineImage.transformerId} (ID: ${transformerBaselineImage.id})`,
                            metadata: {
                              'Image ID': transformerBaselineImage.id,
                              'Transformer ID': transformerBaselineImage.transformerId,
                              'Uploader': transformerBaselineImage.uploaderName || 'Unknown',
                              'Upload Time': transformerBaselineImage.uploadTime ? new Date(transformerBaselineImage.uploadTime).toLocaleString() : 'N/A',
                              'Type': 'Baseline Reference'
                            }
                          })}
                          onError={(e) => {
                            console.error('Baseline image failed to load:', transformerBaselineImage.imageUrl);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                          onLoad={() => {
                            console.log('Baseline image loaded successfully:', transformerBaselineImage.imageUrl);
                          }}
                        />
                        <div className='hidden text-gray-500'>Baseline image failed to load</div>
                        <div className='absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-75 px-2 py-1 rounded'>
                          {transformerBaselineImage.uploadTime ? new Date(transformerBaselineImage.uploadTime).toLocaleString() : 'N/A'}
                        </div>
                        <div className='absolute top-2 right-2 text-white text-xs bg-black bg-opacity-75 px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity'>
                          Click to expand
                        </div>
                      </>
                    ) : (
                      <div className='text-center text-gray-500'>
                        <div className='text-2xl mb-2'>📊</div>
                        <div className='text-sm font-medium mb-1'>No baseline image</div>
                        <div className='text-xs opacity-75 mb-2'>
                          {transformer ? `Transformer ${transformer.transformerId} (ID: ${transformer.id}) baseline not available` : 'Transformer baseline not available'}
                        </div>
                        <div className='text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded'>
                          ⚠️ Analysis will use fallback method with reduced accuracy
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Baseline Image Metadata */}
                  {transformerBaselineImage && (
                    <div className='p-2 bg-white border-t'>
                      <div className='flex justify-between items-center mb-2'>
                        <span className='text-xs text-gray-600'>Transformer Baseline</span>
                        <span className='text-xs text-blue-600'>ID: {transformerBaselineImage.id}</span>
                      </div>
                      <div className='grid grid-cols-1 gap-2 text-xs'>
                        <div className='flex justify-between'>
                          <span className='text-gray-500'>Transformer ID:</span>
                          <span className='font-medium'>{transformerBaselineImage.transformerId}</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-500'>Uploader:</span>
                          <span className='font-medium'>{transformerBaselineImage.uploaderName || 'Unknown'}</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-500'>Upload Time:</span>
                          <span className='font-medium'>{transformerBaselineImage.uploadTime ? new Date(transformerBaselineImage.uploadTime).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Current/Analysis Image */}
                <div className='bg-gray-50 rounded-lg overflow-hidden'>
                  <div className={`text-white px-4 py-2 text-sm font-medium flex justify-between items-center ${
                    thermalAnalysisResult ? 
                      thermalAnalysisResult.overallAssessment === 'CRITICAL' ? 'bg-red-600' :
                      thermalAnalysisResult.overallAssessment === 'WARNING' ? 'bg-yellow-600' : 'bg-green-600'
                    : 'bg-gray-600'
                  }`}>
                    <span>Current Analysis</span>
                    {thermalAnalysisResult && (
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        thermalAnalysisResult.overallAssessment === 'CRITICAL' ? 'bg-red-700' :
                        thermalAnalysisResult.overallAssessment === 'WARNING' ? 'bg-yellow-700' : 'bg-green-700'
                      }`}>
                        {thermalAnalysisResult.overallAssessment === 'CRITICAL' ? 'ANOMALY DETECTED' :
                         thermalAnalysisResult.overallAssessment === 'WARNING' ? 'WARNING DETECTED' : 'NORMAL'}
                      </span>
                    )}
                  </div>
                  
                  <div className='aspect-video bg-gray-100 relative'>
                    {thermalAnalysisResult && inspectionImage ? (
                      <div className='relative w-full h-full'>
                        {/* Display the actual thermal image */}
                        <img 
                          src={thermalAnalysisResult.maintenanceImageUrl || inspectionImage.imageUrl} 
                          alt="Thermal Analysis"
                          className='w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity'
                          onClick={() => openImageModal({
                            url: thermalAnalysisResult.maintenanceImageUrl || inspectionImage.imageUrl,
                            title: 'Thermal Analysis Result',
                            subtitle: `Analysis #${thermalAnalysisResult.id} - ${thermalAnalysisResult.overallAssessment}`,
                            metadata: {
                              'Analysis ID': thermalAnalysisResult.id,
                              'Image ID': inspectionImage.id,
                              'Assessment': thermalAnalysisResult.overallAssessment,
                              'Anomaly Score': thermalAnalysisResult.anomalyScore?.toFixed(3) || '0.000',
                              'Total Detections': thermalAnalysisResult.totalDetections || 0,
                              'Critical Detections': thermalAnalysisResult.detections?.filter(d => d.isCritical).length || 0,
                              'Analysis Time': thermalAnalysisResult.analysisTimestamp ? new Date(thermalAnalysisResult.analysisTimestamp).toLocaleString() : 'N/A',
                              'Processing Time': `${thermalAnalysisResult.processingTimeMs || 0}ms`,
                              'Created By': thermalAnalysisResult.createdBy || 'Unknown'
                            },
                            detections: thermalAnalysisResult.detections
                          })}
                          onError={(e) => {
                            // Fallback to original image if thermal image fails
                            e.target.src = inspectionImage.imageUrl;
                          }}
                        />
                        
                        {/* Detection overlays */}
                        {thermalAnalysisResult.detections?.map((detection, index) => {
                          // Improved positioning calculation for object-contain images
                          const calculatePosition = () => {
                            const imageElement = document.querySelector('img[alt="Thermal Analysis"]');
                            if (!imageElement) {
                              // Fallback positioning
                              return {
                                left: `${(detection.x / 640) * 100}%`,
                                top: `${(detection.y / 480) * 100}%`,
                                width: `${(detection.width / 640) * 100}%`,
                                height: `${(detection.height / 480) * 100}%`,
                              };
                            }

                            // Get container and image dimensions
                            const container = imageElement.parentElement;
                            const containerRect = container.getBoundingClientRect();
                            const naturalWidth = imageElement.naturalWidth || 640;
                            const naturalHeight = imageElement.naturalHeight || 480;
                            
                            // Calculate how the image is scaled within its container (object-contain)
                            const containerAspect = containerRect.width / containerRect.height;
                            const imageAspect = naturalWidth / naturalHeight;
                            
                            let displayedWidth, displayedHeight, offsetX, offsetY;
                            
                            if (containerAspect > imageAspect) {
                              // Container is wider than image aspect ratio
                              displayedHeight = containerRect.height;
                              displayedWidth = displayedHeight * imageAspect;
                              offsetY = 0;
                              offsetX = (containerRect.width - displayedWidth) / 2;
                            } else {
                              // Container is taller than image aspect ratio
                              displayedWidth = containerRect.width;
                              displayedHeight = displayedWidth / imageAspect;
                              offsetX = 0;
                              offsetY = (containerRect.height - displayedHeight) / 2;
                            }
                            
                            // Scale detection coordinates to displayed image size
                            const scaleX = displayedWidth / naturalWidth;
                            const scaleY = displayedHeight / naturalHeight;
                            
                            // Calculate final position as percentage of container
                            const left = ((detection.x * scaleX + offsetX) / containerRect.width) * 100;
                            const top = ((detection.y * scaleY + offsetY) / containerRect.height) * 100;
                            const width = (detection.width * scaleX / containerRect.width) * 100;
                            const height = (detection.height * scaleY / containerRect.height) * 100;
                            
                            return {
                              left: `${left}%`,
                              top: `${top}%`,
                              width: `${width}%`,
                              height: `${height}%`,
                            };
                          };
                          
                          return (
                            <div
                              key={index}
                              className={`absolute border-2 pointer-events-none ${
                                detection.isCritical ? 'border-red-500' : 'border-yellow-500'
                              }`}
                              style={calculatePosition()}
                            >
                              {/* Detection label */}
                              <div className={`absolute -top-6 left-0 px-2 py-1 text-xs font-bold text-white rounded whitespace-nowrap z-10 ${
                                detection.isCritical ? 'bg-red-500' : 'bg-yellow-500'
                              }`}>
                                {detection.label}
                                {detection.temperatureCelsius && (
                                  <span className='ml-1'>({detection.temperatureCelsius}°C)</span>
                                )}
                              </div>
                              
                              {/* Confidence badge */}
                              <div className={`absolute -bottom-5 right-0 px-1 py-0.5 text-xs text-white rounded z-10 ${
                                detection.isCritical ? 'bg-red-600' : 'bg-yellow-600'
                              }`}>
                                {(detection.confidence * 100).toFixed(0)}%
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Analysis info overlay */}
                        <div className='absolute top-2 right-2 bg-black bg-opacity-75 text-white px-3 py-2 rounded text-sm'>
                          <div className='text-center font-bold'>Analysis Complete</div>
                          <div className='text-xs'>Status: {thermalAnalysisResult.overallAssessment}</div>
                          <div className='text-xs'>Score: {thermalAnalysisResult.anomalyScore?.toFixed(3)}</div>
                          <div className='text-xs'>Detections: {thermalAnalysisResult.totalDetections || 0}</div>
                        </div>
                        
                        <div className='absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-75 px-2 py-1 rounded'>
                          {thermalAnalysisResult.analysisTimestamp ? 
                            new Date(thermalAnalysisResult.analysisTimestamp).toLocaleString() : 
                            new Date().toLocaleString()
                          }
                        </div>

                        <div className='absolute top-2 left-2 text-white text-xs bg-black bg-opacity-75 px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity'>
                          Click to expand
                        </div>
                      </div>
                    ) : inspectionImage && !thermalAnalysisResult ? (
                      <div className='relative w-full h-full'>
                        <img 
                          src={inspectionImage.imageUrl} 
                          alt="Uploaded Inspection Image"
                          className='w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity'
                          onClick={() => openImageModal({
                            url: inspectionImage.imageUrl,
                            title: 'Inspection Image',
                            subtitle: `Image #${inspectionImage.id} - Ready for Analysis`,
                            metadata: {
                              'Image ID': inspectionImage.id,
                              'Inspection ID': inspectionImage.inspectionId,
                              'Environmental Condition': inspectionImage.environmentalCondition || 'N/A',
                              'Uploader': inspectionImage.uploaderName || 'Unknown',
                              'Upload Time': inspectionImage.uploadTime ? new Date(inspectionImage.uploadTime).toLocaleString() : 'N/A',
                              'Status': 'Ready for Analysis'
                            }
                          })}
                        />
                        <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-20'>
                          <div className='text-center text-white bg-black bg-opacity-60 px-4 py-2 rounded'>
                            <div className='text-lg font-bold mb-2'>Ready for Analysis</div>
                            <div className='text-sm opacity-90'>Click "Start Thermal Analysis" below</div>
                            <div className='text-xs opacity-75 mt-1'>Image ID: {inspectionImage.id}</div>
                            {inspectionImage.environmentalCondition && (
                              <div className='text-xs opacity-75 mt-1'>
                                Conditions: {inspectionImage.environmentalCondition}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className='absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-75 px-2 py-1 rounded'>
                          <div>
                            {inspectionImage.uploadTime ? 
                              new Date(inspectionImage.uploadTime).toLocaleString() : 
                              'Upload time unknown'
                            }
                          </div>
                          {inspectionImage.uploaderName && (
                            <div>By: {inspectionImage.uploaderName}</div>
                          )}
                        </div>
                        <div className='absolute top-2 right-2 text-white text-xs bg-black bg-opacity-75 px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity'>
                          Click to expand
                        </div>
                      </div>
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-gray-500'>
                        <div className='text-center'>
                          <div className='text-lg font-semibold mb-3'>No Inspection Image</div>
                          <div className='text-sm mb-4 opacity-75'>Upload a thermal image to start analysis</div>
                          <button
                            onClick={() => setShowUploadModal(true)}
                            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
                          >
                            📤 Upload Image
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Image Info Panel - show for uploaded image */}
                  {inspectionImage && !thermalAnalysisResult && (
                    <div className='p-2 bg-white border-t'>
                      <div className='flex justify-between items-center mb-2'>
                        <span className='text-xs text-gray-600'>Inspection Image</span>
                        <span className='text-xs text-blue-600'>ID: {inspectionImage.id}</span>
                      </div>
                      <div className='grid grid-cols-1 gap-2 text-xs'>
                        <div className='flex justify-between'>
                          <span className='text-gray-500'>Inspection ID:</span>
                          <span className='font-medium'>{inspectionImage.inspectionId}</span>
                        </div>
                        {inspectionImage.environmentalCondition && (
                          <div className='flex justify-between'>
                            <span className='text-gray-500'>Conditions:</span>
                            <span className='font-medium'>{inspectionImage.environmentalCondition}</span>
                          </div>
                        )}
                        {inspectionImage.uploaderName && (
                          <div className='flex justify-between'>
                            <span className='text-gray-500'>Uploader:</span>
                            <span className='font-medium'>{inspectionImage.uploaderName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>              {/* Weather Condition */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Weather Condition
                </label>
                <select className='w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                  <option>Sunny</option>
                  <option>Cloudy</option>
                  <option>Rainy</option>
                  <option>Windy</option>
                </select>
              </div>

              {/* Thermal Analysis Controls */}
              <div className='space-y-4'>
                {!showThermalAnalysis && !thermalAnalysisResult && (
                  <div>
                    <button
                      onClick={() => setShowThermalAnalysis(true)}
                      disabled={serviceHealth !== 'healthy' || loadingImage || !inspectionImage}
                      className={`px-6 py-2 rounded-md font-medium transition-colors ${
                        serviceHealth === 'healthy' && !loadingImage && inspectionImage
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {loadingImage 
                        ? 'Loading Image...'
                        : !inspectionImage 
                        ? 'No Image Available'
                        : serviceHealth === 'healthy' 
                        ? 'Start Thermal Analysis' 
                        : 'Thermal Analysis Unavailable'
                      }
                    </button>
                    {serviceHealth !== 'healthy' && (
                      <div className='text-sm text-gray-500 mt-2 space-y-1'>
                        <p>💡 Thermal analysis service is not available.</p>
                        <p className='text-xs'>Try using mock analysis for testing the UI functionality.</p>
                      </div>
                    )}
                    {serviceHealth === 'healthy' && (
                      <div className='text-sm text-gray-500 mt-2 space-y-1'>
                        <p>✅ Thermal analysis service is ready.</p>
                        {loadingImage && <p>🔄 Loading inspection image...</p>}
                        {inspectionImage && (
                          <p>📸 Image ready for analysis: ID {inspectionImage.id} ({inspectionImage.uploaderName})</p>
                        )}
                        {!loadingImage && !inspectionImage && (
                          <p>⚠️ No inspection image found for thermal analysis</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {showThermalAnalysis && (
                  <div className='space-y-4'>
                    {/* Analysis Configuration Summary */}
                    <div className='space-y-3'>
                      {/* Maintenance Image Info */}
                      {inspectionImage && (
                        <div className='bg-blue-50 rounded-lg p-4'>
                          <h4 className='text-sm font-semibold text-blue-800 mb-2'>🔍 Current Inspection Image</h4>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                            <div>
                              <p className='text-blue-600'>Image ID: <span className='font-semibold'>{inspectionImage.id}</span></p>
                              <p className='text-blue-600'>Uploader: {inspectionImage.uploaderName}</p>
                            </div>
                            <div>
                              <p className='text-blue-600'>Environment: {inspectionImage.environmentalCondition}</p>
                              <p className='text-blue-600'>Upload Time: {new Date(inspectionImage.uploadTime).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Baseline Configuration Info */}
                      {transformerBaselineImage ? (
                        <div className='bg-green-50 rounded-lg p-4'>
                          <h4 className='text-sm font-semibold text-green-800 mb-2'>📊 Baseline Reference Available</h4>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                            <div>
                              <p className='text-green-600'>Baseline ID: <span className='font-semibold'>{transformerBaselineImage.id}</span></p>
                              <p className='text-green-600'>Transformer: {transformerBaselineImage.transformerId}</p>
                            </div>
                            <div>
                              <p className='text-green-600'>Uploader: {transformerBaselineImage.uploaderName || 'Unknown'}</p>
                              <p className='text-green-600'>Upload Time: {new Date(transformerBaselineImage.uploadTime).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className='mt-3 text-xs text-green-700 bg-green-100 p-2 rounded'>
                            ✅ Enhanced analysis enabled - comparing current vs baseline for better accuracy
                          </div>
                        </div>
                      ) : (
                        <div className='bg-yellow-50 rounded-lg p-4'>
                          <h4 className='text-sm font-semibold text-yellow-800 mb-2'>📊 Baseline Reference</h4>
                          <div className='text-sm text-yellow-700 mb-2'>
                            No baseline image available for transformer {transformer?.transformerId || inspection.transformerId}
                          </div>
                          <div className='text-xs text-yellow-700 bg-yellow-100 p-2 rounded'>
                            ⚠️ Analysis will use fallback method with spatial contrast only. Upload a transformer baseline for enhanced accuracy.
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <ThermalAnalysisForm
                      onAnalysisComplete={handleAnalysisComplete}
                      selectedImageId={inspectionImage?.id?.toString() || ''}
                      baselineImageId={transformerBaselineImage?.id?.toString() || ''}
                      equipmentId={transformer?.id || inspection.transformerId}
                      inspectionId={inspection.id}
                      showSuccess={showSuccess}
                      showError={showError}
                      imageInfo={inspectionImage}
                      baselineImageInfo={transformerBaselineImage}
                    />
                  </div>
                )}

                {thermalAnalysisResult && (
                  <div>
                    <ThermalAnalysisResults analysis={thermalAnalysisResult} />
                    <div className='mt-4 flex space-x-2'>
                      <button
                        onClick={() => {
                          setThermalAnalysisResult(null);
                          setShowThermalAnalysis(true);
                        }}
                        className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                      >
                        Analyze Again
                      </button>
                      <button
                        onClick={() => setThermalAnalysisResult(null)}
                        className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors'
                      >
                        Clear Results
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>



            {/* Progress Section */}
            <div className='mb-4 rounded-lg bg-white p-4 shadow-sm sm:mb-6 sm:p-6'>
              <h2 className='mb-3 text-lg font-semibold text-gray-800 sm:mb-4 sm:text-xl'>
                Progress
              </h2>
              <div className='space-y-3'>
                <div className='flex items-center space-x-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100'>
                    <div className='h-3 w-3 rounded-full bg-green-600'></div>
                  </div>
                  <div className='flex-1'>
                    <p className='font-medium text-gray-900'>
                      Thermal Image Upload
                    </p>
                    <p className='text-sm text-gray-500'>
                      Image uploaded and processed
                    </p>
                  </div>
                  <span className='text-sm font-medium text-green-600'>
                    Completed
                  </span>
                </div>

                <div className='flex items-center space-x-3'>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    thermalAnalysisResult ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <div className={`h-3 w-3 rounded-full ${
                      thermalAnalysisResult ? 'bg-green-600' : 'bg-blue-600'
                    }`}></div>
                  </div>
                  <div className='flex-1'>
                    <p className='font-medium text-gray-900'>AI Thermal Analysis</p>
                    <p className='text-sm text-gray-500'>
                      {thermalAnalysisResult 
                        ? `Analysis complete - ${thermalAnalysisResult.overallAssessment}`
                        : 'Analyzing thermal patterns for anomalies'
                      }
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${
                    thermalAnalysisResult 
                      ? thermalAnalysisResult.overallAssessment === 'CRITICAL'
                        ? 'text-red-600'
                        : thermalAnalysisResult.overallAssessment === 'WARNING'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                      : 'text-blue-600'
                  }`}>
                    {thermalAnalysisResult ? thermalAnalysisResult.overallAssessment : 'In Progress'}
                  </span>
                </div>

                <div className='flex items-center space-x-3'>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    thermalAnalysisResult ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <div className={`h-3 w-3 rounded-full ${
                      thermalAnalysisResult ? 'bg-blue-600' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className='flex-1'>
                    <p className='font-medium text-gray-900'>
                      Thermal Analysis Review
                    </p>
                    <p className='text-sm text-gray-500'>
                      {thermalAnalysisResult 
                        ? 'Review analysis results and detections'
                        : 'Manual review pending'
                      }
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${
                    thermalAnalysisResult ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {thermalAnalysisResult ? 'Ready for Review' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Errors Section */}
              {thermalAnalysisResult?.detections && thermalAnalysisResult.detections.length > 0 && (
                <div className='mt-6'>
                  <h3 className='text-md font-semibold text-gray-800 mb-3 flex items-center'>
                    <span className='text-red-600 mr-2'>⚠️</span>
                    Errors ({thermalAnalysisResult.detections.filter(d => d.isCritical).length})
                  </h3>
                  <div className='space-y-2'>
                    {thermalAnalysisResult.detections
                      .filter(detection => detection.isCritical)
                      .map((detection, index) => (
                      <div key={index} className='flex items-center space-x-3 p-2 bg-red-50 rounded-lg'>
                        <span className='bg-red-600 text-white text-xs px-2 py-1 rounded font-medium'>
                          Error
                        </span>
                        <span className='text-sm text-gray-900'>
                          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()} - {detection.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              <div className='mt-6'>
                <h3 className='text-md font-semibold text-gray-800 mb-3'>Notes</h3>
                <textarea 
                  className='w-full p-3 border border-gray-300 rounded-lg resize-none'
                  rows='3'
                  placeholder='Type here to add notes...'
                  value={inspection.notes || ''}
                  readOnly
                />
              </div>
            </div>

              {/* Image Analysis History - Restore Functionality */}
              {serviceHealth === 'healthy' && inspectionImage && (
                <div className='mt-6'>
                  <div className='flex justify-between items-center mb-4'>
                    <div>
                      <h4 className='text-md font-semibold text-gray-800'>
                        🔄 Previous Analyses for This Image
                      </h4>
                      <p className='text-sm text-gray-600'>
                        Restore and view previous thermal analysis results for Image #{inspectionImage.id}
                        {imageAnalysisHistory.length > 0 && (
                          <span className='ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded'>
                            Auto-restored latest
                          </span>
                        )}
                      </p>
                    </div>
                    <div className='flex space-x-2'>
                      <span className='text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded'>
                        {imageAnalysisHistory.length} results
                      </span>
                      <button
                        onClick={fetchImageAnalysisHistory}
                        disabled={loadingImageHistory}
                        className='px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50'
                      >
                        {loadingImageHistory ? '🔄 Loading...' : '🔄 Restore'}
                      </button>
                    </div>
                  </div>

                  {loadingImageHistory ? (
                    <div className='text-center py-4 text-gray-500 text-sm'>
                      Searching for previous analyses...
                    </div>
                  ) : imageAnalysisHistory.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                      {imageAnalysisHistory.map((analysis) => (
                        <div key={analysis.id} className={`border-2 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer ${
                          thermalAnalysisResult?.id === analysis.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className='flex justify-between items-start mb-2'>
                            <div className='flex items-center space-x-2'>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                analysis.overallAssessment === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                analysis.overallAssessment === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {analysis.overallAssessment}
                              </span>
                              {thermalAnalysisResult?.id === analysis.id && (
                                <span className='px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 font-medium'>
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <span className='text-xs text-gray-500'>#{analysis.id}</span>
                          </div>
                          
                          <div className='space-y-2 text-sm'>
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Score:</span>
                              <span className='font-medium'>{analysis.anomalyScore?.toFixed(3) || '0.000'}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Detections:</span>
                              <span className='font-medium'>
                                <span className='text-red-600'>{analysis.criticalDetections || 0}</span>
                                /{analysis.totalDetections || 0}
                              </span>
                            </div>
                            <div className='text-xs text-gray-500'>
                              {new Date(analysis.analysisTimestamp).toLocaleString()}
                            </div>
                            <div className='text-xs text-gray-500'>
                              By: {analysis.createdBy || 'Unknown'}
                            </div>
                          </div>

                          <div className='mt-3 flex space-x-2'>
                            <button
                              onClick={() => restoreAnalysisResult(analysis)}
                              disabled={thermalAnalysisResult?.id === analysis.id}
                              className={`flex-1 py-1 px-2 text-xs font-medium rounded transition-colors ${
                                thermalAnalysisResult?.id === analysis.id
                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {thermalAnalysisResult?.id === analysis.id ? '✓ Restored' : '↩️ Restore'}
                            </button>
                            <button
                              onClick={() => setThermalAnalysisResult(analysis)}
                              className='px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200'
                              title='Quick view'
                            >
                              👁️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-4 text-gray-500 text-sm'>
                      <div className='text-2xl mb-1'>🔍</div>
                      <p className='font-medium'>No previous analyses found for this image</p>
                      <p className='text-xs'>This will be the first thermal analysis for Image #{inspectionImage.id}</p>
                    </div>
                  )}
                </div>
              )}

            {/* Thermal Analysis History */}
            {serviceHealth === 'healthy' && (
              <div className='mb-4 rounded-lg bg-white p-4 shadow-sm sm:mb-6 sm:p-6'>
                <div className='flex justify-between items-center mb-4'>
                  <h2 className='text-lg font-semibold text-gray-800 sm:text-xl'>
                    Thermal Analysis History
                  </h2>
                  <div className='flex space-x-2'>
                    <span className='text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded'>
                      Debug: {analysisHistory.length} records
                    </span>
                    <button
                      onClick={fetchAnalysisHistory}
                      disabled={loadingHistory}
                      className='px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50'
                    >
                      {loadingHistory ? '🔄 Loading...' : '🔄 Refresh'}
                    </button>
                  </div>
                </div>

                {loadingHistory ? (
                  <div className='text-center py-8 text-gray-500'>
                    Loading analysis history...
                  </div>
                ) : analysisHistory.length > 0 ? (
                  <div className='space-y-3'>
                    <div className='text-sm text-gray-600 mb-3'>
                      {analysisHistory.length > 0 ? (
                        <>
                          Showing {analysisHistory.length} thermal analysis result{analysisHistory.length !== 1 ? 's' : ''} 
                          {inspectionImage ? ` for image ID: ${inspectionImage.id}` : ''}
                        </>
                      ) : (
                        inspectionImage ? 
                          `No thermal analyses found for this inspection image (ID: ${inspectionImage.id})` :
                          'No inspection image uploaded - upload an image to see analysis history'
                      )}
                    </div>
                    {analysisHistory.map((analysis) => (
                      <div key={analysis.id} className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50'>
                        <div className='flex justify-between items-start'>
                          <div className='flex-1'>
                            <div className='flex items-center space-x-3 mb-2'>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                analysis.overallAssessment === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                analysis.overallAssessment === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {analysis.overallAssessment}
                              </span>
                              <span className='text-sm text-gray-600'>
                                Analysis #{analysis.id}
                              </span>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 text-sm'>
                              <div>
                                <p className='text-gray-600'>Anomaly Score</p>
                                <p className='font-semibold'>{analysis.anomalyScore?.toFixed(3) || '0.000'}</p>
                              </div>
                              <div>
                                <p className='text-gray-600'>Detections</p>
                                <p className='font-semibold'>
                                  <span className='text-red-600'>{analysis.criticalDetections || 0}</span> / {analysis.totalDetections || 0}
                                </p>
                              </div>
                              <div>
                                <p className='text-gray-600'>Processing Time</p>
                                <p className='font-semibold'>{analysis.processingTimeMs || 0}ms</p>
                              </div>
                              <div>
                                <p className='text-gray-600'>Created By</p>
                                <p className='font-semibold'>{analysis.createdBy || 'Unknown'}</p>
                              </div>
                            </div>
                            {analysis.detections && analysis.detections.length > 0 && (
                              <div className='mt-3 pt-3 border-t border-gray-100'>
                                <p className='text-sm text-gray-600 mb-2'>Detected Issues:</p>
                                <div className='flex flex-wrap gap-2'>
                                  {analysis.detections.slice(0, 3).map((detection, idx) => (
                                    <span 
                                      key={idx}
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        detection.isCritical ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                      }`}
                                    >
                                      {detection.label} ({Math.round((detection.confidence || 0) * 100)}%)
                                    </span>
                                  ))}
                                  {analysis.detections.length > 3 && (
                                    <span className='px-2 py-1 rounded text-xs bg-gray-100 text-gray-600'>
                                      +{analysis.detections.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className='text-right text-sm text-gray-500 ml-4'>
                            <p>{new Date(analysis.analysisTimestamp).toLocaleString()}</p>
                            <button
                              onClick={() => setThermalAnalysisResult(analysis)}
                              className='mt-2 text-blue-600 hover:text-blue-800 font-medium'
                            >
                              View Results
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8 text-gray-500'>
                    <div className='text-4xl mb-2'>📊</div>
                    {inspectionImage ? (
                      <>
                        <p className='font-medium'>No thermal analysis history found</p>
                        <p className='text-sm'>Perform your first analysis on this image to see results here</p>
                      </>
                    ) : (
                      <>
                        <p className='font-medium'>No inspection image uploaded</p>
                        <p className='text-sm'>Upload an inspection image first to perform thermal analysis</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Upload Image Modal */}
        {showUploadModal && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold'>Upload Inspection Image</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  ✕
                </button>
              </div>
              
              <div className='space-y-4'>
                {/* File Input */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Image File
                  </label>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleFileSelect}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {selectedFile && (
                    <p className='text-sm text-gray-600 mt-1'>
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {/* Environmental Condition */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Environmental Condition
                  </label>
                  <select
                    value={environmentalCondition}
                    onChange={(e) => setEnvironmentalCondition(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value='Sunny'>Sunny</option>
                    <option value='Cloudy'>Cloudy</option>
                    <option value='Rainy'>Rainy</option>
                  </select>
                </div>

                {/* Uploader Name */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Uploader Name (Optional)
                  </label>
                  <input
                    type='text'
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    placeholder='Enter your name'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex space-x-3 mt-6'>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className='flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors'
                  disabled={uploadingImage}
                >
                  Cancel
                </button>
                <button
                  onClick={uploadInspectionImage}
                  disabled={!selectedFile || uploadingImage}
                  className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
                >
                  {uploadingImage ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Annotation Modal */}
        {isAnnotateModalOpen && thermalAnalysisResult && (
          <AnnotateImageModal
            isOpen={isAnnotateModalOpen}
            onClose={() => setIsAnnotateModalOpen(false)}
            onSave={handleSaveAnnotations}
            thermalAnalysisResult={thermalAnalysisResult} // Pass the full thermalAnalysisResult object
          />
        )}

        {/* Image Modal */}
        {isImageModalOpen && modalImageData && (
          <div className='fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-lg max-w-6xl max-h-[90vh] w-full flex flex-col'>
              {/* Modal Header */}
              <div className='flex justify-between items-center p-4 border-b border-gray-200'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-800'>{modalImageData.title}</h3>
                  {modalImageData.subtitle && (
                    <p className='text-sm text-gray-600 mt-1'>{modalImageData.subtitle}</p>
                  )}
                </div>
                <button
                  onClick={closeImageModal}
                  className='text-gray-400 hover:text-gray-600 text-2xl font-light'
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className='flex-1 overflow-hidden flex'>
                {/* Image Display */}
                <div className='flex-1 relative bg-gray-100 flex items-center justify-center min-h-0'>
                  <img 
                    src={modalImageData.url} 
                    alt={modalImageData.title}
                    className='max-w-full max-h-full object-contain'
                    style={{ maxHeight: 'calc(90vh - 200px)' }}
                  />
                  
                  {/* Detection overlays for thermal analysis images */}
                  {modalImageData.detections && modalImageData.detections.length > 0 && (
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='relative'>
                        {modalImageData.detections.map((detection, index) => (
                          <div
                            key={index}
                            className={`absolute border-2 pointer-events-none ${
                              detection.isCritical ? 'border-red-500' : 'border-yellow-500'
                            }`}
                            style={{
                              left: `${(detection.x / 640) * 100}%`,
                              top: `${(detection.y / 480) * 100}%`,
                              width: `${(detection.width / 640) * 100}%`,
                              height: `${(detection.height / 480) * 100}%`,
                            }}
                          >
                            <div className={`absolute -top-6 left-0 px-2 py-1 text-xs font-bold text-white rounded whitespace-nowrap z-10 ${
                              detection.isCritical ? 'bg-red-500' : 'bg-yellow-500'
                            }`}>
                              {detection.label}
                              {detection.temperatureCelsius && (
                                <span className='ml-1'>({detection.temperatureCelsius}°C)</span>
                              )}
                            </div>
                            <div className={`absolute -bottom-5 right-0 px-1 py-0.5 text-xs text-white rounded z-10 ${
                              detection.isCritical ? 'bg-red-600' : 'bg-yellow-600'
                            }`}>
                              {(detection.confidence * 100).toFixed(0)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata Panel */}
                <div className='w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto'>
                  <h4 className='font-semibold text-gray-800 mb-3'>Image Details</h4>
                  <div className='space-y-3'>
                    {Object.entries(modalImageData.metadata).map(([key, value]) => (
                      <div key={key} className='flex flex-col'>
                        <span className='text-xs text-gray-500 uppercase tracking-wide'>{key}</span>
                        <span className='text-sm text-gray-900 font-medium mt-1'>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Detection Details */}
                  {modalImageData.detections && modalImageData.detections.length > 0 && (
                    <div className='mt-6'>
                      <h5 className='font-semibold text-gray-800 mb-3'>
                        Detections ({modalImageData.detections.length})
                      </h5>
                      <div className='space-y-3 max-h-64 overflow-y-auto'>
                        {modalImageData.detections.map((detection, index) => (
                          <div key={index} className={`p-3 rounded-lg border ${
                            detection.isCritical ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                          }`}>
                            <div className='flex justify-between items-start mb-2'>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                detection.isCritical ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {detection.label}
                              </span>
                              <span className='text-xs text-gray-600'>
                                {(detection.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className='grid grid-cols-2 gap-2 text-xs text-gray-600'>
                              <div>
                                <span className='font-medium'>Position:</span> 
                                <br />({detection.x}, {detection.y})
                              </div>
                              <div>
                                <span className='font-medium'>Size:</span> 
                                <br />{detection.width}×{detection.height}
                              </div>
                              {detection.temperatureCelsius && (
                                <div className='col-span-2'>
                                  <span className='font-medium'>Temperature:</span> {detection.temperatureCelsius}°C
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className='p-4 border-t border-gray-200 flex justify-between items-center'>
                <div className='text-sm text-gray-500'>
                  Use mouse wheel to zoom • Drag to pan
                </div>
                <div className='flex space-x-2'>
                  {modalImageData.detections && modalImageData.detections.length > 0 && (
                    <button
                      onClick={() => {
                        closeImageModal();
                        setIsAnnotateModalOpen(true);
                      }}
                      className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm'
                    >
                      Annotate
                    </button>
                  )}
                  <button
                    onClick={closeImageModal}
                    className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm'
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Manager */}
        <NotificationManager
          notifications={notifications}
          removeNotification={removeNotification}
        />
      </div>
    </div>
  );
}

export default InspectionDetailPage;