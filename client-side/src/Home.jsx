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
            <h2>Optimus prime</h2>
            <p>Transformer ID: 210019E</p>
            <p>Location: Vavuniya</p>
        </div>
        <div className="transformer-box">
            {/* Second transformer box content */}
            {/* Transformer Image */}
            <img src= {BumbleBee} alt="Bumblebee" />
            {/* Transformer details */}
            <h2>BumbleBee</h2>
            <p>Transformer ID: 210292G</p>
            <p>Location: point-pedro</p>
        </div>
        <div className="transformer-box">
            {/* Third transformer box content */}
            {/* Transformer Image */}
            <img src= {Megatron} alt="Megatron" />
            {/* Transformer details */}
            <h2>Megatron</h2>
            <p>Transformer ID: 210498T</p>
            <p>Location: Batticalo</p>
        </div>
        <div className="transformer-box">
            {/* First transformer box content */}
            {/* Transformer Image */}
            <img src= {OptimusPrime} alt="Optimus-prime" />
            {/* Transformer details */}
            <h2>Optimus prime</h2>
            <p>Transformer ID: 210019E</p>
            <p>Location: Vavuniya</p>
        </div>
        <div className="transformer-box">
            {/* Second transformer box content */}
            {/* Transformer Image */}
            <img src= {BumbleBee} alt="Bumblebee" />
            {/* Transformer details */}
            <h2>BumbleBee</h2>
            <p>Transformer ID: 210292G</p>
            <p>Location: point-pedro</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
