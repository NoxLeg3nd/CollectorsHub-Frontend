import axios from "axios";

const api = axios.create({baseURL: "http://192.168.1.133:8082"});
export default api;