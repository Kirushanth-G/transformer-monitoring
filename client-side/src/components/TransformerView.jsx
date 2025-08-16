import React, { useState } from 'react';

function TransformerView({
  transformers,
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
}) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ensure transformers is always an array
  const safeTransformers = Array.isArray(transformers) ? transformers : [];

  // Extract unique locations and types for dropdowns
  const locations = [
    'All Regions',
    ...new Set(safeTransformers.map(t => t.location)),
  ];
  const types = ['All Types', ...new Set(safeTransformers.map(t => t.type))];

  // Filter transformers based on all active filters
  const filteredTransformers = safeTransformers.filter(transformer => {
    // Search filter - using the selected search field
    const searchMatch =
      searchTerm === '' ||
      (searchField === 'id' &&
        transformer.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (searchField === 'poleNo' &&
        transformer.poleNo.toLowerCase().includes(searchTerm.toLowerCase()));

    // Favorites filter
    const favoriteMatch =
      !showFavoritesOnly || favorites.includes(transformer.id);

    // Location filter
    const locationMatch =
      locationFilter === 'All Regions' ||
      transformer.location === locationFilter;

    // Type filter
    const typeMatch =
      typeFilter === 'All Types' || transformer.type === typeFilter;

    return searchMatch && favoriteMatch && locationMatch && typeMatch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransformers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransformers.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showFavoritesOnly, locationFilter, typeFilter]);

  // Page change handler
  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

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
                <svg
                  className='h-5 w-5 text-gray-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
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
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-7 w-7 text-blue-800'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z' />
            </svg>
          ) : (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-7 w-7 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
              />
            </svg>
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
            {currentItems.map((transformer, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} transition-colors duration-150 hover:bg-gray-100`}
              >
                <td className='px-6 py-4 text-center'>
                  <button
                    onClick={() => toggleFavorite(transformer.id)}
                    className='focus:outline-none'
                  >
                    {favorites.includes(transformer.id) ? (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-6 w-6 text-blue-800'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z' />
                      </svg>
                    ) : (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-6 w-6 text-gray-400'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={1.5}
                          d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                        />
                      </svg>
                    )}
                  </button>
                </td>
                <td className='px-6 py-4'>{transformer.id}</td>
                <td className='px-6 py-4'>{transformer.poleNo}</td>
                <td className='px-6 py-4'>
                  <div className='flex items-center'>
                    {transformer.location}
                    <a
                      href={transformer.mapUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='ml-2 text-blue-500 hover:text-blue-700'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='inline h-4 w-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                        />
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                      </svg>
                    </a>
                  </div>
                </td>
                <td className='px-6 py-4'>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      transformer.type === 'Bulk'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {transformer.type}
                  </span>
                </td>
                <td className='px-6 py-4 text-center'>
                  <button className='rounded bg-[#B0E0E6] px-3 py-1 font-bold text-[#566D7E] hover:bg-[#B0CFDE]'>
                    View
                  </button>
                </td>
                <td className='px-3 py-4 text-center'>
                  <button className='rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className='flex items-center justify-between border-t border-gray-200 px-6 py-4'>
          <div className='text-sm text-gray-700'>
            Showing <span className='font-medium'>{indexOfFirstItem + 1}</span>{' '}
            to{' '}
            <span className='font-medium'>
              {Math.min(indexOfLastItem, filteredTransformers.length)}
            </span>{' '}
            of{' '}
            <span className='font-medium'>{filteredTransformers.length}</span>{' '}
            transformers
          </div>

          <div className='flex items-center space-x-2'>
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`rounded-md border px-2 py-1 ${
                currentPage === 1
                  ? 'cursor-not-allowed border-gray-200 text-gray-300'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            </button>

            {/* Page Numbers */}
            <div className='hidden space-x-1 md:flex'>
              {pageNumbers.map(pageNumber => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`border px-3 py-1 ${
                    currentPage === pageNumber
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                  } rounded-md`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            {/* Mobile Page Indicator */}
            <span className='text-sm text-gray-700 md:hidden'>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className={`rounded-md border px-2 py-1 ${
                currentPage === totalPages || totalPages === 0
                  ? 'cursor-not-allowed border-gray-200 text-gray-300'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default TransformerView;
