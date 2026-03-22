import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);

    function login(userData) {
        setUser(userData);
    }

    function logout() {
        setUser(null);
    }

    function updateUser(updatedData) {
        setUser(prev => ({ ...prev, ...updatedData }));
    }
    return (
        <UserContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}