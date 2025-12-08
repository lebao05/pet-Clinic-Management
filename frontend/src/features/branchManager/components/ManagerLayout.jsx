// src/features/branchManager/layouts/ManagerLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../shared/components/layout/Sidebar";
import Navbar from "../../../shared/components/layout/Navbar";

const ManagerLayout = () => {
  const menuItems = [
    { icon: "📊", label: "Dashboard", path: "/manager/dashboard" },
    { icon: "👥", label: "Staff", path: "/manager/staff" },
    { icon: "📦", label: "Inventory", path: "/manager/inventory" },
    { icon: "📅", label: "Appointments", path: "/manager/appointments" },
    { icon: "📈", label: "Reports", path: "/manager/reports" },
  ];

  const user = {
    name: "Manager Name",
    role: "Branch Manager",
    avatar: null,
  };

  const roleSwitcher = (
    <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 rounded-lg">
      <span className="text-sm font-medium text-neutral-700">Role: Branch Manager</span>
      <button className="text-neutral-600 hover:text-neutral-900">⚙️</button>
    </div>
  );

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar logo="🐾" title="PetCareX" subtitle="Veterinary Services" menuItems={menuItems} footer={roleSwitcher} />

      <div className="flex-1 ml-60 flex flex-col overflow-hidden">
        <Navbar title="Dashboard" searchPlaceholder="Search..." user={user} showNotifications={true} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
