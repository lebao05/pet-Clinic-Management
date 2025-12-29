import React from "react";
import { Routes, Route } from "react-router-dom";
import CashierLayout from "../features/cashier/layouts/CashierLayout";
import PasskeyGate from "../components/PasskeyGate";
import CashierPosPage from "../features/cashier/pages/CashierPosPage";
import CashierInvoicesPage from "../features/cashier/pages/CashierInvoicesPage";
import CashierInvoiceDetailPage from "../features/cashier/pages/CashierInvoiceDetailPage";

const CashierRoutes = () => {
  return (
    <Routes>
  <Route path="/" element={<PasskeyGate role="cashier"><CashierLayout /></PasskeyGate>}>
        <Route index element={<CashierPosPage />} />
        <Route path="pos" element={<CashierPosPage />} />
        <Route path="invoices" element={<CashierInvoicesPage />} />
        <Route path="invoices/:id" element={<CashierInvoiceDetailPage />} />
      </Route>
    </Routes>
  );
};

export default CashierRoutes;