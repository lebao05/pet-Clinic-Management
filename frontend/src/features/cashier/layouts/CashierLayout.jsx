import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../shared/components/layout/Sidebar";
import Navbar from "../../../shared/components/layout/Navbar";
import useAppSettings from "../../../shared/hooks/useAppSettings";

export default function CashierLayout() {
  const { settings, setSetting } = useAppSettings();

  const menuItems = [
    { icon: "🧾", label: "POS", path: "/cashier/pos" },
    { icon: "📄", label: "Invoices", path: "/cashier/invoices" },
  ];

  const footer = (
    <div className="space-y-2 text-sm">
      <div className="text-neutral-600">Staff ID</div>
      <input
        className="w-full border rounded px-2 py-1"
        value={settings.cashierId || ""}
        onChange={(e) => setSetting("cashierId", e.target.value)}
        placeholder="e.g. 2"
      />
      <div className="text-neutral-600">Branch ID</div>
      <input
        className="w-full border rounded px-2 py-1"
        value={settings.branchId || ""}
        onChange={(e) => setSetting("branchId", e.target.value)}
        placeholder="e.g. 1"
      />
    </div>
  );

  const user = { name: "Cashier", role: "Cashier" };

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar logo="🐾" title="PetCareX" subtitle="Cashier" menuItems={menuItems} footer={footer} />
      <div className="flex-1 ml-60 flex flex-col overflow-hidden">
        <Navbar searchPlaceholder="Search invoice, phone..." user={user} showNotifications={false} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
