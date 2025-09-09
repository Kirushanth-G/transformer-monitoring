import axios from './axiosConfig';

// Get paginated transformers with sorting
export const getTransformers = async (page = 0, size = 10, sort = 'transformerId,asc') => {
  const response = await axios.get('/transformers', {
    params: { page, size, sort },
  });

  // Check if response has the new Spring Boot pagination format
  if (
    response.data &&
    response.data.content &&
    Array.isArray(response.data.content) &&
    response.data.page
  ) {
    // Map Spring Boot pagination format to our expected format
    return {
      content: response.data.content,
      pageNumber: response.data.page.number,
      pageSize: response.data.page.size,
      totalElements: response.data.page.totalElements,
      totalPages: response.data.page.totalPages,
      first: response.data.page.number === 0,
      last: response.data.page.number === response.data.page.totalPages - 1,
      empty: response.data.content.length === 0,
    };
  }

  // Check if response is already paginated (legacy format)
  if (
    response.data &&
    response.data.content &&
    Array.isArray(response.data.content)
  ) {
    return response.data;
  }

  // If response is a direct array (backend not yet implementing pagination)
  if (Array.isArray(response.data)) {
    console.warn(
      'Backend returning array instead of paginated response, creating mock pagination',
    );
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedData = response.data.slice(startIndex, endIndex);

    return {
      content: paginatedData,
      pageNumber: page,
      pageSize: size,
      totalElements: response.data.length,
      totalPages: Math.ceil(response.data.length / size),
      first: page === 0,
      last: endIndex >= response.data.length,
      empty: paginatedData.length === 0,
    };
  }

  // If neither, throw error
  throw new Error('Unexpected response format from backend');
};

// Get all transformers (for backwards compatibility with existing code)
export const getAllTransformers = async () => {
  try {
    // Try to get the first page to see the response format
    const firstPageResponse = await getTransformers(0, 100);

    // If it's a mock paginated response (backend returning array), just get all data directly
    if (firstPageResponse.totalElements <= 100) {
      return firstPageResponse.content;
    }

    // If it's truly paginated, collect all pages
    let allTransformers = [...firstPageResponse.content];
    let page = 1;
    let hasMore = !firstPageResponse.last;

    while (hasMore) {
      const pagedResponse = await getTransformers(page, 100);
      allTransformers = [...allTransformers, ...pagedResponse.content];
      hasMore = !pagedResponse.last;
      page++;
    }

    return allTransformers;
  } catch (error) {
    console.error('Error in getAllTransformers:', error);
    // Fallback: try to get data directly without pagination
    try {
      const response = await axios.get('/transformers');
      return Array.isArray(response.data) ? response.data : [];
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return [];
    }
  }
};

// Get transformer by ID
export const getTransformerById = async id => {
  const response = await axios.get(`/transformers/${id}`);
  return response.data;
};

// Create new transformer
export const createTransformer = async transformerData => {
  const response = await axios.post('/transformers', transformerData);
  return response.data;
};

// Update transformer
export const updateTransformer = async (id, transformerData) => {
  const response = await axios.put(`/transformers/${id}`, transformerData);
  return response.data;
};

// Delete transformer
export const deleteTransformer = async id => {
  const response = await axios.delete(`/transformers/${id}`);
  return response.data;
};
