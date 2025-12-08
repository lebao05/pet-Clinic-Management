// src/routes/ReceptionistRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import ReceptionistLayout from "../features/receptionist/layouts/ReceptionistLayout";
import BookingCalendarPage from "../features/receptionist/pages/BookingCalendarPage";

const ReceptionistRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ReceptionistLayout />}>
        <Route index element={<BookingCalendarPage />} />
        <Route path="dashboard" element={<div className="p-8">Dashboard Coming Soon</div>} />
        <Route path="calendar" element={<BookingCalendarPage />} />
        <Route path="patients" element={<div className="p-8">Patients Coming Soon</div>} />
        <Route path="billing" element={<div className="p-8">Billing Coming Soon</div>} />
      </Route>
    </Routes>
  );
};

export default ReceptionistRoutes;
