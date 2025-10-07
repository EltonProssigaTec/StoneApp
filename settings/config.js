import axios from "react-native-axios";
import { settings } from "./settings";

const api = axios.create({
  baseURL: settings.API_URL,
});
api.defaults.headers.post["Content-Type"] = "multipart/form-data";

api.interceptors.request.use(
  async (request) => {
    console.log('request', settings.API_URL)
    console.log('request=', request)
    return request;
  },
   (error) => {
    console.log('request error', JSON.stringify(error))
    return error;
  },
);

api.interceptors.response.use(
  async (response) => {
    return response;
    
  },
  async (error) => {
    console.log('erro no response')
    return Promise.reject(error);
  },
);

export default api;

export const apiFree = axios.create();
apiFree.defaults.headers.post["Content-Type"] = "multipart/form-data";

apiFree.interceptors.request.use(
  async (request) => {
    return request;
    
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiFree.interceptors.response.use(
  async (response) => {
    return response;
    
  },
  (error) => {
    console.log('erro identificadp')
    return Promise.reject(error);
  },
);
