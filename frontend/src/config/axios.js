import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5005", // Your backend server's URL
  headers: {
    "Authorization" : `Bearer ${localStorage.getItem('token')}`,
  },
});

export default instance;
