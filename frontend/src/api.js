import axios from 'axios';

const API_BASE_URL = 'http://localhost:1337/api';

export const fetchPaginas = () => axios.get(`${API_BASE_URL}/paginas`);
export const fetchIdiomas = () => axios.get(`${API_BASE_URL}/idiomas`);
export const fetchEjemplos = () => axios.get(`${API_BASE_URL}/ejemplo-traduccions`);
