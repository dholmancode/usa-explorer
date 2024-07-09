import React from 'react';
import './Loader.css';

const Loader = () => {
  return (
    <div className="loader loader-container">
      <div className="message">Loading Map...</div>
      <div className="message">Loading Parks...</div>
    </div>
  );
};

export default Loader;