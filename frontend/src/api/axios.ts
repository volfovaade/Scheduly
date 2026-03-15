// configuration of backend connection
// port from docker-compose

import axios from "axios";

// use environment variable or fallback to default
const baseUrl =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8081/api";

const instance = axios.create({
  baseURL: baseUrl,
});

// to avoid setting up the headers repeatedly => DRY
instance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
