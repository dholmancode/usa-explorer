import React, { useState } from 'react';
import './App.css';
import InfoBox from './InfoBox/InfoBox';
import Map from './Map/Map';
import NavBar from './NavBar/NavBar';

function App() {
  const [selectedPark, setSelectedPark] = useState(null);

  const handleParkSelect = (park) => {
    setSelectedPark(park);
  };

  return (
    <div className="Main">
      <div className="App">
        <div className="explorer">
          <NavBar />
          <Map onParkSelect={handleParkSelect} />
        </div>
        <InfoBox park={selectedPark} />
      </div>
    </div>
  );
}

export default App;
