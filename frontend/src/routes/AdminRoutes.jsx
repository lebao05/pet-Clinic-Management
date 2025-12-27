// src/routes/AdminRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../features/companyAdmin/layouts/AdminLayout";
import DashboardPage from "../features/companyAdmin/pages/DashboardPage";
import BranchesPage from "../features/companyAdmin/pages/BranchesPage";
import EmployeesPage from "../features/companyAdmin/pages/EmployeePage";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="staff" element={<EmployeesPage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
