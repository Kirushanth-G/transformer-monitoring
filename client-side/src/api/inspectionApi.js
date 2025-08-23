import axios from './axiosConfig';

// Get paginated inspections
export const getInspections = async (page = 0, size = 10) => {
  const response = await axios.get('/inspections', {
    params: { page, size },
  });
  return response.data;
};

// Get all inspections (for backwards compatibility with existing code)
export const getAllInspections = async () => {
  let allInspections = [];
  let page = 0;
  const size = 100; // Large page size to minimize requests
  let hasMore = true;

  while (hasMore) {
    const pagedResponse = await getInspections(page, size);
    allInspections = [...allInspections, ...pagedResponse.content];
    hasMore = !pagedResponse.last;
    page++;
  }

  return allInspections;
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
