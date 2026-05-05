import axios from "axios";

let authToken: string | null = null;

export function setToken(token: string | null) {
    authToken = token;
}

const client = axios.create({

    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    withCredentials: true
});

client.interceptors.request.use(config => {
    if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
});

export default client;