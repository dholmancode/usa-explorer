// src/NavBar/NavBar.js

import React from 'react';
import './NavBar.css';

function NavBar() {
  return (
    <nav className="nav-bar">
      <div className="search-container">
        <input type="text" placeholder="Search..." />
        <button type="button">Search</button>
      </div>
      <div className="checkbox-container">
        <label>
          <input type="checkbox" /> Beep
        </label>
        <label>
          <input type="checkbox" /> Boop
        </label>
        <label>
          <input type="checkbox" /> Bop
        </label>
      </div>
    </nav>
  );
}

export default NavBar;
