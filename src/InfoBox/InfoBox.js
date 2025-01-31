import React, { useState, useEffect, useRef } from 'react';
import './InfoBox.css';
import { fetchParkInfo } from '../apiService';

const tabs = ['Images', 'Description', 'Activities', 'Weather', 'Contact', 'Directions'];

function InfoBox({ park, stateSelected }) {
  const [currentPark, setCurrentPark] = useState(park);
  const [parkInfo, setParkInfo] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Images');
  const infoBoxRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [tempPark, setTempPark] = useState(null);

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
        setTempPark(park);
      }, 500);
    }
  }, [park]);

  useEffect(() => {
    if (!isTransitioning && tempPark) {
      setCurrentPark(tempPark);
      setIsVisible(true);
      infoBoxRef.current.scrollTop = 0;
    }
  }, [isTransitioning, tempPark]);

  useEffect(() => {
    if (stateSelected) {
      setIsVisible(false);
    }
  }, [stateSelected]);

  return (
    <div
      className={`info-box ${isVisible ? 'translate-in' : 'info-box-hidden'} ${isTransitioning ? 'translate-out' : ''}`}
      ref={infoBoxRef}
      onTransitionEnd={() => setIsTransitioning(false)}
    >
      {currentPark ? (
        <>
          {/* Tab Menu */}
          <div className="tab-menu">
            {tabs.map((tab) => (
              <button 
                key={tab} 
                className={`tab-button ${activeTab === tab ? 'active' : ''}`} 
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <h1 className="park-title">{currentPark.fullName}</h1>
          <h4 className="park-loc">📍 {parkInfo?.town}, {parkInfo?.state}</h4>
          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'Images' && (
              <>
                {parkInfo?.images?.length > 0 ? (
                  <div className="park-images">
                    {parkInfo.images.map((image, index) => (
                      <img key={index} src={image.url} alt={image.altText || `Park Image ${index}`} />
                    ))}
                  </div>
                ) : <p>No images available</p>}
              </>
            )}

            {activeTab === 'Description' && (
              <p>{currentPark.description || 'No description available.'}</p>
            )}

            {activeTab === 'Activities' && (
              <>
                {error ? <p className="error">{error}</p> :
                parkInfo?.activities?.length > 0 ? (
                  <ul>{parkInfo.activities.map((act, i) => <li key={i}>{act.name}</li>)}</ul>
                ) : <p>No activities available.</p>}
              </>
            )}

            {activeTab === 'Weather' && (
              <p>{parkInfo?.weatherInfo || 'No weather information available.'}</p>
            )}

            {activeTab === 'Contact' && (
              <>
                {parkInfo?.contacts?.phoneNumbers?.length > 0 ? (
                  <ul>{parkInfo.contacts.phoneNumbers.map((phone, i) => (
                    <li key={i}>{phone.type}: {phone.phoneNumber}</li>
                  ))}</ul>
                ) : <p>No contact information available.</p>}
              </>
            )}

            {activeTab === 'Directions' && (
              <p>{parkInfo?.directionsInfo || 'No directions available.'}</p>
            )}
          </div>
        </>
      ) : (
        <p className='select-a-park'>Select a park to view information.</p>
      )}
    </div>
  );
}

export default InfoBox;
