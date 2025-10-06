import axios from '../api/axiosConfig';

const THERMAL_API_URL = '/api/thermal';

export const thermalApi = {
  // Main thermal analysis
  analyzeImage: async (analysisRequest) => {
    try {
      console.log('Sending thermal analysis request:', analysisRequest);
      const response = await axios.post(`${THERMAL_API_URL}/analyze`, analysisRequest);
      console.log('Thermal analysis response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Thermal analysis error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: error.config
      });
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid request parameters');
      } else if (error.response?.status === 404) {
        throw new Error('Image or equipment not found');
      } else if (error.response?.status === 500) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Internal server error occurred';
        throw new Error(`Backend processing failed: ${errorMsg}`);
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to thermal analysis service');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Analysis failed');
    }
  },

  // Test/Mock thermal analysis for development
  analyzeMockImage: async (analysisRequest) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      id: Math.floor(Math.random() * 1000),
      maintenanceImageId: parseInt(analysisRequest.maintenanceImagePath),
      maintenanceImageUrl: `https://example.com/image/${analysisRequest.maintenanceImagePath}`,
      baselineImageId: analysisRequest.baselineImagePath ? parseInt(analysisRequest.baselineImagePath) : null,
      baselineImageUrl: analysisRequest.baselineImagePath ? `https://example.com/image/${analysisRequest.baselineImagePath}` : null,
      analysisTimestamp: new Date().toISOString(),
      overallAssessment: Math.random() > 0.5 ? 'WARNING' : 'NORMAL',
      anomalyScore: Math.random() * 0.8 + 0.1,
      sensitivityPercentage: analysisRequest.sensitivityPercentage,
      processingTimeMs: Math.floor(Math.random() * 3000) + 1000,
      apiVersion: '1.0.0',
      equipmentId: analysisRequest.equipmentId,
      createdBy: analysisRequest.createdBy,
      totalDetections: Math.floor(Math.random() * 5),
      criticalDetections: Math.floor(Math.random() * 2),
      warningDetections: Math.floor(Math.random() * 3),
      detections: [
        {
          id: 1,
          x: Math.floor(Math.random() * 500),
          y: Math.floor(Math.random() * 400),
          width: Math.floor(Math.random() * 100) + 50,
          height: Math.floor(Math.random() * 80) + 40,
          label: 'Overheating Detected',
          confidence: Math.random() * 0.4 + 0.6,
          area: 2000,
          isCritical: Math.random() > 0.7,
          severityLevel: Math.random() > 0.7 ? 'HIGH' : 'MEDIUM',
          temperatureCelsius: Math.random() > 0.5 ? Math.floor(Math.random() * 40) + 60 : null
        }
      ]
    };
  },

  // Start async thermal analysis
  analyzeImageAsync: async (analysisRequest) => {
    try {
      const response = await axios.post(`${THERMAL_API_URL}/analyze/async`, analysisRequest);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Async analysis failed');
    }
  },

  // Get analysis by ID
  getAnalysis: async (id) => {
    const response = await axios.get(`${THERMAL_API_URL}/${id}`);
    return response.data;
  },

  // Get equipment analysis history
  getEquipmentHistory: async (equipmentId, page = 0, size = 20) => {
    const response = await axios.get(`${THERMAL_API_URL}/history/equipment/${equipmentId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Get latest analysis for equipment
  getLatestAnalysis: async (equipmentId) => {
    const response = await axios.get(`${THERMAL_API_URL}/latest/equipment/${equipmentId}`);
    return response.data;
  },

  // Get analysis history by image ID (Restore functionality)
  getImageHistory: async (imageId, page = 0, size = 20) => {
    const response = await axios.get(`${THERMAL_API_URL}/history/image/${imageId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Get latest analysis for image
  getLatestImageAnalysis: async (imageId) => {
    const response = await axios.get(`${THERMAL_API_URL}/latest/image/${imageId}`);
    return response.data;
  },

  // Check FastAPI service health
  checkServiceHealth: async () => {
    try {
      const response = await axios.get(`${THERMAL_API_URL}/service/health`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Thermal analysis service endpoints not implemented in backend');
      } else if (error.response?.status === 503) {
        throw new Error('Thermal analysis service is unavailable');
      }
      throw error;
    }
  },

  // Get service information
  getServiceInfo: async () => {
    const response = await axios.get(`${THERMAL_API_URL}/service/info`);
    return response.data;
  },

  // Get analyses by assessment type
  getAnalysesByAssessment: async (assessment) => {
    const response = await axios.get(`${THERMAL_API_URL}/assessment/${assessment}`);
    return response.data;
  },

  // Get critical analyses
  getCriticalAnalyses: async () => {
    const response = await axios.get(`${THERMAL_API_URL}/critical`);
    return response.data;
  },

  // Delete analysis
  deleteAnalysis: async (id) => {
    await axios.delete(`${THERMAL_API_URL}/${id}`);
  }
};