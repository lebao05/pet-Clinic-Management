// src/features/companyAdmin/layouts/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../shared/components/layout/Sidebar";
import Navbar from "../../../shared/components/layout/Navbar";

const AdminLayout = () => {
  const menuItems = [
    { icon: "📊", label: "Dashboard", path: "/admin/dashboard" },
    { icon: "🏢", label: "Branches", path: "/admin/branches" },
    { icon: "👥", label: "Staff", path: "/admin/staff" },
    { icon: "📈", label: "Reports", path: "/admin/reports" },
    { icon: "⚙️", label: "Settings", path: "/admin/settings" },
  ];

  const user = {
    name: "Dr. Alex Chen",
    role: "Company Admin",
    avatar: null,
  };

  const roleSwitcher = (
    <div className="flex items-center justify-between px-4 py-3 bg-secondary-500 text-white rounded-lg">
      <span className="text-sm font-medium">Role: Company Admin</span>
      <button className="hover:text-secondary-100 transition">⚙️</button>
    </div>
  );

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar logo="🐾" title="PetCareX" subtitle="Admin Portal" menuItems={menuItems} footer={roleSwitcher} />

      <div className="flex-1 ml-60 flex flex-col overflow-hidden">
        <Navbar searchPlaceholder="Search..." user={user} showNotifications={true} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
