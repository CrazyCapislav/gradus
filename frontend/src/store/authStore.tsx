import { useState, useEffect } from "react";
import type { User } from "../types";
import { AuthContext } from "./authContext";
import { setToken } from "../api/client";
import { refreshToken, getMe } from "../api/auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        refreshToken()
            .then(({ accessToken: token }) => {
                setToken(token);
                setAccessToken(token);
                return getMe();
            })
            .then(setUser)
            .catch(() => {})
            .finally(() => setInitializing(false));
    }, []);

    function logout() {
        setUser(null);
        setAccessToken(null);
        setToken(null);
    }

    const handleSetAccessToken = (token: string | null) => {
        setAccessToken(token);
        setToken(token);
    }

    if (initializing) return null;

    return (
        <AuthContext.Provider value={{ user, setUser, accessToken, logout, setAccessToken: handleSetAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};

