import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { mockInspections } from '../data/mockData';

export const useInspections = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsUsingMockData(false);
      const response = await api.get('/inspections');

      // Check if we got valid data
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format: expected array');
      }

      // Transform API data to match frontend expectations
      const transformedData = response.data.map(inspection => ({
        id: inspection.id,
        transformerId:
          inspection.transformer?.transformerId ||
          inspection.transformer?.id?.toString() ||
          inspection.transformerId ||
          'Unknown',
        transformerName:
          inspection.transformer?.name ||
          `Transformer ${inspection.transformer?.transformerId || inspection.transformer?.id || inspection.transformerId || 'Unknown'}`,
        inspectionId:
          inspection.inspectionNo || inspection.id?.toString() || 'Unknown',
        inspectionNo:
          inspection.inspectionNo || inspection.id?.toString() || 'Unknown',
        inspectedDate: inspection.inspectedAt
          ? new Date(inspection.inspectedAt).toLocaleDateString('en-US')
          : new Date().toLocaleDateString('en-US'),
        maintenanceDate: inspection.maintenanceAt
          ? new Date(inspection.maintenanceAt).toLocaleDateString('en-US')
          : 'Not scheduled',
        status: inspection.status || 'Pending',
        branch: inspection.branch || 'Unknown',
        inspectedAt: inspection.inspectedAt,
        maintenanceAt: inspection.maintenanceAt,
      }));

      setInspections(transformedData);
    } catch (err) {
      console.error('Error fetching inspections:', err);
      setIsUsingMockData(true);

      // Transform mock data to match the expected format
      const transformedMockData = mockInspections.map((inspection, index) => ({
        id: `mock_${index + 1}`, // Use a prefix to identify mock data
        transformerId: inspection.transformerId || 'Unknown',
        transformerName:
          inspection.transformerName ||
          `Transformer ${inspection.transformerId || 'Unknown'}`,
        inspectionId: inspection.inspectionId || `INS-${index + 1}`,
        inspectionNo: inspection.inspectionId || `INS-${index + 1}`,
        inspectedDate:
          inspection.inspectedDate || new Date().toLocaleDateString('en-US'),
        maintenanceDate: inspection.maintenanceDate || 'Not scheduled',
        status: inspection.status || 'Pending',
        branch: inspection.branch || 'Mock Branch',
        inspectedAt: inspection.inspectedDate
          ? new Date(inspection.inspectedDate + 'T10:00:00').toISOString()
          : new Date().toISOString(),
        maintenanceAt: inspection.maintenanceDate
          ? new Date(inspection.maintenanceDate + 'T10:00:00').toISOString()
          : null,
      }));

      setInspections(transformedMockData);
      setError(null); // Clear error when using fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  return {
    inspections,
    loading,
    error,
    isUsingMockData,
    refetch: fetchInspections,

    deleteInspection: async id => {
      try {
        // Check if this is mock data
        if (isUsingMockData || String(id).startsWith('mock_')) {
          return {
            success: false,
            error:
              'Cannot delete mock data. Please connect to the API server to perform this action.',
          };
        }

        await api.delete(`/inspections/${id}`);
        return { success: true };
      } catch (error) {
        console.error('Error deleting inspection:', error);

        // Provide specific error messages
        let errorMessage = 'Failed to delete inspection';
        if (error.response?.status === 400) {
          errorMessage = 'Bad request - the inspection cannot be deleted';
        } else if (error.response?.status === 404) {
          errorMessage =
            'Inspection not found - it may have already been deleted';
        } else if (error.response?.status === 403) {
          errorMessage =
            'Access denied - you may not have permission to delete this inspection';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    updateInspection: async (id, data) => {
      try {
        // Check if this is mock data
        if (isUsingMockData || String(id).startsWith('mock_')) {
          return {
            success: false,
            error:
              'Cannot update mock data. Please connect to the API server to perform this action.',
          };
        }

        const response = await api.put(`/inspections/${id}`, data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error updating inspection:', error);
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to update inspection',
        };
      }
    },
  };
};
