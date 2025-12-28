// src/features/customer/layouts/CustomerLayout.jsx
import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

const CustomerLayout = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItemClass = ({ isActive }) =>
    `font-medium transition ${
      isActive
        ? "text-white border-b-2 border-white pb-1"
        : "text-white/90 hover:text-white"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Navbar */}
      <nav className="bg-[#14B8A6] sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-3xl">🐾</span>
              <span className="text-white font-bold text-xl">PetCareX</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink to="/customer" end className={navItemClass}>
                Home
              </NavLink>
              <NavLink to="/customer/pets" className={navItemClass}>
                My Pets
              </NavLink>
              <NavLink to="/customer/appointments" className={navItemClass}>
                Appointments
              </NavLink>
              <NavLink to="/customer/billing" className={navItemClass}>
                Billing
              </NavLink>
            </div>

            {/* User */}
            <div className="hidden md:flex items-center gap-3 text-white">
              <div className="text-right">
                <p className="font-medium">{user?.fullName || "User"}</p>
                <p className="text-xs text-white/80">Customer</p>
              </div>

              <img
                className="w-9 h-9 rounded-full"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.fullName || "User"
                )}&background=14B8A6&color=fff`}
                alt="User"
              />

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-full transition"
                title="Đăng xuất"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile button */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden text-white text-2xl"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden bg-[#14B8A6] px-6 py-4 space-y-3">
            <NavLink onClick={() => setOpen(false)} to="/customer" end className={navItemClass}>
              Home
            </NavLink>
            <NavLink onClick={() => setOpen(false)} to="/customer/pets" className={navItemClass}>
              My Pets
            </NavLink>
            <NavLink onClick={() => setOpen(false)} to="/customer/appointments" className={navItemClass}>
              Appointments
            </NavLink>
            <NavLink onClick={() => setOpen(false)} to="/customer/billing" className={navItemClass}>
              Billing
            </NavLink>

            <div className="border-t border-white/30 pt-3 mt-3">
              <p className="text-white font-medium">
                {user?.fullName || "User"}
              </p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-white/90 hover:text-white mt-2"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200">
        <div className="container mx-auto px-6 py-6 text-sm text-neutral-600 flex flex-col md:flex-row justify-between gap-4">
          <p>© 2024 PetCareX. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-secondary-600">
              Contact
            </a>
            <a href="#" className="hover:text-secondary-600">
              FAQ
            </a>
            <a href="#" className="hover:text-secondary-600">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
