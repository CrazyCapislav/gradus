import {useState } from "react";
import type { User } from "../types";
import { AuthContext } from "./authContext";
import { setToken } from "../api/client";



export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    function logout() {
        setUser(null);
        setAccessToken(null);
        setToken(null);
    }

    const handleSetAccessToken = (token: string | null) => {
        setAccessToken(token);
        setToken(token);
    }

    return (
        <AuthContext.Provider value={{ user, setUser, accessToken, logout, setAccessToken: handleSetAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};

