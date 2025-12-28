// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Customer
import CustomerLayout from "./features/customer/layouts/CustomerLayout";
import CustomerHomePage from "./features/customer/pages/HomePage";
import CustomerProfilePage from "./features/customer/pages/ProfilePage";
import ProductSearchPage from "./features/customer/pages/ProductSearchPage";
import DoctorSearchPage from "./features/customer/pages/DoctorSearchPage";
import AppointmentBookingPage from "./features/customer/pages/AppointmentBookingPage";
import AppointmentsPage from "./features/customer/pages/AppointmentsPage";
import HistoryPage from "./features/customer/pages/HistoryPage";
import PetsPage from "./features/customer/pages/PetsPage";
import PetDetailPage from "./features/customer/pages/PetDetailPage";
import LoginPage from "./features/customer/pages/LoginPage";
import RegisterPage from "./features/customer/pages/RegisterPage";

// Routes
import ManagerRoutes from "./routes/ManagerRoutes";
import ReceptionistRoutes from "./routes/ReceptionistRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import DoctorRoutes from "./routes/DoctorRoutes";
import CashierRoutes from "./routes/CashierRoutes";
import OwnerLogin from "./features/companyAdmin/pages/OwnerLogin";

// Context
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/customer" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/customer" replace /> : <RegisterPage />}
      />

      {/* Customer Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerHomePage />} />
        <Route path="products" element={<ProductSearchPage />} />
        <Route path="doctors" element={<DoctorSearchPage />} />
        <Route path="booking" element={<AppointmentBookingPage />} />
        <Route path="billing" element={<HistoryPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="pets" element={<PetsPage />} />
        <Route path="pets/:id" element={<PetDetailPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        {/* <Route path="billing" element={<div className="p-8">Billing Coming Soon</div>} /> */}
      </Route>

      {/* Branch Manager Routes */}
      <Route path="/manager/*" element={<ManagerRoutes />} />

      {/* Receptionist Routes */}
      <Route path="/receptionist/*" element={<ReceptionistRoutes />} />

      {/* Doctor Routes */}
      <Route path="/doctor/*" element={<DoctorRoutes />} />

      {/* Cashier Routes */}
      <Route path="/cashier/*" element={<CashierRoutes />} />

      {/* Company Admin Routes */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/customer" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
