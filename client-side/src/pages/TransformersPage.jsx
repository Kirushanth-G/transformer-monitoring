import { useState } from 'react';
import TransformerView from '../components/TransformerView';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTransformers } from '../hooks/useTransformers';
import { useFavorites } from '../hooks/useFavorites';

function TransformersPage() {
  // API hooks
  const { transformers, loading, error } = useTransformers();

  // Favorites hook
  const { favorites, toggleFavorite } = useFavorites();

  // Local filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [locationFilter, setLocationFilter] = useState('All Regions');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [searchField, setSearchField] = useState('id');

  const resetFilters = () => {
    setSearchTerm('');
    setShowFavoritesOnly(false);
    setLocationFilter('All Regions');
    setTypeFilter('All Types');
  };

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-[#E5E4E2] p-8'>
        <LoadingSpinner message='Loading transformers...' />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='min-h-screen bg-[#E5E4E2] p-8'>
        <div className='flex flex-col items-center justify-center p-8'>
          <div className='mb-2 text-lg font-semibold text-red-600'>
            Error loading transformers
          </div>
          <div className='mb-4 text-gray-600'>{error}</div>
          <button
            onClick={() => window.location.reload()}
            className='rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Ensure we have transformers data
  if (!transformers || !Array.isArray(transformers)) {
    return (
      <div className='min-h-screen bg-[#E5E4E2] p-8'>
        <div className='flex flex-col items-center justify-center p-8'>
          <div className='mb-2 text-lg font-semibold text-gray-600'>
            No transformer data available
          </div>
          <button
            onClick={() => window.location.reload()}
            className='rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#E5E4E2] p-8'>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Transformers</h1>
          <p className='text-gray-600'>Manage and monitor power transformers</p>
        </div>
        <button className='flex items-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='mr-2 h-5 w-5'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
              clipRule='evenodd'
            />
          </svg>
          Add Transformer
        </button>
      </div>

      {/* Transformer View Component */}
      <TransformerView
        transformers={transformers}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchField={searchField}
        setSearchField={setSearchField}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        resetFilters={resetFilters}
      />
    </div>
  );
}

export default TransformersPage;
