import axios from '../api/axiosConfig';

const API_URL = '/api/maintenance-records';

export const MaintenanceService = {
  // Records
  createRecord: (data) => axios.post(API_URL, data),
  getRecordByInspection: (inspectionId) => axios.get(`${API_URL}/inspection/${inspectionId}`),
  updateRecord: (id, data) => axios.put(`${API_URL}/${id}`, data),
  finalizeRecord: (id) => axios.post(`${API_URL}/${id}/finalize`),

  // Electrical Readings
  addReadings: (recordId, readings) => axios.post(`${API_URL}/${recordId}/electrical-readings`, readings),

  // Schematic
  saveSchematic: (inspectionId, jsonState) =>
    axios.post(`${API_URL}/inspections/${inspectionId}/schematic`, {
      diagramState: JSON.stringify(jsonState)
    }),
  getSchematic: (inspectionId) => axios.get(`${API_URL}/inspections/${inspectionId}/schematic`),

  // Listing
  getAllRecords: (page = 0, size = 10) => axios.get(`${API_URL}?page=${page}&size=${size}`)
};
