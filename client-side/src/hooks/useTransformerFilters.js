import { useState, useMemo } from 'react';

export const useTransformerFilters = (transformers, favorites) => {
  // Core filter state - only what you need
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('id'); // 'id' for transformer no (transformerId)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [locationFilter, setLocationFilter] = useState('All Regions'); // region
  const [typeFilter, setTypeFilter] = useState('All Types'); // type

  // Group filters for cleaner usage
  const filters = {
    searchTerm,
    searchField,
    showFavoritesOnly,
    locationFilter,
    typeFilter,
  };

  const setters = {
    setSearchTerm,
    setSearchField,
    setShowFavoritesOnly,
    setLocationFilter,
    setTypeFilter,
  };

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
      ...new Set(
        safeTransformers.map(t => t.location || 'Null').filter(Boolean),
      ),
    ];
    const types = [
      'All Types',
      ...new Set(safeTransformers.map(t => t.type || 'Null').filter(Boolean)),
    ];

    return { locations, types };
  }, [safeTransformers]);

  // Apply all filters to transformers
  const filteredTransformers = useMemo(() => {
    return safeTransformers.filter(transformer => {
      // Search filter - using the selected search field, handle null values
      const searchMatch =
        searchTerm === '' ||
        (searchField === 'id' &&
          (transformer.transformerId || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (searchField === 'poleNo' &&
          (transformer.poleNo || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      // Favorites filter
      const favoriteMatch =
        !showFavoritesOnly || favorites.includes(transformer.transformerId);

      // Location filter (region) - handle null values
      const locationMatch =
        locationFilter === 'All Regions' ||
        (transformer.location || 'Null') === locationFilter;

      // Type filter - handle null values
      const typeMatch =
        typeFilter === 'All Types' ||
        (transformer.type || 'Null') === typeFilter;

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
    filters,
    setters,
    filterOptions,
    filteredTransformers,
    resetFilters,
  };
};
