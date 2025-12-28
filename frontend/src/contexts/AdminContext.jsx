import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginOwner } from '../api/companyService';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check Local Storage on load to persist login
    useEffect(() => {
        const storedToken = localStorage.getItem('adminToken');
        const storedInfo = localStorage.getItem('adminInfo');

        if (storedToken && storedInfo) {
            setAdmin(JSON.parse(storedInfo));
        }
        setLoading(false);
    }, []);

    const login = async (employeeId, password) => {
        try {
            const data = await loginOwner(employeeId, password);

            // ADJUST THIS based on your actual API response structure
            // Example assumption: data = { token: "...", user: { name: "...", role: "OWNER" } }
            const token = data.token || data.accessToken;
            const adminData = data.user || data;

            // Save to State
            setAdmin(adminData);

            // Save to Local Storage
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminInfo', JSON.stringify(adminData));

            return { success: true };
        } catch (error) {
            console.error("Context Login Error", error);
            const msg = error.response?.data?.message || "Login failed";
            return { success: false, message: msg };
        }
    };

    const logout = () => {
        setAdmin(null);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        window.location.href = '/login'; // Optional: Force redirect
    };

    return (
        <AdminContext.Provider value={{ admin, login, logout, loading }}>
            {!loading && children}
        </AdminContext.Provider>
    );
};

// Custom Hook for easy access
export const useAdmin = () => useContext(AdminContext);