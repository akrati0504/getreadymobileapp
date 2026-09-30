import axios from "axios";

export const BASE_URL = 'http://192.168.1.3:8000';
export const IMAGE_BASE_URL = `${BASE_URL}/storage`;

const api = axios.create({
    baseURL: `${BASE_URL}/api`
})

export default api;