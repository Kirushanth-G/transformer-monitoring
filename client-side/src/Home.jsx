import './Home.css';
import OptimusPrime from './assets/pictures/optimus-prime.jpg';
import BumbleBee from './assets/pictures/bumblebee.jpg';
import Megatron from './assets/pictures/megatron.jpg';

function Home() {
  return (
    <div className="home-container">
      <div className='m-1 text-3xl font-bold text-red-500 underline'>
        Hello world
      </div>
      <div className="transformer-container">
        <div className="transformer-box">
            {/* First transformer box content */}
            {/* Transformer Image */}
            <img src= {OptimusPrime} alt="Optimus-prime" />
            {/* Transformer details */}
            <h2>Transformer 1</h2>
            <p>Status: Active</p>
            <p>Temperature: 75°C</p>
            <p>Voltage: 220V</p>
        </div>
        <div className="transformer-box">
            {/* Second transformer box content */}
            {/* Transformer Image */}
            <img src= {BumbleBee} alt="Bumblebee" />
            {/* Transformer details */}
            <h2>Transformer 2</h2>
            <p>Status: Inactive</p>
            <p>Temperature: 60°C</p>
            <p>Voltage: 210V</p>
        </div>
        <div className="transformer-box">
            {/* Third transformer box content */}
            {/* Transformer Image */}
            <img src= {Megatron} alt="Megatron" />
            {/* Transformer details */}
            <h2>Transformer 3</h2>
            <p>Status: Active</p>
            <p>Temperature: 80°C</p>
            <p>Voltage: 230V</p>
        </div>
        <div className="transformer-box">
            {/* First transformer box content */}
            {/* Transformer Image */}
            <img src= {OptimusPrime} alt="Optimus-prime" />
            {/* Transformer details */}
            <h2>Transformer 1</h2>
            <p>Status: Active</p>
            <p>Temperature: 75°C</p>
            <p>Voltage: 220V</p>
        </div>
        <div className="transformer-box">
            {/* Second transformer box content */}
            {/* Transformer Image */}
            <img src= {BumbleBee} alt="Bumblebee" />
            {/* Transformer details */}
            <h2>Transformer 2</h2>
            <p>Status: Inactive</p>
            <p>Temperature: 60°C</p>
            <p>Voltage: 210V</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
