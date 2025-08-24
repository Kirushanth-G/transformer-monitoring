import React, { useState } from 'react';
import { SearchIcon, StarIcon } from './ui/icons';
import { displayValue, isNullValue } from '../utils/displayHelpers';
import TransformerActionDropdown from './TransformerActionDropdown';

function TransformerView({
  transformers,
  filterOptions,
  favorites,
  toggleFavorite,
  searchTerm,
  setSearchTerm,
  searchField,
  setSearchField,
  showFavoritesOnly,
  setShowFavoritesOnly,
  locationFilter,
  setLocationFilter,
  typeFilter,
  setTypeFilter,
  resetFilters,
  onDeleteTransformer,
  onEditTransformer,
  onViewTransformer,
  isDeleting,
}) {
  // Use pre-filtered transformers from the filter hook
  const filteredTransformers = transformers;

  // Use filter options from the filter hook
  const { locations, types } = filterOptions;

  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const sortedTransformers = [...transformers].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.transformerId.localeCompare(b.transformerId);
    } else {
      return b.transformerId.localeCompare(a.transformerId);
    }
  });

  return (
    <>
      {/* Filter Controls */}
      <div className='mb-4 rounded-lg bg-[#F5F5F5] p-3 shadow-md sm:mb-6 sm:p-4'>
        {/* Mobile: stacked layout, Desktop: single row layout */}
        <div className='flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center'>
          {/* Search Bar */}
          <div className='w-full lg:flex-1'>
            <div className='flex flex-col overflow-hidden rounded-md border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 sm:flex-row'>
              <select
                value={searchField}
                onChange={e => setSearchField(e.target.value)}
                className='w-full border-0 bg-[#F5F5F5] px-2 py-2 text-sm text-gray-700 focus:outline-none sm:w-[170px] sm:text-base'
              >
                <option value='id'>By Transformer No.</option>
                <option value='poleNo'>By Pole No.</option>
              </select>
              <div className='hidden w-[1px] self-stretch bg-gray-300 sm:block'></div>
              <div className='relative flex-grow'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                  <SearchIcon className='h-4 w-4 text-gray-400 sm:h-5 sm:w-5' />
                </div>
                <input
                  type='text'
                  placeholder={`Search ${
                    searchField === 'id' ? 'Transformer No.' : 'Pole No.'
                  }`}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full border-0 py-2 pr-4 pl-9 text-sm focus:outline-none sm:pl-10 sm:text-base'
                />
              </div>
            </div>
          </div>

          {/* Filters row - now on same line for desktop */}
          <div className='flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4 lg:flex-shrink-0'>
            {/* Favorite Filter - Star Icon */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className='flex items-center justify-center rounded-full p-2 transition-colors hover:bg-gray-100 focus:outline-none'
              title={
                showFavoritesOnly
                  ? 'Show all transformers'
                  : 'Show favorites only'
              }
            >
              {showFavoritesOnly ? (
                <StarIcon
                  className='h-5 w-5 text-blue-800 sm:h-6 sm:w-6'
                  filled={true}
                />
              ) : (
                <StarIcon
                  className='h-5 w-5 text-gray-400 sm:h-6 sm:w-6'
                  filled={false}
                />
              )}
            </button>

            {/* Dropdowns - stack on mobile, row on larger screens */}
            <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4'>
              {/* Location Dropdown */}
              <div className='w-full sm:min-w-[180px] lg:w-auto'>
                <select
                  value={locationFilter}
                  onChange={e => setLocationFilter(e.target.value)}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-base'
                >
                  {locations.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Dropdown */}
              <div className='w-full sm:min-w-[150px] lg:w-auto'>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-base'
                >
                  {types.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              className='inline-flex w-full items-center justify-center rounded-lg bg-blue-200 px-4 py-2 text-sm font-bold whitespace-nowrap text-[#1e3a8a] transition-colors duration-150 hover:bg-blue-300 focus:outline-none sm:w-auto sm:text-base'
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transformer Table */}
      <div className='overflow-x-auto rounded-lg bg-[#F5F5F5] shadow-md'>
        <table className='min-w-full table-auto'>
          <thead>
            <tr className='bg-blue-200 text-[#36454F]'>
              <th className='w-8 px-1 py-2 text-center text-xs font-bold sm:py-3 sm:text-sm'>
                {' '}
              </th>
              <th
                className='cursor-pointer px-1 py-2 text-left text-xs font-bold sm:px-2 sm:py-3 sm:text-sm'
                onClick={handleSort}
              >
                <span>Transformer No.</span>
                <span className='ml-1 text-xs sm:ml-2 sm:text-sm'>
                  {sortOrder === 'asc' ? '▲' : '▼'}
                </span>
              </th>
              <th className='px-2 py-2 text-left text-xs font-bold sm:px-6 sm:py-3 sm:text-sm'>
                Pole No.
              </th>
              <th className='hidden px-6 py-3 text-left font-bold sm:table-cell'>
                Location
              </th>
              <th className='px-2 py-2 text-left text-xs font-bold sm:px-6 sm:py-3 sm:text-sm'>
                Type
              </th>
              <th className='px-2 py-2 text-center text-xs font-bold sm:px-6 sm:py-3 sm:text-sm'></th>
              <th className='w-8 px-1 py-2 text-center text-xs font-bold sm:w-12 sm:px-3 sm:py-3 sm:text-sm'>
                {' '}
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {sortedTransformers.map((transformer, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } transition-colors duration-150 hover:bg-gray-100`}
              >
                <td className='px-2 py-3 text-center sm:px-6 sm:py-4'>
                  <button
                    onClick={() => toggleFavorite(transformer.transformerId)}
                    className='focus:outline-none'
                  >
                    {favorites.includes(transformer.transformerId) ? (
                      <StarIcon
                        className='h-4 w-4 text-blue-800 sm:h-6 sm:w-6'
                        filled={true}
                      />
                    ) : (
                      <StarIcon
                        className='h-4 w-4 text-gray-400 sm:h-6 sm:w-6'
                        filled={false}
                      />
                    )}
                  </button>
                </td>
                <td className='px-1 py-3 text-xs sm:px-6 sm:py-4 sm:text-sm'>
                  <span
                    className={
                      isNullValue(transformer.transformerId)
                        ? 'text-gray-400 italic'
                        : ''
                    }
                  >
                    {displayValue(transformer.transformerId)}
                  </span>
                </td>
                <td className='px-2 py-3 text-xs sm:px-6 sm:py-4 sm:text-sm'>
                  <span
                    className={
                      isNullValue(transformer.poleNo)
                        ? 'text-gray-400 italic'
                        : ''
                    }
                  >
                    {displayValue(transformer.poleNo)}
                  </span>
                </td>
                {/* Location - hidden on mobile */}
                <td className='hidden px-6 py-4 sm:table-cell'>
                  <span
                    className={
                      isNullValue(transformer.location)
                        ? 'text-gray-400 italic'
                        : ''
                    }
                  >
                    {displayValue(transformer.location)}
                  </span>
                </td>
                <td className='px-2 py-3 sm:px-6 sm:py-4'>
                  <span
                    className={`rounded-full px-1 py-1 text-xs font-medium sm:px-2 ${
                      transformer.type === 'Bulk'
                        ? 'bg-blue-100 text-blue-800'
                        : transformer.type === null ||
                            transformer.type === undefined ||
                            transformer.type === ''
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {displayValue(transformer.type)}
                  </span>
                </td>
                <td className='px-2 py-3 text-center sm:px-6 sm:py-4'>
                  <button
                    onClick={() => onViewTransformer(transformer)}
                    className='rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-blue-700 sm:px-3 sm:text-sm'
                  >
                    View
                  </button>
                </td>
                <td className='px-1 py-3 text-center sm:px-3 sm:py-4'>
                  <TransformerActionDropdown
                    transformer={transformer}
                    onDelete={onDeleteTransformer}
                    onEdit={onEditTransformer}
                    isLoading={isDeleting === transformer.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default TransformerView;
