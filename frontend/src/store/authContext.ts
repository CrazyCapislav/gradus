import { createContext} from "react";
import type { User } from "../types";

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    logout: () => void;

}

export const AuthContext = createContext<AuthContextType | null>(null);