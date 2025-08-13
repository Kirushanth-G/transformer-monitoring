// import { useState, useEffect } from 'react';
import { useState, useMemo } from 'react';
import OptimusPrime from '../assets/pictures/optimus-prime.jpg';
import BumbleBee from '../assets/pictures/bumblebee.jpg';
import Megatron from '../assets/pictures/megatron.jpg';
import TransformerView from '../components/TransformerView';
import InspectionView from '../components/InspectionView';

function Home() {
  const [favorites, setFavorites] = useState([]);
  const [inspectionFavorites, setInspectionFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [locationFilter, setLocationFilter] = useState('All Regions');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [searchField, setSearchField] = useState('id');
  const [activeView, setActiveView] = useState('transformers');
  
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };
  
  const toggleInspectionFavorite = (id) => {
    if (inspectionFavorites.includes(id)) {
      setInspectionFavorites(inspectionFavorites.filter(favId => favId !== id));
    } else {
      setInspectionFavorites([...inspectionFavorites, id]);
    }
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setShowFavoritesOnly(false);
    setLocationFilter('All Regions');
    setTypeFilter('All Types');
  };

  // Combined database with flat structure - each object contains both transformer and inspection data
  const database = [
    {
      id: "210019E",
      name: "Optimus Prime",
      location: "Vavuniya",
      image: OptimusPrime,
      mapUrl: "https://www.google.com/maps/place/Vavuniya",
      poleNo: "P-1024",
      type: "Bulk",
      inspectionId: "INS-2023-001",
      inspectedDate: "2023-04-15",
      maintenanceDate: "2023-05-20",
      status: "Completed"
    },
    {
      id: "210292G",
      name: "BumbleBee",
      location: "Point-Pedro",
      image: BumbleBee,
      mapUrl: "https://www.google.com/maps/place/Point+Pedro",
      poleNo: "P-3856",
      type: "Distribution",
      inspectionId: "INS-2023-002",
      inspectedDate: "2023-06-10",
      maintenanceDate: "2023-06-25",
      status: "In Progress"
    },
    {
      id: "210498T",
      name: "Megatron",
      location: "Batticaloa",
      image: Megatron,
      mapUrl: "https://www.google.com/maps/place/Batticaloa",
      poleNo: "P-5432",
      type: "Bulk",
      inspectionId: "INS-2023-003",
      inspectedDate: "2023-07-05",
      maintenanceDate: "2023-08-15",
      status: "Pending"
    },
    {
      id: "210567K",
      name: "Optimus Prime",
      location: "Jaffna",
      image: OptimusPrime,
      mapUrl: "https://www.google.com/maps/place/Jaffna",
      poleNo: "P-7891",
      type: "Distribution",
      inspectionId: "INS-2023-004",
      inspectedDate: "2023-08-20",
      maintenanceDate: "2023-09-10",
      status: "Completed"
    },
    {
      id: "210683L",
      name: "BumbleBee",
      location: "Mannar",
      image: BumbleBee,
      mapUrl: "https://www.google.com/maps/place/Mannar",
      poleNo: "P-2468",
      type: "Distribution",
      inspectionId: "INS-2023-005",
      inspectedDate: "2023-09-01",
      maintenanceDate: "2023-09-30",
      status: "In Progress"
    }
  ];

  // Extract unique transformers for TransformerView
  const transformers = useMemo(() => {
    const uniqueTransformers = {};
    database.forEach(item => {
      if (!uniqueTransformers[item.id]) {
        uniqueTransformers[item.id] = {
          id: item.id,
          name: item.name,
          location: item.location,
          image: item.image,
          mapUrl: item.mapUrl,
          poleNo: item.poleNo,
          type: item.type
        };
      }
    });
    return Object.values(uniqueTransformers);
  }, [database]);

  // Extract inspection data for InspectionView
  const inspections = useMemo(() => {
    return database.map(item => ({
      transformerId: item.id,
      transformerName: item.name,
      inspectionId: item.inspectionId,
      inspectedDate: item.inspectedDate,
      maintenanceDate: item.maintenanceDate,
      status: item.status
    }));
  }, [database]);

  return (
    <div className="min-h-screen p-8 bg-[#E5E4E2]">
      {/* Header with Add Button and View Toggle */}
      <div className="flex justify-between items-center mb-6">
        {/* Add Transformer Button */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Transformer
        </button>
        
        {/* View Toggle Button */}
        <div className="bg-gray-200 rounded-lg inline-flex overflow-hidden">
          <button
            onClick={() => setActiveView('transformers')}
            className={`${
              activeView === 'transformers'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-300'
            } px-4 py-2 rounded-l-lg font-medium transition-colors duration-200`}
          >
            Transformers
          </button>
          <button
            onClick={() => setActiveView('inspection')}
            className={`${
              activeView === 'inspection'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-300'
            } px-4 py-2 rounded-r-lg font-medium transition-colors duration-200`}
          >
            Inspection
          </button>
        </div>
      </div>

      {/* Conditional Content based on active view */}
      {activeView === 'transformers' ? (
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
      ) : (
        <InspectionView 
          inspections={inspections}
          favorites={inspectionFavorites}
          toggleFavorite={toggleInspectionFavorite}
        />
      )}
    </div>
  );
}

export default Home;
