import React from 'react';
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
  isDeleting,
}) {
  // Use pre-filtered transformers from the filter hook
  const filteredTransformers = transformers;

  // Use filter options from the filter hook
  const { locations, types } = filterOptions;

  return (
    <>
      {/* Filter Controls */}
      <div className='mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-[#F5F5F5] p-4 shadow-md'>
        {/* Search Bar - Unified Design */}
        <div className='w-[400px]'>
          <div className='flex overflow-hidden rounded-md border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500'>
            <select
              value={searchField}
              onChange={e => setSearchField(e.target.value)}
              className='w-[150px] appearance-none border-0 bg-[#F5F5F5] px-3 py-2 text-gray-400 focus:outline-none'
            >
              <option value='id'>Transformer No.</option>
              <option value='poleNo'>Pole No.</option>
            </select>
            <div className='w-[1px] self-stretch bg-gray-300'></div>
            <div className='relative flex-grow'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                <SearchIcon className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='text'
                placeholder={`Search by ${searchField === 'id' ? 'Transformer No.' : 'Pole No.'}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full border-0 py-2 pr-4 pl-10 focus:outline-none'
              />
            </div>
          </div>
        </div>

        {/* Favorite Filter - Star Icon Only */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className='flex items-center rounded-full p-2 transition-colors hover:bg-gray-100 focus:outline-none'
          title={
            showFavoritesOnly ? 'Show all transformers' : 'Show favorites only'
          }
        >
          {showFavoritesOnly ? (
            <StarIcon className='h-7 w-7 text-blue-800' filled={true} />
          ) : (
            <StarIcon className='h-7 w-7 text-gray-400' filled={false} />
          )}
        </button>

        {/* Location Dropdown */}
        <div className='min-w-[180px]'>
          <select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
          >
            {locations.map(location => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Type Dropdown */}
        <div className='min-w-[150px]'>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button as Text Link with Bold on Hover */}
        <button
          onClick={resetFilters}
          className='font-bold text-blue-900 duration-150 hover:text-blue-500 focus:outline-none'
        >
          Reset Filters
        </button>
      </div>

      {/* Transformer Table */}
      <div className='overflow-x-auto rounded-lg bg-[#F5F5F5] shadow-md'>
        <table className='min-w-full table-auto'>
          <thead>
            <tr className='bg-[#B0E0E6] text-[#36454F]'>
              <th className='w-12 px-6 py-3 text-center font-bold'> </th>
              <th className='px-6 py-3 text-left font-bold'>Transformer No.</th>
              <th className='px-6 py-3 text-left font-bold'>Pole No.</th>
              <th className='px-6 py-3 text-left font-bold'>Location</th>
              <th className='px-6 py-3 text-left font-bold'>Type</th>
              <th className='px-6 py-3 text-center font-bold'></th>
              <th className='w-12 px-3 py-3 text-center font-bold'> </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {filteredTransformers.map((transformer, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} transition-colors duration-150 hover:bg-gray-100`}
              >
                <td className='px-6 py-4 text-center'>
                  <button
                    onClick={() => toggleFavorite(transformer.transformerId)}
                    className='focus:outline-none'
                  >
                    {favorites.includes(transformer.transformerId) ? (
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
                <td className='px-6 py-4'>
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
                <td className='px-6 py-4'>
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
                <td className='px-6 py-4'>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
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
                <td className='px-6 py-4 text-center'>
                  <button className='rounded bg-[#B0E0E6] px-3 py-1 font-bold text-[#566D7E] hover:bg-[#B0CFDE]'>
                    View
                  </button>
                </td>
                <td className='px-3 py-4 text-center'>
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
