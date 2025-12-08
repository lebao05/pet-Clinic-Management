// src/features/customer/layouts/CustomerLayout.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar */}
      <nav className="bg-primary-400 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-3xl">🐾</span>
              <span className="text-white font-bold text-xl">PetCareX</span>
            </div>

            {/* Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/customer"
                className="text-white hover:text-primary-50 font-medium border-b-2 border-white pb-1"
              >
                Home
              </Link>
              <Link to="/customer/pets" className="text-white/90 hover:text-white transition">
                My Pets
              </Link>
              <Link to="/customer/appointments" className="text-white/90 hover:text-white transition">
                Appointments
              </Link>
              <Link to="/customer/billing" className="text-white/90 hover:text-white transition">
                Billing
              </Link>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 text-white">
              <div className="text-right">
                <p className="font-medium">John Doe</p>
                <p className="text-xs text-primary-100">Customer</p>
              </div>
              <div className="w-10 h-10 bg-white rounded-full overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=John+Doe&background=14B8A6&color=fff" alt="User" />
              </div>
              <button className="text-white">▼</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center text-sm text-neutral-600">
            <p>© 2024 PetCareX. All Rights Reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-secondary-600">
                Contact Us
              </a>
              <a href="#" className="hover:text-secondary-600">
                FAQ
              </a>
              <a href="#" className="hover:text-secondary-600">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
