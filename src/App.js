// src/App.js

import React from 'react';
import logo from './logo.svg';
import './App.css';
import InfoBox from './InfoBox/InfoBox';
import Map from './Map/Map';
import NavBar from './NavBar/NavBar';

function App() {
  return (
    <div className="App">
      <NavBar />
      <InfoBox />
      <Map />
    </div>
  );
}

export default App;
