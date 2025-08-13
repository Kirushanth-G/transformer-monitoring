// filepath: d:\semi 7\Software design project\WebApp repo\transformer-monitoring\client-side\src\components\InspectionView.jsx
import React, { useState, useMemo } from 'react';

function InspectionView({ inspections, favorites, toggleFavorite }) {
  // Local filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('inspectionId');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All Status');

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

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setShowFavoritesOnly(false);
    setStatusFilter('All Status');
  };

  // Extract unique status values for the dropdown
  const statuses = useMemo(() => {
    const uniqueStatuses = new Set(inspections.map(inspection => inspection.status));
    return ['All Status', ...uniqueStatuses];
  }, [inspections]);

  // Apply filters to the inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter(inspection => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        (searchField === 'inspectionId' && inspection.inspectionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (searchField === 'transformerId' && inspection.transformerId.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Favorites filter
      const favoriteMatch = !showFavoritesOnly || favorites.includes(inspection.inspectionId);
      
      // Status filter
      const statusMatch = statusFilter === 'All Status' || inspection.status === statusFilter;
      
      return searchMatch && favoriteMatch && statusMatch;
    });
  }, [inspections, searchTerm, searchField, showFavoritesOnly, favorites, statusFilter]);

  return (
    <div>
      {/* Filter Controls */}
      <div className="mb-6 bg-[#F5F5F5] p-4 rounded-lg shadow-md flex flex-wrap items-center gap-4">
        {/* Search Bar - Unified Design */}
        <div className="w-[420px]">
          <div className="flex border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="w-[150px] bg-[#F5F5F5] text-gray-400 py-2 px-3 border-0 focus:outline-none appearance-none"
            >
              <option value="inspectionId">Inspection No.</option>
              <option value="transformerId">Transformer No.</option>
            </select>
            <div className="w-[1px] self-stretch bg-gray-300"></div>
            <div className="flex-grow relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={`Search by ${searchField === 'inspectionId' ? 'Inspection No.' : 'Transformer No.'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-0 focus:outline-none"
              />
            </div>
          </div>
        </div>
        
        {/* Favorite Filter - Star Icon */}
        <button 
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className="focus:outline-none flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors"
          title={showFavoritesOnly ? "Show all inspections" : "Show favorites only"}
        >
          {showFavoritesOnly ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-800" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )}
        </button>
        
        {/* Status Dropdown */}
        <div className="min-w-[180px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        
        {/* Reset Button as Text Link with Bold on Hover */}
        <button
          onClick={resetFilters}
          className="text-blue-900 hover:text-blue-500 duration-150 font-bold focus:outline-none "
        >
          Reset Filters
        </button>
      </div>

      {/* Inspection Table */}
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
            {filteredInspections.map((inspection, index) => (
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
    </div>
  );
}

export default InspectionView;