import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import { branchManagerApi } from "../../../api/branchManagerApi";

function getDefaultBranchId() {
  const v = localStorage.getItem("branchId");
  return v ? Number(v) : 1;
}

function dateISO(d) {
  const x = new Date(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ReportsPage() {
  const [branchId, setBranchId] = useState(getDefaultBranchId());
  const [from, setFrom] = useState(dateISO(new Date(Date.now() - 30 * 86400000)));
  const [to, setTo] = useState(dateISO(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [daily, setDaily] = useState([]);
  const [totals, setTotals] = useState({ totalAmount: 0, totalInvoices: 0 });

  const params = useMemo(() => ({ branchId, from, to }), [branchId, from, to]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await branchManagerApi.revenueReport(params);
      setDaily(res.data?.data?.daily || []);
      setTotals(res.data?.data?.totals || totals);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveBranch() {
    localStorage.setItem("branchId", String(branchId));
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Revenue Report</h1>
          <p className="text-neutral-600">Paid invoices aggregated by day.</p>
        </div>
        <div className="flex items-center gap-2">
          <input className="w-28 px-3 py-2 border rounded-lg" type="number" min={1} value={branchId} onChange={(e) => setBranchId(Number(e.target.value))} />
          <Button onClick={saveBranch}>Set Branch</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-neutral-900">{totals.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Total Paid Invoices</p>
          <p className="text-3xl font-bold text-neutral-900">{totals.totalInvoices}</p>
        </Card>
      </div>

      <Card>
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-sm text-neutral-600 mb-1">From</label>
            <input className="px-3 py-2 border rounded-lg" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-neutral-600 mb-1">To</label>
            <input className="px-3 py-2 border rounded-lg" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <Button onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
          {error && <p className="text-sm text-danger-600">{error}</p>}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Date</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">Amount</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">Invoices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {daily.map((r) => (
                <tr key={r.date} className="hover:bg-neutral-50 transition">
                  <td className="px-6 py-4 text-neutral-800">{r.date}</td>
                  <td className="px-6 py-4 text-right font-medium text-neutral-900">
                    {Number(r.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-neutral-800">{r.invoiceCount}</td>
                </tr>
              ))}
              {!daily.length && !loading && (
                <tr>
                  <td className="px-6 py-8 text-center text-neutral-600" colSpan={3}>No revenue data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
