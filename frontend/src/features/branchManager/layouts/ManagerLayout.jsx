// frontend/src/features/branchManager/layouts/ManagerLayout.jsx

import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  DollarSign,
  Syringe,
  Package,
  Calendar,
  Users,
  Star,
  FileText,
  Menu,
  X,
  LogOut,
  Building2,
} from "lucide-react";

const ManagerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    {
      path: "/branch-manager",
      icon: LayoutDashboard,
      label: "Dashboard",
      color: "text-blue-600",
    },
    {
      path: "/branch-manager/revenue",
      icon: DollarSign,
      label: "Doanh thu",
      color: "text-emerald-600",
    },
    {
      path: "/branch-manager/vaccination",
      icon: Syringe,
      label: "Tiêm phòng",
      color: "text-purple-600",
    },
    {
      path: "/branch-manager/inventory",
      icon: Package,
      label: "Tồn kho",
      color: "text-amber-600",
    },
    {
      path: "/branch-manager/appointments",
      icon: Calendar,
      label: "Lịch hẹn",
      color: "text-rose-600",
    },
    {
      path: "/branch-manager/staff",
      icon: Users,
      label: "Nhân viên",
      color: "text-indigo-600",
    },
    {
      path: "/branch-manager/customers",
      icon: Users,
      label: "Khách hàng",
      color: "text-cyan-600",
    },
    {
      path: "/branch-manager/ratings",
      icon: Star,
      label: "Đánh giá",
      color: "text-yellow-600",
    },
    {
      path: "/branch-manager/medical-history",
      icon: FileText,
      label: "Hồ sơ bệnh án",
      color: "text-pink-600",
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 fixed h-screen overflow-y-auto z-20`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="font-bold text-lg text-gray-900">PetCareX</h1>
                <p className="text-xs text-gray-500">Branch Manager</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  active ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? item.color : ""}`} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 bg-white">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Chi nhánh #1 - Thành phố Thủ Đức</h2>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Nguyễn Văn A</p>
                <p className="text-xs text-gray-500">Quản lý chi nhánh</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ManagerLayout;
