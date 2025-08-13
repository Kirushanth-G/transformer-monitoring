import React from 'react';

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
  resetFilters
}) {
  // Extract unique locations and types for dropdowns
  const locations = ['All Regions', ...new Set(transformers.map(t => t.location))];
  const types = ['All Types', ...new Set(transformers.map(t => t.type))];
  
  // Filter transformers based on all active filters
  const filteredTransformers = transformers.filter(transformer => {
    // Search filter - using the selected search field
    const searchMatch = searchTerm === '' || 
      (searchField === 'id' && transformer.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (searchField === 'poleNo' && transformer.poleNo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Favorites filter
    const favoriteMatch = !showFavoritesOnly || favorites.includes(transformer.id);
    
    // Location filter
    const locationMatch = locationFilter === 'All Regions' || transformer.location === locationFilter;
    
    // Type filter
    const typeMatch = typeFilter === 'All Types' || transformer.type === typeFilter;
    
    return searchMatch && favoriteMatch && locationMatch && typeMatch;
  });

  return (
    <>
      {/* Filter Controls */}
      <div className="mb-6 bg-[#F5F5F5] p-4 rounded-lg shadow-md flex flex-wrap items-center gap-4">
        {/* Search Bar - Unified Design */}
        <div className="w-[400px]">
          <div className="flex border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="w-[150px] bg-[#F5F5F5] text-gray-400 py-2 px-3 border-0 focus:outline-none appearance-none"
            >
              <option value="id">Transformer No.</option>
              <option value="poleNo">Pole No.</option>
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
                placeholder={`Search by ${searchField === 'id' ? 'Transformer No.' : 'Pole No.'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-0 focus:outline-none"
              />
            </div>
          </div>
        </div>
        
        {/* Favorite Filter - Star Icon Only */}
        <button 
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className="focus:outline-none flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors"
          title={showFavoritesOnly ? "Show all transformers" : "Show favorites only"}
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
        
        {/* Location Dropdown */}
        <div className="min-w-[180px]">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
        
        {/* Type Dropdown */}
        <div className="min-w-[150px]">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
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

      {/* Transformer Table */}
      <div className="overflow-x-auto bg-[#F5F5F5] rounded-lg shadow-md">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-[#B0E0E6] text-[#36454F]">
              <th className="px-6 py-3 text-center font-bold w-12"> </th>
              <th className="px-6 py-3 text-left font-bold">Transformer No.</th>
              <th className="px-6 py-3 text-left font-bold">Pole No.</th>
              <th className="px-6 py-3 text-left font-bold">Location</th>
              <th className="px-6 py-3 text-left font-bold">Type</th>
              <th className="px-6 py-3 text-center font-bold"></th>
              <th className="px-3 py-3 text-center font-bold w-12"> </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTransformers.map((transformer, index) => (
              <tr 
                key={index} 
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150`}
              >
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => toggleFavorite(transformer.id)}
                    className="focus:outline-none"
                  >
                    {favorites.includes(transformer.id) ? (
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
                <td className="px-6 py-4">{transformer.id}</td>
                <td className="px-6 py-4">{transformer.poleNo}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {transformer.location}
                    <a 
                      href={transformer.mapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transformer.type === 'Bulk' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {transformer.type}
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
    </>
  );
}

export default TransformerView;