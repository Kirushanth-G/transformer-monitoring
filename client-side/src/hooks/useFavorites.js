import { useState, useCallback } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = useCallback(id => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id],
    );
  }, []);

  return { favorites, toggleFavorite };
};
