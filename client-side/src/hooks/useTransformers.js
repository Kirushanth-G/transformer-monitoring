import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export const useTransformers = () => {
  const [transformers, setTransformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransformers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/transformers');
      if (!Array.isArray(response.data)) {
        throw new Error('API response is not an array');
      }
      const transformedData = response.data.map((transformer, index) => ({
        id: transformer.transformerId || transformer.id || `T${index + 1}`,
        location: transformer.location || '',
        type: transformer.type || '',
        poleNo: transformer.poleNo || '',
      }));
      setTransformers(transformedData);
    } catch (err) {
      console.error('Error fetching transformers:', err);
      setError('Failed to fetch transformers');
      setTransformers([]);
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
