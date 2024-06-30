import React, { useState, useEffect, useRef } from 'react';
import './NavBar.css';
import { fetchParksData } from '../apiService';

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 
  'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 
  'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const getStateFullName = (stateAbbreviation) => {
  const stateAbbreviations = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
    CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
    IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
    ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
    MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
    NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
    OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
    TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
    WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'
  };

  return stateAbbreviations[stateAbbreviation] || stateAbbreviation;
};

function NavBar({ onStateSelect, parksData, onParkSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef(null);
  const [parkStates, setParkStates] = useState({});
  const [selectedState, setSelectedState] = useState('');
  const [selectedItemDisplay, setSelectedItemDisplay] = useState('');

  useEffect(() => {
    const fetchParkStates = async () => {
      try {
        const parks = await fetchParksData();
        const statesMap = {};
        parks.forEach(park => {
          const state = park.states.split(',')[0].trim(); // Trim whitespace
          if (!statesMap[state]) {
            statesMap[state] = [];
          }
          statesMap[state].push(park.fullName);
        });
        setParkStates(statesMap);
      } catch (error) {
        console.error('Error fetching park data:', error);
      }
    };

    fetchParkStates();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSuggestions([]);
        setIsSearching(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isSearching) {
      let allItems = [
        ...Object.keys(parkStates).reduce((acc, state) => [...acc, ...parkStates[state]], []),
        ...states
      ];

      if (searchTerm) {
        allItems = allItems.filter(item =>
          item.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setSuggestions(allItems);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, isSearching, parkStates]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setIsSearching(true);
  };

  const handleSearchSelect = (item) => {
    setSearchTerm(item);
    setIsSearching(false);

    if (states.includes(item)) {
      setSelectedState(item);
      setSelectedItemDisplay(getStateFullName(item));
      onStateSelect(item);
    } else {
      const selectedState = Object.keys(parkStates).find(state =>
        parkStates[state].includes(item)
      );
      if (selectedState) {
        setSelectedState(selectedState);
        setSelectedItemDisplay(item);
        onStateSelect(selectedState);
        const selectedPark = parksData.find(park => park.fullName === item);
        if (selectedPark) {
          onParkSelect(selectedPark);
          setSelectedItemDisplay(selectedPark.fullName); // Update selectedItemDisplay with park name
        }
      }
    }
  };

  const handleStateChange = (event) => {
    const state = event.target.value;
    setSelectedState(state);
    setSelectedItemDisplay(getStateFullName(state));
    onStateSelect(state);
    setSearchTerm('');
    setIsSearching(false);
    setSuggestions([]);
  };

  useEffect(() => {
    // Clear search and dropdown on park selection
    setSearchTerm('');
    setIsSearching(false);
    setSelectedState('');
    setSelectedItemDisplay('');
    setSuggestions([]);
  }, [onParkSelect]);

  useEffect(() => {
    // Update display immediately when selectedState changes
    if (selectedState) {
      setSelectedItemDisplay(getStateFullName(selectedState));
    }
  }, [selectedState]);

  return (
    <nav className="nav-bar">
      <div className="search-container" ref={searchContainerRef}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {isSearching && (
          <div className="suggestions">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSearchSelect(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="state-selection">
        <div className="selected-state">
          {selectedItemDisplay && <h5>{selectedItemDisplay}</h5>}
        </div>
        <div className="dropdown-container">
          <label htmlFor="state-dropdown"></label>
          <select
            id="state-dropdown"
            name="states"
            onChange={handleStateChange}
            value={selectedState}
          >
            <option value="">--Select a State--</option>
            {states.map((state, index) => (
              <option key={index} value={state}>
                {getStateFullName(state)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
