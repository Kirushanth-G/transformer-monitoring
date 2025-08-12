// import { useState, useEffect } from 'react';
import { useState } from 'react';
import OptimusPrime from '../assets/pictures/optimus-prime.jpg';
import BumbleBee from '../assets/pictures/bumblebee.jpg';
import Megatron from '../assets/pictures/megatron.jpg';

function Home() {
  const [favorites, setFavorites] = useState([]);
  
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };
  
  const transformers = [
    {
      id: "210019E",
      name: "Optimus Prime",
      location: "Vavuniya",
      image: OptimusPrime,
      mapUrl: "https://www.google.com/maps/place/Vavuniya",
      poleNo: "P-1024",
      type: "Bulk"
    },
    {
      id: "210292G",
      name: "BumbleBee",
      location: "Point-Pedro",
      image: BumbleBee,
      mapUrl: "https://www.google.com/maps/place/Point+Pedro",
      poleNo: "P-3856",
      type: "Distribution"
    },
    {
      id: "210498T",
      name: "Megatron",
      location: "Batticaloa",
      image: Megatron,
      mapUrl: "https://www.google.com/maps/place/Batticaloa",
      poleNo: "P-5432",
      type: "Bulk"
    },
    {
      id: "210567K",
      name: "Optimus Prime",
      location: "Jaffna",
      image: OptimusPrime,
      mapUrl: "https://www.google.com/maps/place/Jaffna",
      poleNo: "P-7891",
      type: "Distribution"
    },
    {
      id: "210683L",
      name: "BumbleBee",
      location: "Mannar",
      image: BumbleBee,
      mapUrl: "https://www.google.com/maps/place/Mannar",
      poleNo: "P-2468",
      type: "Distribution"
    }
  ];

  return (
    <div className="min-h-screen p-8 bg-[#E5E4E2]">
      <div className="overflow-x-auto bg-[#F5F5F5] rounded-lg shadow-md">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-[#B0E0E6] text-[#36454F]">
              <th className="px-6 py-3 text-center font-bold w-12"> </th>
              <th className="px-6 py-3 text-left font-bold">Transformer No.</th>
              <th className="px-6 py-3 text-left font-bold">Pole No.</th>
              <th className="px-6 py-3 text-left font-bold">Location</th>
              <th className="px-6 py-3 text-left font-bold">Type</th>
              <th className="px-6 py-3 text-center font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transformers.map((transformer, index) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;
