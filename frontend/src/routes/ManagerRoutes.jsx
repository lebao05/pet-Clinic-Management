// src/routes/ManagerRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import ManagerLayout from "../features/branchManager/layouts/ManagerLayout";
import DashboardPage from "../features/branchManager/pages/DashboardPage";
import StaffPage from "../features/branchManager/pages/StaffPage";
import InventoryPage from "../features/branchManager/pages/InventoryPage";

const ManagerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ManagerLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="appointments" element={<div className="p-8">Appointments Coming Soon</div>} />
        <Route path="reports" element={<div className="p-8">Reports Coming Soon</div>} />
      </Route>
    </Routes>
  );
};

export default ManagerRoutes;
