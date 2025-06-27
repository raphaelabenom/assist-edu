import {
  authApi,
  getAuthToken,
  removeAuthToken,
  setAuthToken,
} from "@/lib/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!getAuthToken()
  );
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => authApi.login(username, password),
    onSuccess: (data) => {
      setAuthToken(data.token);
      setIsAuthenticated(true);
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
    onError: () => {
      removeAuthToken();
      setIsAuthenticated(false);
    },
  });

  const logout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    queryClient.clear();
    authApi.logout();
  };

  useEffect(() => {
    const token = getAuthToken();

    // Check if token exists and is valid
    if (token) {
      try {
        // Basic token expiration check
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Date.now() / 1000;
        const isExpired = payload.exp < currentTime;

        if (isExpired) {
          // Token is expired, log out the user
          removeAuthToken();
          setIsAuthenticated(false);
          queryClient.clear();
        } else if (!isAuthenticated) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Token is malformed, log out the user
        removeAuthToken();
        setIsAuthenticated(false);
        queryClient.clear();
      }
    } else if (isAuthenticated) {
      setIsAuthenticated(false);
    }
  }, [isAuthenticated, queryClient]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    logout,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
  };
};
