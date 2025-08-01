import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";

type User = {
    id: string;
    name: string;
    email: string;
};
type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, userId: string) => void;
    logout: () => void;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider ({children}:{children: React.ReactNode}) {
    const [user, setUser] = useState<User | null>(null);

    const login = async (token: string, userId: string) => {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("userId", userId);
        try {
            const res = await axios.get(`/users/${userId}`);
            setUser(res.data);
        } catch (err) {
            console.error("Failed to fetch user info", err);
        }
    };
    const logout = () => {
        sessionStorage.clear();
        setUser(null);
    };
    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const userId = sessionStorage.getItem("userId");
        if (token && userId) {
            login(token, userId); // silent login on page reload
        }
    }, []);
    return (
        <AuthContext.Provider value={{user, isAuthenticated: !!user, login, logout,}}>
            {children}
        </AuthContext.Provider>
    );
}

// customise hook to use auth
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
}
