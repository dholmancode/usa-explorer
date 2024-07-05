import React, { useState, useEffect } from 'react';
import './App.css';
import InfoBox from './InfoBox/InfoBox';
import Map from './Map/Map';
import NavBar from './NavBar/NavBar';
import { fetchParksData } from './apiService';

function App() {
  const [selectedPark, setSelectedPark] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [parksData, setParksData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const parks = await fetchParksData();
      setParksData(parks);
    };

    fetchData();
  }, []);

  const handleParkSelect = (park) => {
    setSelectedPark(park);
    setSelectedState(''); // Clear selected state when a park is selected
  };

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setSelectedPark(null); // Clear selected park when a state is selected
  };

  return (
    <div className="Main">
      <div className="App">
          {/* NavBar for state and park selection */}
          {/* Map component displaying the map and park locations */}
          <Map
          className="Map"

            selectedState={selectedState}
            selectedPark={selectedPark}
            onParkSelect={handleParkSelect}
          />
        <div className="explorer">
        <NavBar
            className="NavBar"
            onStateSelect={handleStateSelect}
            parksData={parksData}
            onParkSelect={handleParkSelect}
          />
      <InfoBox park={selectedPark} />
      </div>

      </div>
    </div>
  );
}

export default App;
