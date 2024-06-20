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
                <p></p>
              )}
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
