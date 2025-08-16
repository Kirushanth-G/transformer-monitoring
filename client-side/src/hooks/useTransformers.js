import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { mockTransformers } from '../data/mockData';

export const useTransformers = () => {
  const [transformers, setTransformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransformers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching transformers from:', '/transformers');
      const response = await api.get('/transformers');
      console.log('Transformers response:', response.data);
      console.log('First transformer object:', response.data[0]);

      // Validate response data
      if (!Array.isArray(response.data)) {
        throw new Error('API response is not an array');
      }

      // Transform API data to match frontend expectations
      const transformedData = response.data.map((transformer, index) => {
        try {
          // Safely get ID values with fallbacks
          const safeId =
            transformer.id || transformer.transformerId || index + 1;
          const safeTransformerId =
            transformer.transformerId ||
            (safeId ? safeId.toString() : null) ||
            `T${index + 1}`;

          return {
            id: safeTransformerId,
            name: transformer.name || `Transformer ${safeTransformerId}`,
            location: transformer.location || 'Unknown Location',
            type: transformer.type || 'Unknown',
            poleNo:
              transformer.poleNo ||
              `P-${(safeId ? safeId.toString() : (index + 1).toString()).padStart(4, '0')}`,
            mapUrl: transformer.location
              ? `https://www.google.com/maps/place/${encodeURIComponent(transformer.location)}`
              : 'https://www.google.com/maps',
            // Remove circular references by not including inspections
          };
        } catch (transformError) {
          console.error(
            'Error transforming transformer at index',
            index,
            ':',
            transformError,
          );
          console.error('Problematic transformer object:', transformer);
          // Return a safe fallback object
          return {
            id: `T${index + 1}`,
            name: `Transformer ${index + 1}`,
            location: 'Unknown Location',
            type: 'Unknown',
            poleNo: `P-${(index + 1).toString().padStart(4, '0')}`,
            mapUrl: 'https://www.google.com/maps',
          };
        }
      });

      console.log('Transformed data:', transformedData);
      setTransformers(transformedData);
    } catch (err) {
      console.error('Error fetching transformers:', err);
      console.log('Using mock data as fallback');
      // Use mock data as fallback when API is not available
      setTransformers(mockTransformers);
      setError(null); // Clear error when using fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransformers();
  }, []);

  return {
    transformers,
    loading,
    error,
    refetch: fetchTransformers,
  };
};
