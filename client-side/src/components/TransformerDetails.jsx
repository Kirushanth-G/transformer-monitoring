import React from 'react';
import { useParams } from 'react-router-dom';
import { SearchIcon, StarIcon } from './ui/icons';
import { displayValue, isNullValue } from '../utils/displayHelpers';
import TransformerActionDropdown from './TransformerActionDropdown';

// Example props: transformer, inspections, favorites, toggleFavorite
function TransformerDetails({ transformer, inspections, favorites, toggleFavorite }) {
  // If using route params to fetch transformer, you can use:
  // const { id } = useParams();

  if (!transformer) {
    return <div className="p-8 text-center text-gray-500">Transformer not found.</div>;
  }

  return (
    <div>
      {/* Transformer Details Card */}
      <div className="mb-6 rounded-lg bg-[#F5F5F5] p-6 shadow-md flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#36454F]">Transformer Details</h2>
          <button
            onClick={() => toggleFavorite(transformer.transformerId)}
            className="focus:outline-none"
            title={favorites.includes(transformer.transformerId) ? 'Unfavorite' : 'Favorite'}
          >
            <StarIcon
              className={`h-7 w-7 ${favorites.includes(transformer.transformerId) ? 'text-blue-800' : 'text-gray-400'}`}
              filled={favorites.includes(transformer.transformerId)}
            />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <span className="font-semibold text-gray-700">Transformer No:</span>
            <span className="ml-2">{displayValue(transformer.transformerId)}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Pole No:</span>
            <span className="ml-2">{displayValue(transformer.poleNo)}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Location:</span>
            <span className="ml-2">{displayValue(transformer.location)}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Type:</span>
            <span className="ml-2">{displayValue(transformer.type)}</span>
          </div>
          {/* Add more fields as needed */}
        </div>
      </div>

      {/* Inspection Details Table */}
      <div className="overflow-x-auto rounded-lg bg-[#F5F5F5] shadow-md">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-[#B0E0E6] text-[#36454F]">
              <th className="px-6 py-3 text-left font-bold">Inspection No.</th>
              <th className="px-6 py-3 text-left font-bold">Inspected Date</th>
              <th className="px-6 py-3 text-left font-bold">Maintenance Date</th>
              <th className="px-6 py-3 text-left font-bold">Status</th>
              <th className="px-6 py-3 text-center font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inspections && inspections.length > 0 ? (
              inspections.map((inspection, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} transition-colors duration-150 hover:bg-gray-100`}>
                  <td className="px-6 py-4">{displayValue(inspection.inspectionId)}</td>
                  <td className="px-6 py-4">{displayValue(inspection.inspectedDate)}</td>
                  <td className="px-6 py-4">{displayValue(inspection.maintenanceDate)}</td>
                  <td className="px-6 py-4">{displayValue(inspection.status)}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="rounded bg-[#B0E0E6] px-3 py-1 font-bold text-[#566D7E] hover:bg-[#B0CFDE]">
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                  No inspections found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransformerDetails;
