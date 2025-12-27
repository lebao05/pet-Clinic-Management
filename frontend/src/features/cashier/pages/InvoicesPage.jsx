import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import useAppSettings from "../../../shared/hooks/useAppSettings";

export default function InvoicesPage() {
  const { settings } = useAppSettings();
  const branchId = settings.branchId;
  const [rows, setRows] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!branchId) return;
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.get("/cashier/invoices", { params: { branchId, from: from || undefined, to: to || undefined } });
      setRows(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Invoices</div>
          <div className="text-sm text-neutral-600">BranchID: {branchId || "(set in sidebar)"}</div>
        </div>
        <div className="flex items-center gap-2">
          <input className="border rounded px-2 py-1" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <span className="text-neutral-500">→</span>
          <input className="border rounded px-2 py-1" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <button className="px-3 py-2 rounded bg-neutral-900 text-white text-sm" onClick={load}>{loading ? "Loading..." : "Filter"}</button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded p-4 text-sm">{error}</div>}
      {!branchId && <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm">Set <b>Branch ID</b> in sidebar.</div>}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr className="text-left">
              <th className="p-3">InvoiceID</th>
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Final</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.InvoiceID} className="border-t">
                <td className="p-3">{r.InvoiceID}</td>
                <td className="p-3 whitespace-nowrap">{new Date(r.InvoiceDate).toLocaleString()}</td>
                <td className="p-3">{r.CustomerName} ({r.CustomerPhone})</td>
                <td className="p-3">{Number(r.FinalAmount).toLocaleString()}</td>
                <td className="p-3">{r.PaymentStatus}</td>
                <td className="p-3">
                  <Link className="text-secondary-600 hover:underline" to={`/cashier/invoices/${r.InvoiceID}`}>Open</Link>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td className="p-6 text-neutral-600" colSpan={6}>No invoices.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
