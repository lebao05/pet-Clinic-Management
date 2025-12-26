// src/routes/ManagerRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import ManagerLayout from "../features/branchManager/layouts/ManagerLayout";
import DashboardPage from "../features/branchManager/pages/DashboardPage";
import StaffPage from "../features/branchManager/pages/StaffPage";
import InventoryPage from "../features/branchManager/pages/InventoryPage";
import AppointmentsPage from "../features/branchManager/pages/AppointmentsPage";
import ServicesPage from "../features/branchManager/pages/ServicesPage";
import RatingsPage from "../features/branchManager/pages/RatingsPage";
import ReportsPage from "../features/branchManager/pages/ReportsPage";

const ManagerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ManagerLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="ratings" element={<RatingsPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
};

export default ManagerRoutes;
