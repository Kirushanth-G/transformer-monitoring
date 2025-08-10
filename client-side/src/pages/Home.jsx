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
      image: OptimusPrime
    },
    {
      id: "210292G",
      name: "BumbleBee",
      location: "Point-Pedro",
      image: BumbleBee
    },
    {
      id: "210498T",
      name: "Megatron",
      location: "Batticaloa",
      image: Megatron
    },
    {
      id: "210567K", // Changed ID to be unique
      name: "Optimus Prime",
      location: "Jaffna",
      image: OptimusPrime
    },
    {
      id: "210683L", // Changed ID to be unique
      name: "BumbleBee",
      location: "Mannar",
      image: BumbleBee
    }
  ];

  return (
    <div className="min-h-screen p-8 bg-gray-100 bg-[radial-gradient(#b4b4b4_1px,transparent_1px),radial-gradient(#b4b4b4_1px,transparent_1px)] bg-[length:20px_20px] bg-[0_0,10px_10px]">
      <div className="flex flex-wrap gap-5 mt-5">
        {transformers.map((transformer, index) => (
          <div key={index} className="w-[calc(33.33%-14px)] lg:w-[calc(33.33%-14px)] md:w-[calc(50%-10px)] sm:w-full bg-white rounded-lg shadow-md p-5 transition-all duration-200 hover:translate-y-[-3px] hover:shadow-lg mb-5">
            <img 
              src={transformer.image} 
              alt={transformer.name}
              className="w-[90%] h-[300px] object-cover rounded-md mx-auto mb-4" 
            />
            <h2 className="text-lg font-bold text-gray-800 ml-6">{transformer.name}</h2>
            <p className="text-center text-gray-700 mb-4">Transformer ID: {transformer.id}</p>
            <p className="text-center text-gray-700 mb-4">Location: {transformer.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
