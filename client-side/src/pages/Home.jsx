// import { useState, useEffect } from 'react';
import OptimusPrime from '../assets/pictures/optimus-prime.jpg';
import BumbleBee from '../assets/pictures/bumblebee.jpg';
import Megatron from '../assets/pictures/megatron.jpg';

function Home() {
  const transformers = [
    {
      id: "210019E",
      name: "Optimus Prime",
      location: "Vavuniya",
      image: OptimusPrime,
      mapUrl: "https://www.google.com/maps/place/Vavuniya"
    },
    {
      id: "210292G",
      name: "BumbleBee",
      location: "Point-Pedro",
      image: BumbleBee,
      mapUrl: "https://www.google.com/maps/place/Point+Pedro"
    },
    {
      id: "210498T",
      name: "Megatron",
      location: "Batticaloa",
      image: Megatron,
      mapUrl: "https://www.google.com/maps/place/Batticaloa"
    },
    {
      id: "210567K",
      name: "Optimus Prime",
      location: "Jaffna",
      image: OptimusPrime,
      mapUrl: "https://www.google.com/maps/place/Jaffna"
    },
    {
      id: "210683L",
      name: "BumbleBee",
      location: "Mannar",
      image: BumbleBee,
      mapUrl: "https://www.google.com/maps/place/Mannar"
    }
  ];

  return (
    <div className="min-h-screen p-8 bg-[#E5E4E2] bg-[radial-gradient(#b4b4b4_1px,transparent_1px),radial-gradient(#b4b4b4_1px,transparent_1px)] bg-[length:20px_20px] bg-[0_0,10px_10px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
        {transformers.map((transformer, index) => (
          <div key={index} className="bg-[#F5F5F5] rounded-lg shadow-md p-4 transition-all duration-200 hover:translate-y-[-3px] hover:shadow-lg mb-5">
            <img 
              src={transformer.image} 
              alt={transformer.name}
              className="w-[90%] h-[250px] object-cover rounded-md mx-auto mb-4 shadow-[0_4px_8px_rgba(0,0,0,0.2)]" 
            />
            <h2 className="text-lg font-bold text-[#36454F] ml-6">{transformer.name}</h2>
            <p className="text-center text-gray-700 mb-4">Transformer ID: {transformer.id}</p>
            <div className="text-center text-gray-700 mb-4">
              <span>Location: {transformer.location}</span>
              <a 
                href={transformer.mapUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="underline ml-1">View on Map</span>
              </a>
            </div>
            
            <div className="text-center mt-4">
              <button className="bg-[#B0E0E6] hover:bg-[#B0CFDE] text-[#566D7E] font-bold py-2 px-4 rounded">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
