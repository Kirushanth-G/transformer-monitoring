import { useState, useMemo } from 'react';

export const useTransformerFilters = (transformers, favorites) => {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [locationFilter, setLocationFilter] = useState('All Regions');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [searchField, setSearchField] = useState('id');

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setShowFavoritesOnly(false);
    setLocationFilter('All Regions');
    setTypeFilter('All Types');
  };

  // Ensure transformers is always an array
  const safeTransformers = useMemo(
    () => (Array.isArray(transformers) ? transformers : []),
    [transformers],
  );

  // Extract unique locations and types for dropdowns
  const filterOptions = useMemo(() => {
    const locations = [
      'All Regions',
      ...new Set(safeTransformers.map(t => t.location).filter(Boolean)),
    ];
    const types = [
      'All Types',
      ...new Set(safeTransformers.map(t => t.type).filter(Boolean)),
    ];

    return { locations, types };
  }, [safeTransformers]);

  // Apply all filters to transformers
  const filteredTransformers = useMemo(() => {
    return safeTransformers.filter(transformer => {
      // Search filter - using the selected search field
      const searchMatch =
        searchTerm === '' ||
        (searchField === 'id' &&
          transformer.id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (searchField === 'poleNo' &&
          transformer.poleNo?.toLowerCase().includes(searchTerm.toLowerCase()));

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
  }, [
    safeTransformers,
    searchTerm,
    searchField,
    showFavoritesOnly,
    favorites,
    locationFilter,
    typeFilter,
  ]);

  return {
    // Filter state
    searchTerm,
    setSearchTerm,
    showFavoritesOnly,
    setShowFavoritesOnly,
    locationFilter,
    setLocationFilter,
    typeFilter,
    setTypeFilter,
    searchField,
    setSearchField,

    // Filter options
    filterOptions,

    // Filtered results
    filteredTransformers,

    // Reset function
    resetFilters,
  };
};
