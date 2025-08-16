import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { mockInspections } from '../data/mockData';

export const useInspections = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching inspections from:', '/inspections');
      const response = await api.get('/inspections');
      console.log('Inspections response:', response.data);

      // Transform API data to match frontend expectations
      const transformedData = response.data.map(inspection => ({
        transformerId:
          inspection.transformer?.transformerId ||
          inspection.transformer?.id?.toString() ||
          'Unknown',
        transformerName:
          inspection.transformer?.name ||
          `Transformer ${inspection.transformer?.transformerId || inspection.transformer?.id || 'Unknown'}`,
        inspectionId:
          inspection.inspectionNo || inspection.id?.toString() || 'Unknown',
        inspectedDate:
          inspection.inspectedDate || new Date().toISOString().split('T')[0],
        maintenanceDate:
          inspection.maintenanceDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0], // 30 days from now
        status: inspection.status || 'Pending',
      }));

      setInspections(transformedData);
    } catch (err) {
      console.error('Error fetching inspections:', err);
      console.log('Using mock data as fallback');
      // Use mock data as fallback when API is not available
      setInspections(mockInspections);
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
    refetch: fetchInspections,
  };
};
