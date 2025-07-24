import axios from 'axios';

export const retrieveArtworks = async (page: number = 1) => {
  const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}`);
  return response.data;
};
