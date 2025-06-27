import { apiRequest } from "./queryClient";

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    name: string;
    role: string;
  };
}

interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiRequest("POST", "/api/auth/login", {
      username,
      password,
    });
    return response.json();
  },

  getMe: async (): Promise<User> => {
    const response = await apiRequest("GET", "/api/auth/me");
    return response.json();
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  },
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem("auth_token");
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't parse the token, consider it expired
  }
};

export const getTokenInfo = (): { token: string | null; isExpired: boolean; payload: any } => {
  const token = getAuthToken();
  if (!token) {
    return { token: null, isExpired: true, payload: null };
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = isTokenExpired(token);
    return { token, isExpired, payload };
  } catch (error) {
    return { token, isExpired: true, payload: null };
  }
};
