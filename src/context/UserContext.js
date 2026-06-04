import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserContext = createContext(null);
const USER_STORAGE_KEY = "collectors_hub_user";

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function restoreSession() {
            try {
                const stored = await AsyncStorage.getItem(USER_STORAGE_KEY);
                if (stored) {
                    setUser(JSON.parse(stored));
                }
            } catch (err) {
                console.error("Failed to restore session:", err);
            } finally {
                setLoading(false);
            }
        }
        restoreSession();
    }, []);

    async function login(userData) {
        setUser(userData);
        try {
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        } catch (err) {
            console.error("Failed to save session:", err);
        }
    }

    async function logout() {
        setUser(null);
        try {
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
        } catch (err) {
            console.error("Failed to clear session:", err);
        }
    }

    async function updateUser(updatedData) {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        try {
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        } catch (err) {
            console.error("Failed to update session:", err);
        }
    }

    return (
        <UserContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}