// configuration of backend connection
// port from docker-compose

import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://10.0.0.31:8081/api',  //'http://localhost:8081/api',
})

// to avoid setting up the headers repeatedly => DRY
instance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;