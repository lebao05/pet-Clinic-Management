import React from "react";
import { Routes, Route } from "react-router-dom";
import CashierLayout from "../features/cashier/layouts/CashierLayout";
import POSPage from "../features/cashier/pages/POSPage";
import InvoicesPage from "../features/cashier/pages/InvoicesPage";
import InvoiceDetailPage from "../features/cashier/pages/InvoiceDetailPage";

export default function CashierRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CashierLayout />}>
        <Route index element={<POSPage />} />
        <Route path="pos" element={<POSPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />
      </Route>
    </Routes>
  );
}
