import axios from "axios";

const API = axios.create({
  baseURL: "https://syncspace-backend-wk47.onrender.com/api",
  withCredentials: true,
});

// Attach token automatically
API.interceptors.request.use((config) => {

  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;