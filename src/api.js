import axios from "axios";
import { storageService } from "./services/storageService";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export { storageService };
export default api;
