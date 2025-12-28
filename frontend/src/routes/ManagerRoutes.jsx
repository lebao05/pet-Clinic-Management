// frontend/src/routes/ManagerRoutes.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ManagerLayout from "../features/branchManager/layouts/ManagerLayout";

// Import all pages
import DashboardPage from "../features/branchManager/pages/DashboardPage";
import RevenuePage from "../features/branchManager/pages/RevenuePage";
import VaccinationPage from "../features/branchManager/pages/VaccinationPage";
import InventoryPage from "../features/branchManager/pages/InventoryPage";
import AppointmentsPage from "../features/branchManager/pages/AppointmentsPage";
import StaffPage from "../features/branchManager/pages/StaffPage";
import CustomersPage from "../features/branchManager/pages/CustomersPage";
import RatingsPage from "../features/branchManager/pages/RatingsPage";
import MedicalHistoryPage from "../features/branchManager/pages/MedicalHistoryPage";

const ManagerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ManagerLayout />}>
        {/* Dashboard - Trang chủ */}
        <Route index element={<DashboardPage />} />

        {/* Doanh thu */}
        <Route path="revenue" element={<RevenuePage />} />

        {/* Tiêm phòng */}
        <Route path="vaccination" element={<VaccinationPage />} />

        {/* Tồn kho */}
        <Route path="inventory" element={<InventoryPage />} />

        {/* Lịch hẹn */}
        <Route path="appointments" element={<AppointmentsPage />} />

        {/* Nhân viên */}
        <Route path="staff" element={<StaffPage />} />

        {/* Khách hàng */}
        <Route path="customers" element={<CustomersPage />} />

        {/* Đánh giá */}
        <Route path="ratings" element={<RatingsPage />} />

        {/* Hồ sơ bệnh án */}
        <Route path="medical-history" element={<MedicalHistoryPage />} />

        {/* Redirect any unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/branch-manager" replace />} />
      </Route>
    </Routes>
  );
};

export default ManagerRoutes;
