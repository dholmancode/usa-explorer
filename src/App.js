// src/App.js

import React from 'react';
import logo from './logo.svg';
import './App.css';
import InfoBox from './InfoBox/InfoBox';
import Map from './Map/Map';
import NavBar from './NavBar/NavBar';

function App() {
  return (
    <div className="Main">
     <div className="App">
        <div className="explorer">
          <NavBar />
          <Map />
          </div>
         <InfoBox className="InfoBox" />
      </div>
    </div>

  );
}

export default App;
