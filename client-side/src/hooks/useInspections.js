import { useState, useEffect, useCallback } from 'react';
import {
  getAllInspections,
  getInspections,
  updateInspection as updateInspectionApi,
  deleteInspection as deleteInspectionApi,
} from '../api/inspectionApi';
import { mockInspections } from '../data/mockData';

export const useInspections = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsUsingMockData(false);
      // Use getAllInspections to maintain backwards compatibility
      const inspectionsData = await getAllInspections();

      // Check if we got valid data
      if (!Array.isArray(inspectionsData)) {
        throw new Error('Invalid response format: expected array');
      }

      // Transform API data to match frontend expectations
      const transformedData = inspectionsData.map(inspection => ({
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
  }, []);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

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

        await deleteInspectionApi(id);
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

        const response = await updateInspectionApi(id, data);
        return { success: true, data: response };
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

// New hook for paginated inspections
export const usePaginatedInspections = (initialPage = 0, initialSize = 10) => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: initialPage,
    pageSize: initialSize,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: false,
    empty: true,
  });

  const fetchInspections = useCallback(
    async (page = pagination.pageNumber, size = pagination.pageSize) => {
      try {
        setLoading(true);
        setError(null);
        setIsUsingMockData(false);

        const pagedResponse = await getInspections(page, size);

        // Transform the content data
        const transformedData = pagedResponse.content.map(inspection => ({
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
        setPagination({
          pageNumber: pagedResponse.pageNumber,
          pageSize: pagedResponse.pageSize,
          totalElements: pagedResponse.totalElements,
          totalPages: pagedResponse.totalPages,
          first: pagedResponse.first,
          last: pagedResponse.last,
          empty: pagedResponse.empty,
        });
      } catch (err) {
        console.error('Error fetching inspections:', err);
        setIsUsingMockData(true);

        // For mock data, create a simple pagination structure
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedMockData = mockInspections.slice(startIndex, endIndex);

        const transformedMockData = paginatedMockData.map(
          (inspection, index) => ({
            id: `mock_${startIndex + index + 1}`,
            transformerId: inspection.transformerId || 'Unknown',
            transformerName:
              inspection.transformerName ||
              `Transformer ${inspection.transformerId || 'Unknown'}`,
            inspectionId:
              inspection.inspectionId || `INS-${startIndex + index + 1}`,
            inspectionNo:
              inspection.inspectionId || `INS-${startIndex + index + 1}`,
            inspectedDate:
              inspection.inspectedDate ||
              new Date().toLocaleDateString('en-US'),
            maintenanceDate: inspection.maintenanceDate || 'Not scheduled',
            status: inspection.status || 'Pending',
            branch: inspection.branch || 'Mock Branch',
            inspectedAt: inspection.inspectedDate
              ? new Date(inspection.inspectedDate + 'T10:00:00').toISOString()
              : new Date().toISOString(),
            maintenanceAt: inspection.maintenanceDate
              ? new Date(inspection.maintenanceDate + 'T10:00:00').toISOString()
              : null,
          }),
        );

        setInspections(transformedMockData);
        setPagination({
          pageNumber: page,
          pageSize: size,
          totalElements: mockInspections.length,
          totalPages: Math.ceil(mockInspections.length / size),
          first: page === 0,
          last: endIndex >= mockInspections.length,
          empty: paginatedMockData.length === 0,
        });
        setError(null); // Clear error when using fallback
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageNumber, pagination.pageSize],
  );

  const goToPage = useCallback(
    page => {
      if (page >= 0 && page < pagination.totalPages) {
        fetchInspections(page, pagination.pageSize);
      }
    },
    [fetchInspections, pagination.totalPages, pagination.pageSize],
  );

  const changePageSize = useCallback(
    size => {
      fetchInspections(0, size); // Reset to first page when changing size
    },
    [fetchInspections],
  );

  const nextPage = useCallback(() => {
    if (!pagination.last) {
      goToPage(pagination.pageNumber + 1);
    }
  }, [pagination.last, pagination.pageNumber, goToPage]);

  const previousPage = useCallback(() => {
    if (!pagination.first) {
      goToPage(pagination.pageNumber - 1);
    }
  }, [pagination.first, pagination.pageNumber, goToPage]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  return {
    inspections,
    loading,
    error,
    isUsingMockData,
    pagination,
    refetch: fetchInspections,
    goToPage,
    changePageSize,
    nextPage,
    previousPage,

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

        await deleteInspectionApi(id);
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

        const response = await updateInspectionApi(id, data);
        return { success: true, data: response };
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
