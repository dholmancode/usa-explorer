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
  const url = `${baseUrl}?parkCode=${parkCode}&api_key=${apiKey}&fields=addresses`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Park not found: ${parkCode}`);
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const parkInfo = data.data[0]; // Assuming data.data contains the park information array

    // Extract town and state from addresses if available
    if (parkInfo && parkInfo.addresses && parkInfo.addresses.length > 0) {
      const primaryAddress = parkInfo.addresses.find(address => address.type === 'Physical');
      if (primaryAddress) {
        parkInfo.town = primaryAddress.city;
        parkInfo.state = primaryAddress.stateCode;
      }
    }

    return parkInfo;
  } catch (error) {
    console.error('Error fetching park info:', error);
    throw error;
  }
}
