import React from "react";
import { Routes, Route } from "react-router-dom";
import DoctorLayout from "../features/doctor/layouts/DoctorLayout";
import DoctorSchedulePage from "../features/doctor/pages/DoctorSchedulePage";
import DoctorAppointmentDetailPage from "../features/doctor/pages/DoctorAppointmentDetailPage";
import DoctorVaccineCatalogPage from "../features/doctor/pages/DoctorVaccineCatalogPage";
import DoctorMedicinesPage from "../features/doctor/pages/DoctorMedicinesPage";

const DoctorRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DoctorLayout />}>
        <Route index element={<DoctorSchedulePage />} />
        <Route path="schedule" element={<DoctorSchedulePage />} />
  <Route path="vaccines" element={<DoctorVaccineCatalogPage />} />
  <Route path="medicines" element={<DoctorMedicinesPage />} />
        <Route path="appointments/:id" element={<DoctorAppointmentDetailPage />} />
      </Route>
    </Routes>
  );
};

export default DoctorRoutes;
