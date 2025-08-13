// filepath: d:\semi 7\Software design project\WebApp repo\transformer-monitoring\client-side\src\components\InspectionView.jsx
import React from 'react';

function InspectionView({ inspections, favorites, toggleFavorite }) {
  // Status color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto bg-[#F5F5F5] rounded-lg shadow-md">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-[#B0E0E6] text-[#36454F]">
            <th className="px-6 py-3 text-center font-bold w-12"> </th>
            <th className="px-6 py-3 text-left font-bold">Transformer No.</th>
            <th className="px-6 py-3 text-left font-bold">Inspection No.</th>
            <th className="px-6 py-3 text-left font-bold">Inspected Date</th>
            <th className="px-6 py-3 text-left font-bold">Maintenance Date</th>
            <th className="px-6 py-3 text-left font-bold">Status</th>
            <th className="px-6 py-3 text-center font-bold">Action</th>
            <th className="px-3 py-3 text-center font-bold w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {inspections.map((inspection, index) => (
            <tr 
              key={index} 
              className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150`}
            >
              <td className="px-6 py-4 text-center">
                <button 
                  onClick={() => toggleFavorite(inspection.inspectionId)}
                  className="focus:outline-none"
                >
                  {favorites.includes(inspection.inspectionId) ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  )}
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span>{inspection.transformerId}</span>
                  <span className="text-xs text-gray-500">{inspection.transformerName}</span>
                </div>
              </td>
              <td className="px-6 py-4">{inspection.inspectionId}</td>
              <td className="px-6 py-4">{inspection.inspectedDate}</td>
              <td className="px-6 py-4">{inspection.maintenanceDate}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                  {inspection.status}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <button className="bg-[#B0E0E6] hover:bg-[#B0CFDE] text-[#566D7E] font-bold py-1 px-3 rounded">
                  View
                </button>
              </td>
              <td className="px-3 py-4 text-center">
                <button className="text-gray-500 hover:text-gray-700 focus:outline-none rounded-full p-1 hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InspectionView;