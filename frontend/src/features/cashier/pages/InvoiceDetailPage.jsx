import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";

function money(n) {
  const x = Number(n || 0);
  return x.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await axiosClient.get(`/cashier/invoices/${id}`);
        if (!mounted) return;
        setData(res.data?.data || null);
      } catch (e) {
        if (!mounted) return;
        setError(e.response?.data?.error || e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const inv = data?.invoice;
  const pets = data?.pets || [];
  const serviceLines = data?.serviceLines || [];
  const productLines = data?.productLines || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Invoice #{id}</div>
          <div className="text-sm text-neutral-600">
            <Link className="text-secondary-600 hover:underline" to="/cashier/invoices">Back to invoices</Link>
          </div>
        </div>
        {inv && <div className="text-sm text-neutral-600">{new Date(inv.InvoiceDate).toLocaleString()}</div>}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded p-4 text-sm">{error}</div>}
      {loading && <div className="text-sm text-neutral-600">Loading...</div>}

      {inv && (
        <div className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-neutral-500">Customer</div>
            <div className="font-medium">{inv.CustomerName}</div>
            <div className="text-sm text-neutral-600">{inv.CustomerPhone}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Payment</div>
            <div className="font-medium">{inv.PaymentMethod}</div>
            <div className="text-sm text-neutral-600">{inv.PaymentStatus}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Amounts</div>
            <div className="text-sm text-neutral-600">Original: {money(inv.OriginalAmount)}</div>
            <div className="text-sm text-neutral-600">Discount: {money(inv.DiscountAmount)}</div>
            <div className="text-lg font-semibold">Final: {money(inv.FinalAmount)}</div>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg p-4">
        <div className="font-semibold mb-2">Pets</div>
        {pets.length === 0 ? <div className="text-sm text-neutral-600">None</div> : (
          <div className="flex flex-wrap gap-2">
            {pets.map((p) => (
              <span key={p.PetID} className="px-2 py-1 rounded bg-neutral-100 text-sm">{p.PetName} ({p.Species})</span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold">Service Lines</div>
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr className="text-left">
              <th className="p-3">#</th>
              <th className="p-3">Service</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Discount</th>
            </tr>
          </thead>
          <tbody>
            {serviceLines.map((l) => (
              <tr key={l.LineNo} className="border-t">
                <td className="p-3">{l.LineNo}</td>
                <td className="p-3">{l.ServiceName}</td>
                <td className="p-3">{l.Quantity}</td>
                <td className="p-3">{money(l.UnitPrice)}</td>
                <td className="p-3">{money(l.LineAmount)}</td>
                <td className="p-3">{money(l.DiscountAmount)}</td>
              </tr>
            ))}
            {serviceLines.length === 0 && <tr><td className="p-6 text-neutral-600" colSpan={6}>No service lines.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold">Product Lines</div>
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr className="text-left">
              <th className="p-3">#</th>
              <th className="p-3">Product</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Discount</th>
            </tr>
          </thead>
          <tbody>
            {productLines.map((l) => (
              <tr key={l.LineNo} className="border-t">
                <td className="p-3">{l.LineNo}</td>
                <td className="p-3">{l.ProductName}</td>
                <td className="p-3">{l.Quantity}</td>
                <td className="p-3">{money(l.UnitPrice)}</td>
                <td className="p-3">{money(l.LineAmount)}</td>
                <td className="p-3">{money(l.DiscountAmount)}</td>
              </tr>
            ))}
            {productLines.length === 0 && <tr><td className="p-6 text-neutral-600" colSpan={6}>No product lines.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
