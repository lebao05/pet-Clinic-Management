// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Customer
import CustomerLayout from "./features/customer/layouts/CustomerLayout";
import CustomerHomePage from "./features/customer/pages/HomePage";
import CustomerProfilePage from "./features/customer/pages/ProfilePage";

// Routes
import ManagerRoutes from "./routes/ManagerRoutes";
import ReceptionistRoutes from "./routes/ReceptionistRoutes";
import AdminRoutes from "./routes/AdminRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Routes */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerHomePage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
          <Route path="pets" element={<div className="p-8">My Pets Coming Soon</div>} />
          <Route path="appointments" element={<div className="p-8">Appointments Coming Soon</div>} />
          <Route path="billing" element={<div className="p-8">Billing Coming Soon</div>} />
        </Route>

        {/* Branch Manager Routes */}
        <Route path="/manager/*" element={<ManagerRoutes />} />

        {/* Receptionist Routes */}
        <Route path="/receptionist/*" element={<ReceptionistRoutes />} />

        {/* Company Admin Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/customer" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
