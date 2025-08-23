import axios from './axiosConfig';

// Get paginated transformers
export const getTransformers = async (page = 0, size = 10) => {
  const response = await axios.get('/transformers', {
    params: { page, size },
  });
  return response.data;
};

// Get all transformers (for backwards compatibility with existing code)
export const getAllTransformers = async () => {
  let allTransformers = [];
  let page = 0;
  const size = 100; // Large page size to minimize requests
  let hasMore = true;

  while (hasMore) {
    const pagedResponse = await getTransformers(page, size);
    allTransformers = [...allTransformers, ...pagedResponse.content];
    hasMore = !pagedResponse.last;
    page++;
  }

  return allTransformers;
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
