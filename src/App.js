import React, { useState, useEffect } from 'react';
import './App.css';
import InfoBox from './InfoBox/InfoBox';
import Map from './Map/Map';
import NavBar from './NavBar/NavBar';
import { fetchParksData } from './apiService';
import logo from './assets/DGH_Logo.png';

function App() {
  const [selectedPark, setSelectedPark] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [parksData, setParksData] = useState([]);
  const [accordionOpen, setAccordionOpen] = useState(false);

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

  const toggleAccordion = () => {
    setAccordionOpen(!accordionOpen);
  };

  return (
    <div className="Main">
      <header>
        <h1>USA National Parks Explorer</h1>
        <button className="AccordionButton" onClick={toggleAccordion}>
          How it works
        </button>
      </header>
      <div className="AccordionContainer">
        <div className={`Accordion ${accordionOpen ? 'open' : ''}`}>
          <div className="AccordionContent">
            <p>
              <strong>
            Select a park on the map on the left, or use the search feature on the 
            right to explore USA National Parks. 
            </strong>
            <br></br>
            <br></br>
            This is a React Application.
            <br></br>
            <button onClick={() => window.open("https://github.com/dholmancode/usa-explorer", "_blank")}>
  View Code &#8594;
</button>
            <br></br>
            <br></br>
This app fetches data from the National Parks Service API to provide information about each park. 
            <br></br>
            <br></br>
The map uses a GeoAlbers projection and D3.js for interactive features, with GeoJSON defining country, state, and county borders.
            </p>
          </div>
        </div>
      </div>
      <div className="App">
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
            selectedPark={selectedPark} // Pass selectedPark to NavBar
          />
          <InfoBox park={selectedPark} stateSelected={selectedState} />
        </div>
      </div>
      <footer>
        <h3>Developed & Designed by Danny Holman</h3>
        <a
          href="https://dannyholmanmedia.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={logo} alt="Danny Holman Logo" />
          <p>dannyholmanmedia.com</p>
        </a>
      </footer>
    </div>
  );
}

export default App;
