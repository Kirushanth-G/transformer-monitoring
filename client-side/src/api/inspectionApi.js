import axios from './axiosConfig';

// Get paginated inspections
export const getInspections = async (page = 0, size = 10) => {
  const response = await axios.get('/inspections', {
    params: { page, size },
  });

  console.log('API Response for getInspections:', response.data);

  // Check if response is already paginated
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

// Get all inspections (for backwards compatibility with existing code)
export const getAllInspections = async () => {
  try {
    // Try to get the first page to see the response format
    const firstPageResponse = await getInspections(0, 100);

    // If it's a mock paginated response (backend returning array), just get all data directly
    if (firstPageResponse.totalElements <= 100) {
      return firstPageResponse.content;
    }

    // If it's truly paginated, collect all pages
    let allInspections = [...firstPageResponse.content];
    let page = 1;
    let hasMore = !firstPageResponse.last;

    while (hasMore) {
      const pagedResponse = await getInspections(page, 100);
      allInspections = [...allInspections, ...pagedResponse.content];
      hasMore = !pagedResponse.last;
      page++;
    }

    return allInspections;
  } catch (error) {
    console.error('Error in getAllInspections:', error);
    // Fallback: try to get data directly without pagination
    try {
      const response = await axios.get('/inspections');
      return Array.isArray(response.data) ? response.data : [];
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return [];
    }
  }
};

// Get inspection by ID
export const getInspectionById = async id => {
  const response = await axios.get(`/inspections/${id}`);
  return response.data;
};

// Create new inspection
export const createInspection = async inspectionData => {
  const response = await axios.post('/inspections', inspectionData);
  return response.data;
};

// Update inspection
export const updateInspection = async (id, inspectionData) => {
  const response = await axios.put(`/inspections/${id}`, inspectionData);
  return response.data;
};

// Delete inspection
export const deleteInspection = async id => {
  const response = await axios.delete(`/inspections/${id}`);
  return response.data;
};
