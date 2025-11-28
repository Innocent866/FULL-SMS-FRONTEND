import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://full-sms-backend.onrender.com/api",
  withCredentials: true,
});

// 🔥 REQUEST INTERCEPTOR — adds token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 RESPONSE INTERCEPTOR — handles token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      await axios.post(
        `${apiClient.defaults.baseURL.replace("/api", "")}/api/auth/refresh`,
        {},
        { withCredentials: true }
      );

      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default apiClient;