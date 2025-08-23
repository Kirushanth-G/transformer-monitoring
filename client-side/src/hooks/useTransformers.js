import { useState, useEffect, useCallback } from 'react';
import { getAllTransformers, getTransformers } from '../api/transformerApi';

export const useTransformers = () => {
  const [transformers, setTransformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransformers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Use getAllTransformers to maintain backwards compatibility
      const transformersData = await getAllTransformers();

      if (!Array.isArray(transformersData)) {
        throw new Error('API response is not an array');
      }

      const transformedData = transformersData.map(transformer => ({
        id: transformer.id, // Use the id from API
        transformerId: transformer.transformerId,
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
  }, []);

  useEffect(() => {
    fetchTransformers();
  }, [fetchTransformers]);

  return {
    transformers,
    loading,
    error,
    refetch: fetchTransformers,
  };
};

// New hook for paginated transformers
export const usePaginatedTransformers = (initialPage = 0, initialSize = 10) => {
  const [transformers, setTransformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: initialPage,
    pageSize: initialSize,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: false,
    empty: true,
  });

  const fetchTransformers = useCallback(
    async (page = pagination.pageNumber, size = pagination.pageSize) => {
      try {
        setLoading(true);
        setError(null);

        const pagedResponse = await getTransformers(page, size);

        // Check if we got valid paginated response
        if (
          !pagedResponse ||
          !pagedResponse.content ||
          !Array.isArray(pagedResponse.content)
        ) {
          console.warn(
            'Invalid paginated response, falling back to empty array:',
            pagedResponse,
          );
          setTransformers([]);
          setPagination({
            pageNumber: 0,
            pageSize: size,
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true,
            empty: true,
          });
          return;
        }

        // Transform the content data
        const transformedData = pagedResponse.content.map(transformer => ({
          id: transformer.id,
          transformerId: transformer.transformerId,
          location: transformer.location || '',
          type: transformer.type || '',
          poleNo: transformer.poleNo || '',
        }));

        setTransformers(transformedData);
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
        console.error('Error fetching transformers:', err);
        setError('Failed to fetch transformers');
        setTransformers([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageNumber, pagination.pageSize],
  );

  const goToPage = useCallback(
    page => {
      if (page >= 0 && page < pagination.totalPages) {
        fetchTransformers(page, pagination.pageSize);
      }
    },
    [fetchTransformers, pagination.totalPages, pagination.pageSize],
  );

  const changePageSize = useCallback(
    size => {
      fetchTransformers(0, size); // Reset to first page when changing size
    },
    [fetchTransformers],
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
    fetchTransformers();
  }, [fetchTransformers]);

  return {
    transformers,
    loading,
    error,
    pagination,
    refetch: fetchTransformers,
    goToPage,
    changePageSize,
    nextPage,
    previousPage,
  };
};
