
// Coordinates for the center of each state (approximate)
const stateCenters = {
  'Alabama': [-86.9023, 32.3182],
  'Alaska': [-154.4931, 63.5888],
  'Arizona': [-111.0937, 34.0489],
  'Arkansas': [-92.1999, 34.7999],
  'California': [-119.4179, 36.7783],
  'Colorado': [-105.7821, 39.5501],
  'Connecticut': [-72.7554, 41.6032],
  'Delaware': [-75.5277, 38.9108],
  'Florida': [-81.5158, 27.6648],
  'Georgia': [-82.9071, 32.1656],
  'Hawaii': [-155.5828, 19.8968],
  'Idaho': [-114.742, 44.0682],
  'Illinois': [-89.3985, 40.6331],
  'Indiana': [-86.1349, 40.2672],
  'Iowa': [-93.0977, 41.878],
  'Kansas': [-98.4842, 39.0119],
  'Kentucky': [-84.270, 37.8393],
  'Louisiana': [-91.9623, 30.9843],
  'Maine': [-69.4455, 45.2538],
  'Maryland': [-76.6413, 39.0458],
  'Massachusetts': [-71.3824, 42.4072],
  'Michigan': [-85.6024, 44.3148],
  'Minnesota': [-94.6859, 46.7296],
  'Mississippi': [-89.3985, 32.3547],
  'Missouri': [-91.8318, 37.9643],
  'Montana': [-110.3626, 46.8797],
  'Nebraska': [-99.9018, 41.4925],
  'Nevada': [-116.4194, 38.8026],
  'New Hampshire': [-71.5724, 43.1939],
  'New Jersey': [-74.4057, 40.0583],
  'New Mexico': [-105.8701, 34.5199],
  'New York': [-74.0060, 40.7128],
  'North Carolina': [-79.0193, 35.7596],
  'North Dakota': [-101.0020, 47.5515],
  'Ohio': [-82.9071, 40.4173],
  'Oklahoma': [-97.5164, 35.4676],
  'Oregon': [-120.5542, 43.8041],
  'Pennsylvania': [-77.1945, 41.2033],
  'Rhode Island': [-71.4774, 41.5801],
  'South Carolina': [-81.1637, 33.8361],
  'South Dakota': [-99.9018, 43.9695],
  'Tennessee': [-86.5804, 35.5175],
  'Texas': [-99.9018, 31.9686],
  'Utah': [-111.0937, 39.3200],
  'Vermont': [-72.5778, 44.5588],
  'Virginia': [-78.6569, 37.4316],
  'Washington': [-120.7401, 47.7511],
  'West Virginia': [-80.4549, 38.5976],
  'Wisconsin': [-89.6165, 43.7844],
  'Wyoming': [-107.2903, 43.0759]
};



import React, { useState, useEffect } from 'react';
import './InfoBox.css';
import { fetchParkInfo } from '../apiService';

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

  return (
    <div className="info-box">
      {park ? (
        <>
          <h2>{park.fullName}</h2>
          <div>
            <p>{park.description || 'Description not available'}</p>
            <div className="additional-info">
              <h3>Images:</h3>
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
              <h3>Activities:</h3>
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
              <h3>Weather:</h3>
              <p>{parkInfo ? parkInfo.weatherInfo || 'No weather information available' : 'No weather information available'}</p>
            </div>
            <div className="additional-info">
              <h3>Contact Information:</h3>
              {parkInfo && parkInfo.contacts ? (
                <div>
                  {parkInfo.contacts.phoneNumbers && parkInfo.contacts.phoneNumbers.length > 0 && (
                    <div>
                      <h4>Phone Numbers:</h4>
                      <ul>
                        {parkInfo.contacts.phoneNumbers.map((phone, index) => (
                          <li key={index}>
                            {phone.type}: {phone.phoneNumber}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {parkInfo.contacts.emailAddresses && parkInfo.contacts.emailAddresses.length > 0 && (
                    <div>
                      <h4>Email Addresses:</h4>
                      <ul>
                        {parkInfo.contacts.emailAddresses.map((email, index) => (
                          <li key={index}>
                            {email.description}: {email.emailAddress}
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
              <h3>Alerts:</h3>
              {parkInfo && parkInfo.alerts && parkInfo.alerts.length > 0 ? (
                <ul>
                  {parkInfo.alerts.map((alert, index) => (
                    <li key={index}>
                      <strong>{alert.title}</strong>: {alert.description}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No alerts available</p>
              )}
            </div>
            <div className="additional-info">
              <h3>Directions:</h3>
              <p>{parkInfo ? parkInfo.directionsInfo || 'No directions available' : 'No directions available'}</p>
            </div>
          </div>
        </>
      ) : (
        <p>No park selected</p>
      )}
    </div>
  );
}

export default InfoBox;


Add the Park Town & State or location - however you need to fetch it from the API from National Parks Service:// apiService.js

const apiKey = '1JhdpsWd0tSFh3X9qx6DhcZk6EefRIjUXlYJUDzY';
const baseUrl = 'https://developer.nps.gov/api/v1/parks';

export const fetchParksData = async () => {
  try {
    const response = await fetch(`${baseUrl}?api_key=${apiKey}&limit=500`);
    const data = await response.json();
    return data.data; // Assuming data.data contains the array of parks
  } catch (error) {
    console.error('Error fetching parks data:', error);
    return []; // Return an empty array in case of error
  }
};

export async function fetchParkInfo(parkCode) {
  const url = `${baseUrl}?parkCode=${parkCode}&api_key=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Park not found: ${parkCode}`);
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.data[0]; // Assuming data.data contains the park information array
  } catch (error) {
    console.error('Error fetching park info:', error);
    throw error;
  }
}
