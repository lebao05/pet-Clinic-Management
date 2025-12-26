import React from "react";
import { Routes, Route } from "react-router-dom";
import DoctorLayout from "../features/doctor/layouts/DoctorLayout";
import DoctorSchedulePage from "../features/doctor/pages/DoctorSchedulePage";
import AppointmentDetailPage from "../features/doctor/pages/AppointmentDetailPage";

export default function DoctorRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DoctorLayout />}>
        <Route index element={<DoctorSchedulePage />} />
        <Route path="schedule" element={<DoctorSchedulePage />} />
        <Route path="appointments/:id" element={<AppointmentDetailPage />} />
      </Route>
    </Routes>
  );
}
