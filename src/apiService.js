// src/apiService.js

const apiKey = '1JhdpsWd0tSFh3X9qx6DhcZk6EefRIjUXlYJUDzY';
const baseUrl = 'https://developer.nps.gov/api/v1/parks';

export const fetchParksData = async () => {
  try {
    const response = await fetch(`${baseUrl}?api_key=${apiKey}&limit=500`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching parks data:', error);
    return [];
  }
};
