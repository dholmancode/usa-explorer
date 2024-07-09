import React, { useState, useEffect, useRef } from 'react';
import './InfoBox.css';
import { fetchParkInfo } from '../apiService';
import Arrow from '../assets/Arrow.svg';

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

function InfoBox({ park, stateSelected }) {
  const [currentPark, setCurrentPark] = useState(park);
  const [parkInfo, setParkInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);
  const infoBoxRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [tempPark, setTempPark] = useState(null);

  // Function to get full state name from abbreviation
  const getStateFullName = (stateAbbreviation) => {
    return stateAbbreviations[stateAbbreviation] || stateAbbreviation;
  };

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        if (tempPark) {
          const info = await fetchParkInfo(tempPark.parkCode);
          setParkInfo(info);
          setError(null);
        }
      } catch (error) {
        setError(error.message);
        setParkInfo(null);
      }
    };

    if (tempPark) {
      fetchInfo();
    }
  }, [tempPark]);

  useEffect(() => {
    if (park) {
      setIsTransitioning(true);
      setTimeout(() => {
        setIsVisible(false);
        setTempPark(park); // Trigger tempPark update after hide animation
      }, 500); // Match the CSS transition duration
    }
  }, [park]);

  useEffect(() => {
    if (!isTransitioning && tempPark) {
      setCurrentPark(tempPark);
      setIsVisible(true);
      // Scroll to top when switching parks
      infoBoxRef.current.scrollTop = 0;
    }
  }, [isTransitioning, tempPark]);

  useEffect(() => {
    // Hide InfoBox when a state is selected
    if (stateSelected) {
      setIsVisible(false);
    }
  }, [stateSelected]);

  const toggleActivities = () => {
    setIsActivitiesOpen(!isActivitiesOpen);
  };

  return (
    <div
      className={`info-box ${isVisible ? 'translate-in' : 'info-box-hidden'} ${isTransitioning ? 'translate-out' : ''}`}
      ref={infoBoxRef}
      onTransitionEnd={() => setIsTransitioning(false)}
    >
      {currentPark ? (
        <>
          <h1 className="park-title additional-info">{currentPark.fullName}</h1>
          <div>
            <div className="additional-info park-town-state">
              <h4>📍 {parkInfo ? `${parkInfo.town}, ${getStateFullName(parkInfo.state)}` : 'Location not available'}</h4>
            </div>
          </div>
          <div className="additional-info" id="park-images">
            {error ? (
              <p className="error">{error}</p>
            ) : parkInfo && parkInfo.images && parkInfo.images.length > 0 ? (
              <div className="park-images park-images-scroll">
                {parkInfo.images.map((image, index) => (
                  <img key={index} src={image.url} alt={image.altText || `Park Image ${index}`} />
                ))}
              </div>
            ) : (
              <p>No images available</p>
            )}
          </div>
          <p className="park-description additional-info">{currentPark.description || 'Description not available'}</p>
          <div className="additional-info activities">
            <h3 onClick={toggleActivities} className="accordion-title">
              Activities
              <img src={Arrow} alt="Toggle Arrow" className={`arrow-icon ${isActivitiesOpen ? 'open' : ''}`} />
            </h3>
            <div className={`accordion-content ${isActivitiesOpen ? 'open' : ''}`}>
              {error ? (
                <p className="error">{error}</p>
              ) : parkInfo && parkInfo.activities && parkInfo.activities.length > 0 ? (
                <ul>
                  {parkInfo.activities.map((activity, index) => (
                    <li key={index}>{activity.name}</li>
                  ))}
                </ul>
              ) : (
                <p>No activities available</p>
              )}
            </div>
          </div>
          <div className="weather additional-info">
            <h3>Weather</h3>
            <p className='weather-desc'>{parkInfo ? parkInfo.weatherInfo || 'No weather information available' : 'No weather information available'}</p>
          </div>
          <div className="additional-info phone-number">
            {parkInfo && parkInfo.contacts ? (
              <div>
                {parkInfo.contacts.phoneNumbers && parkInfo.contacts.phoneNumbers.length > 0 && (
                  <div>
                    <h3>Phone Numbers</h3>
                    <ul>
                      {parkInfo.contacts.phoneNumbers.map((phone, index) => (
                        <li key={index}>
                          {phone.type}: {phone.phoneNumber}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p>No contact information available</p>
            )}
          </div>
          <div className="additional-info directions">
            <h3>Directions</h3>
            <p>{parkInfo ? parkInfo.directionsInfo || 'No directions available' : 'No directions available'}</p>
          </div>
        </>
      ) : (
        <p className='select-a-park'>Select a park to view information.</p>
      )}
    </div>
  );
}

export default InfoBox;
