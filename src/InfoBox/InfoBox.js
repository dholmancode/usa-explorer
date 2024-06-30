import React, { useState, useEffect } from 'react';
import './InfoBox.css';
import { fetchParkInfo } from '../apiService';

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

function InfoBox({ park }) {
  const [parkInfo, setParkInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        if (park) {
          const info = await fetchParkInfo(park.parkCode);
          setParkInfo(info);
          setError(null);
        } else {
          setParkInfo(null);
        }
      } catch (error) {
        setError(error.message);
        setParkInfo(null);
      }
    };

    fetchInfo();
  }, [park]);

  const getStateFullName = (stateAbbreviation) => {
    return stateAbbreviations[stateAbbreviation] || stateAbbreviation;
  };

  return (
    <div className="info-box">
      {park ? (
        <>
          <h2>{park.fullName}</h2>
          <div>
            <div className="additional-info">
              <h4>{parkInfo ? `${parkInfo.town}, ${getStateFullName(parkInfo.state)}` : 'Location not available'}</h4>
            </div>
          </div>
          <div>
            <p>{park.description || 'Description not available'}</p>
            <div className="additional-info">
              {error ? (
                <p className="error">{error}</p>
              ) : parkInfo && parkInfo.images && parkInfo.images.length > 0 ? (
                <div className="park-images">
                  {parkInfo.images.map((image, index) => (
                    <img key={index} src={image.url} alt={image.altText || `Park Image ${index}`} />
                  ))}
                </div>
              ) : (
                <p>No images available</p>
              )}
            </div>
            <div className="activities">
              <h3>Activities</h3>
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
            <div className="additional-info">
              <h3>Weather</h3>
              <p>{parkInfo ? parkInfo.weatherInfo || 'No weather information available' : 'No weather information available'}</p>
            </div>
            <div className="additional-info">
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
            <div className="additional-info">
              <h3>Directions</h3>
              <p>{parkInfo ? parkInfo.directionsInfo || 'No directions available' : 'No directions available'}</p>
            </div>
          </div>
        </>
      ) : (
        <p className='select-a-park'>Select a park</p>
      )}
    </div>
  );
}

export default InfoBox;
