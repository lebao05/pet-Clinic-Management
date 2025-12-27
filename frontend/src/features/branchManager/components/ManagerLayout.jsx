import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Package, Calendar, FileText, Bell } from "lucide-react";

const ManagerLayout = () => {
  const navItems = [
    { path: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/manager/staff", label: "Staff", icon: Users },
    { path: "/manager/inventory", label: "Inventory", icon: Package },
    { path: "/manager/appointments", label: "Appointments", icon: Calendar },
    { path: "/manager/reports", label: "Reports", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">PC</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-neutral-900">PetCareX</h1>
              <p className="text-xs text-neutral-600">Veterinary Services</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? "bg-blue-50 text-blue-600" : "text-neutral-700 hover:bg-neutral-100"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-neutral-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900">Manager Name</p>
              <p className="text-xs text-neutral-600">Branch Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - empty or can add breadcrumbs later */}
            <div></div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">Role:</span>
                <span className="text-sm font-medium text-neutral-900">Branch Manager</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ManagerLayout;
