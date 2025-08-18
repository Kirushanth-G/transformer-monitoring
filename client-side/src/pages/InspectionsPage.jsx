import InspectionView from '../components/InspectionView';
import LoadingSpinner from '../components/LoadingSpinner';
import { useInspections } from '../hooks/useInspections';
import { PlusIcon } from '../components/ui/icons';
import { useFavorites } from '../hooks/useFavorites';

function InspectionsPage() {
  // API hooks
  const { inspections, loading, error } = useInspections();

  // Favorites hook
  const { favorites, toggleFavorite } = useFavorites();

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-[#E5E4E2] p-8'>
        <LoadingSpinner message='Loading inspections...' />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='min-h-screen bg-[#E5E4E2] p-8'>
        <div className='flex flex-col items-center justify-center p-8'>
          <div className='mb-2 text-lg font-semibold text-red-600'>
            Error loading inspections
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

  // Ensure we have inspections data
  if (!inspections || !Array.isArray(inspections)) {
    return (
      <div className='min-h-screen bg-[#E5E4E2] p-8'>
        <div className='flex flex-col items-center justify-center p-8'>
          <div className='mb-2 text-lg font-semibold text-gray-600'>
            No inspection data available
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
          <h1 className='text-2xl font-bold text-gray-800'>Inspections</h1>
          <p className='text-gray-600'>
            Monitor transformer inspection records
          </p>
        </div>
        <button className='flex items-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'>
          <PlusIcon className='mr-2 h-5 w-5' />
          Add Inspection
        </button>
      </div>

      {/* Inspection View Component */}
      <InspectionView
        inspections={inspections}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />
    </div>
  );
}

export default InspectionsPage;
