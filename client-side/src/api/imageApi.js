import axios from './axiosConfig';

// Transformer image APIs
export const uploadTransformerImage = async (
  transformerId,
  file,
  uploaderName = '',
) => {
  const formData = new FormData();
  formData.append('file', file);
  if (uploaderName) {
    formData.append('uploaderName', uploaderName);
  }

  const response = await axios.post(
    `/images/transformers/${transformerId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
};

export const getTransformerImage = async transformerId => {
  const response = await axios.get(`/images/transformers/${transformerId}`);
  return response.data; // This will return the JSON object with imageUrl
};

export const deleteTransformerImage = async transformerId => {
  const response = await axios.delete(`/images/transformers/${transformerId}`);
  return response.data;
};

// Inspection image APIs
export const uploadInspectionImage = async (
  inspectionId,
  file,
  environmentalCondition = '',
  uploaderName = '',
) => {
  const formData = new FormData();
  formData.append('file', file);
  if (environmentalCondition) {
    formData.append('environmentalCondition', environmentalCondition);
  }
  if (uploaderName) {
    formData.append('uploaderName', uploaderName);
  }

  const response = await axios.post(
    `/images/inspections/${inspectionId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
};

export const getInspectionImage = async inspectionId => {
  const response = await axios.get(`/images/inspections/${inspectionId}`);
  return response.data; // This will return the JSON object with imageUrl
};

export const deleteInspectionImage = async inspectionId => {
  const response = await axios.delete(`/images/inspections/${inspectionId}`);
  return response.data;
};

// Helper function to check if image exists
export const checkImageExists = async url => {
  try {
    const response = await axios.head(url);
    return response.status === 200;
  } catch {
    return false;
  }
};
