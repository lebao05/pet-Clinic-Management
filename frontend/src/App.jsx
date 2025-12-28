// frontend/src/App.jsx

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
import DoctorRoutes from "./routes/DoctorRoutes";
import CashierRoutes from "./routes/CashierRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<CustomerHomePage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
          <Route path="my-pets" element={<div>My Pets Coming Soon</div>} />
          <Route path="appointments" element={<div>Appointments Coming Soon</div>} />
          <Route path="billing" element={<div>Billing Coming Soon</div>} />
        </Route>

        {/* Branch Manager Routes */}
        <Route path="/branch-manager/*" element={<ManagerRoutes />} />

        {/* Receptionist Routes */}
        <Route path="/receptionist/*" element={<ReceptionistRoutes />} />

        {/* Doctor Routes */}
        <Route path="/doctor/*" element={<DoctorRoutes />} />

        {/* Cashier Routes */}
        <Route path="/cashier/*" element={<CashierRoutes />} />

        {/* Company Admin Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
