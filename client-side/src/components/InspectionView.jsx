import React, { useState, useMemo } from 'react';
import { SearchIcon, StarIcon } from './ui/icons';
import { displayValue, isNullValue } from '../utils/displayHelpers';
import InspectionActionDropdown from './InspectionActionDropdown';

function InspectionView({
  inspections,
  favorites,
  toggleFavorite,
  onEdit,
  onDelete,
  onView,
  isLoading,
}) {
  // Local filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('inspectionId');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortField, setSortField] = useState('inspectionId');
  const [sortOrder, setSortOrder] = useState('desc'); // Default to descending order

  // Status color mapping
  const getStatusColor = status => {
    // Handle null/undefined values
    if (status === null || status === undefined || status === '') {
      return 'bg-gray-100 text-gray-600';
    }

    switch (status) {
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
    const safeInspections = Array.isArray(inspections) ? inspections : [];
    const uniqueStatuses = new Set(
      safeInspections.map(inspection => inspection.status || 'Null'),
    );
    return ['All Status', ...uniqueStatuses];
  }, [inspections]);

  // Apply filters to the inspections
  const filteredInspections = useMemo(() => {
    const safeInspections = Array.isArray(inspections) ? inspections : [];
    return safeInspections.filter(inspection => {
      // Search filter - handle null values
      const searchMatch =
        searchTerm === '' ||
        (searchField === 'inspectionId' &&
          (inspection.inspectionId || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (searchField === 'transformerId' &&
          (inspection.transformerId || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      // Favorites filter
      const favoriteMatch =
        !showFavoritesOnly || favorites.includes(inspection.inspectionId);

      // Status filter - handle null values
      const statusMatch =
        statusFilter === 'All Status' ||
        (inspection.status || 'Null') === statusFilter;

      return searchMatch && favoriteMatch && statusMatch;
    });
  }, [
    inspections,
    searchTerm,
    searchField,
    showFavoritesOnly,
    favorites,
    statusFilter,
  ]);

  const handleSort = field => {
    if (sortField === field) {
      setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to descending when switching fields
    }
  };

  const sortedInspections = useMemo(() => {
    const safeInspections = [...filteredInspections];
    return safeInspections.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [filteredInspections, sortField, sortOrder]);

  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      {/* Filter Controls */}
      <div className='mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-[#F5F5F5] p-4 shadow-md'>
        {/* Search Bar - Unified Design */}
        <div className='w-[420px]'>
          <div className='flex overflow-hidden rounded-md border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500'>
            <select
              value={searchField}
              onChange={e => setSearchField(e.target.value)}
              className='w-[170px] border-0 bg-[#F5F5F5] px-2 py-2 text-gray-700 focus:outline-none'
            >
              <option value='inspectionId'>By Inspection No.</option>
              <option value='transformerId'>By Transformer No.</option>
            </select>
            <div className='w-[1px] self-stretch bg-gray-300'></div>
            <div className='relative flex-grow'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                <SearchIcon className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='text'
                placeholder={`Search ${searchField === 'inspectionId' ? 'Inspection No.' : 'Transformer No.'}`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full border-0 py-2 pr-4 pl-10 focus:outline-none'
              />
            </div>
          </div>
        </div>

        {/* Favorite Filter - Star Icon */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className='flex items-center rounded-full p-2 transition-colors hover:bg-gray-100 focus:outline-none'
          title={
            showFavoritesOnly ? 'Show all inspections' : 'Show favorites only'
          }
        >
          {showFavoritesOnly ? (
            <StarIcon className='h-6 w-6 text-blue-800' filled={true} />
          ) : (
            <StarIcon className='h-6 w-6 text-gray-400' filled={false} />
          )}
        </button>

        {/* Status Dropdown */}
        <div className='min-w-[180px]'>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button as Text Link with Bold on Hover */}
        <button
          onClick={resetFilters}
          className='inline-flex items-center rounded-lg bg-blue-200 px-4 py-2 font-bold text-[#1e3a8a] hover:bg-blue-300 transition-colors duration-150 focus:outline-none'
        >
          Reset Filters
        </button>
      </div>

      {/* Inspection Table */}
      <div className='overflow-x-auto rounded-lg bg-[#F5F5F5] shadow-md'>
        <table className='min-w-full table-auto'>
          <thead>
            <tr className='bg-blue-200 text-[#36454F]'>
              <th className='w-12 px-6 py-3 text-center font-bold'> </th>
              <th className='px-6 py-3 text-left font-bold'>Transformer No.</th>
              <th
                className='px-6 py-3 text-left font-bold cursor-pointer'
                onClick={() => handleSort('inspectionId')}
              >
                Inspection No.
                {sortField === 'inspectionId' && (
                  <span className='ml-2 text-sm'>
                    {sortOrder === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
              <th className='px-6 py-3 text-left font-bold'>Inspected Date</th>
              <th className='px-6 py-3 text-left font-bold'>
                Maintenance Date
              </th>
              <th className='px-6 py-3 text-left font-bold'>Status</th>
              <th className='px-6 py-3 text-center font-bold'>Action</th>
              <th className='w-12 px-3 py-3 text-center font-bold'></th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {sortedInspections.map((inspection, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} transition-colors duration-150 hover:bg-gray-100`}
              >
                <td className='px-6 py-4 text-center'>
                  <button
                    onClick={() => toggleFavorite(inspection.inspectionId)}
                    className='focus:outline-none'
                  >
                    {favorites.includes(inspection.inspectionId) ? (
                      <StarIcon
                        className='h-6 w-6 text-blue-800'
                        filled={true}
                      />
                    ) : (
                      <StarIcon
                        className='h-6 w-6 text-gray-400'
                        filled={false}
                      />
                    )}
                  </button>
                </td>
                <td className='px-6 py-4'>
                  <div className='flex flex-col'>
                    <span
                      className={
                        isNullValue(inspection.transformerId)
                          ? 'text-gray-400 italic'
                          : ''
                      }
                    >
                      {displayValue(inspection.transformerId)}
                    </span>
                    <span
                      className={`text-xs ${isNullValue(inspection.transformerName) ? 'text-gray-400 italic' : 'text-gray-500'}`}
                    >
                      {displayValue(inspection.transformerName)}
                    </span>
                  </div>
                </td>
                <td className='px-6 py-4'>
                  <span
                    className={
                      isNullValue(inspection.inspectionId)
                        ? 'text-gray-400 italic'
                        : ''
                    }
                  >
                    {displayValue(inspection.inspectionId)}
                  </span>
                </td>
                <td className='px-6 py-4'>
                  {formatDate(inspection.inspectedAt)}
                </td>
                <td className='px-6 py-4'>
                  {inspection.maintenanceAt ? formatDate(inspection.maintenanceAt) : 'Not Scheduled Yet'}
                </td>
                <td className='px-6 py-4'>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(inspection.status)}`}
                  >
                    {displayValue(inspection.status)}
                  </span>
                </td>
                <td className='px-6 py-4 text-center'>
                  <button
                    onClick={() => onView && onView(inspection)}
                    className='rounded bg-blue-600 px-3 py-1 font-bold text-white hover:bg-blue-700'
                  >
                    View
                  </button>
                </td>
                <td className='px-3 py-4 text-center'>
                  <InspectionActionDropdown
                    inspection={inspection}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isLoading={isLoading}
                  />
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
