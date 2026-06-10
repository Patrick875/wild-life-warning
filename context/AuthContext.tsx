import {
  deleteSecureItem,
  getSecureItem,
  saveSecureItem,
} from "@/utils/secureStore";
import { setUnauthorizedHandler } from "@/services/axiosInstance";
import { router } from "expo-router";
import { createContext, ReactNode, useEffect, useState } from "react";

type IAuthContext = {
  isAuthLoading: boolean;
  userToken: string | null;
  login: (token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<IAuthContext>({
  isAuthLoading: true,
  userToken: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await getSecureItem("userToken");

        if (token) setUserToken(token);
      } finally {
        setIsAuthLoading(false);
      }
    };

    loadToken();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUserToken(null);
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  const login = async (token: string) => {
    if (!token) return;

    await saveSecureItem("userToken", token);
    setUserToken(token);
  };

  const logout = async () => {
    await deleteSecureItem("userToken");
    setUserToken(null);
    router.replace("/(auth)/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthLoading, userToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
