import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import LoadingSpinner from '../components/LoadingSpinner';


function TransformerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transformer, setTransformer] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const transformerResponse = await api.get(`/transformers/${id}`);
        const inspectionsResponse = await api.get(`/inspections?transformerId=${id}`);

        setTransformer(transformerResponse.data);
        setInspections(inspectionsResponse.data);
      } catch (err) {
        console.error('Error fetching details:', err);
        setError('Failed to fetch transformer details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className='min-h-screen bg-[#E5E4E2] p-8'>
        <LoadingSpinner message='Loading...' />
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className='p-8'>
      {/* Transformer Summary Card */}
      {transformer && (
        <div className='mb-8 rounded-lg bg-white p-6 shadow-md'>
          <div className='flex justify-between'>
            <div className='flex items-center'>
              <button
                onClick={() => navigate(-1)}
                className='mr-4 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
              >
                <span className='mr-2'>◀</span>
              </button>
              <div>
                <h1 className='text-3xl font-bold'>{transformer.transformerId}</h1>
                <p className='text-gray-600'>{transformer.location}</p>
              </div>
            </div>
            <p className='text-sm text-gray-500'>Last Inspected: {transformer.lastInspectedDate || 'N/A'}</p>
          </div>
          <div className='mt-4 grid grid-cols-4 gap-4'>
            <div className='rounded-lg bg-gray-100 p-4 text-center'>
              <p className='text-sm text-gray-500'>Pole No</p>
              <p className='text-lg font-bold'>{transformer.poleNo || 'N/A'}</p>
            </div>
            <div className='rounded-lg bg-gray-100 p-4 text-center'>
              <p className='text-sm text-gray-500'>Capacity</p>
              <p className='text-lg font-bold'>{transformer.capacity || 'N/A'}</p>
            </div>
            <div className='rounded-lg bg-gray-100 p-4 text-center'>
              <p className='text-sm text-gray-500'>Type</p>
              <p className='text-lg font-bold'>{transformer.type || 'N/A'}</p>
            </div>
            <div className='rounded-lg bg-gray-100 p-4 text-center'>
              <p className='text-sm text-gray-500'>No. of Feeders</p>
              <p className='text-lg font-bold'>{transformer.feeders || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Transformer Inspections Section */}
      <div className='mb-8'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-bold'>Transformer Inspections</h2>
          <button className='rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'>
            Add Inspection
          </button>
        </div>
        <div className='overflow-x-auto rounded-lg bg-white shadow-md'>
          <table className='min-w-full table-auto'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='px-4 py-2 text-left text-sm font-medium text-gray-600'>Inspection No</th>
                <th className='px-4 py-2 text-left text-sm font-medium text-gray-600'>Inspected Date</th>
                <th className='px-4 py-2 text-left text-sm font-medium text-gray-600'>Maintenance Date</th>
                <th className='px-4 py-2 text-left text-sm font-medium text-gray-600'>Status</th>
                <th className='px-4 py-2 text-left text-sm font-medium text-gray-600'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map(inspection => (
                <tr key={inspection.id} className='hover:bg-gray-50'>
                  <td className='px-4 py-2 text-sm text-gray-700'>{inspection.id}</td>
                  <td className='px-4 py-2 text-sm text-gray-700'>{inspection.inspectedDate || 'N/A'}</td>
                  <td className='px-4 py-2 text-sm text-gray-700'>{inspection.maintenanceDate || 'N/A'}</td>
                  <td className='px-4 py-2 text-sm'>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        inspection.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : inspection.status === 'Pending'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {inspection.status}
                    </span>
                  </td>
                  <td className='px-4 py-2 text-sm'>
                    <button className='rounded bg-purple-600 px-3 py-1 text-white hover:bg-purple-700'>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TransformerDetailsPage;
