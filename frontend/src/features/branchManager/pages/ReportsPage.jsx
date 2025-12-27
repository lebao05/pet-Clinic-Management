import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import { branchManagerApi } from "../../../api/branchManagerApi";
import { RefreshCw, Download, TrendingUp, FileText, AlertCircle } from "lucide-react";

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
    // Validate dates
    const fromD = new Date(from);
    const toD = new Date(to);

    if (fromD > toD) {
      setError("Start date must be before end date");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await branchManagerApi.revenueReport(params);
      setDaily(res.data?.data?.daily || []);
      setTotals(res.data?.data?.totals || { totalAmount: 0, totalInvoices: 0 });
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

  function handleExport() {
    const headers = ["Date", "Amount (VNĐ)", "Invoices"];
    const rows = daily.map((r) => [r.date, Number(r.amount).toFixed(2), r.invoiceCount]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `revenue_report_${branchId}_${from}_${to}.csv`;
    link.click();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Revenue Report</h1>
          <p className="text-sm text-neutral-600 mt-1">Paid invoices aggregated by day.</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={load} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleExport} variant="outline" disabled={daily.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Testing Controls - Collapsible */}
      <details className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
        <summary className="cursor-pointer font-medium text-neutral-700 text-sm">
          🔧 Testing Controls (Click to expand)
        </summary>
        <div className="flex gap-4 items-end mt-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Branch ID (for testing)</label>
            <input
              type="number"
              value={branchId}
              onChange={(e) => setBranchId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
            />
          </div>
          <Button onClick={saveBranch} variant="primary">
            Load Data
          </Button>
        </div>
        <div className="mt-2 text-xs text-neutral-600 bg-blue-50 p-2 rounded border border-blue-200">
          💡 <strong>Tip:</strong> Change Branch ID to test different branches (1, 2, 3, etc.)
        </div>
      </details>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                {totals.totalAmount.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-neutral-500 mt-1">VNĐ</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 text-green-600">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Paid Invoices</p>
              <p className="text-3xl font-bold text-blue-600">{totals.totalInvoices}</p>
              <p className="text-xs text-neutral-500 mt-1">transactions</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-8 h-8" />
            </div>
          </div>
        </Card>
      </div>

      {/* Date Range Filter */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              max={to}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              min={from}
              max={dateISO(new Date())}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              className="w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={load}
              disabled={loading}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </Card>

      {/* Revenue Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Amount (VNĐ)</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 uppercase">Invoices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-neutral-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading data...
                  </td>
                </tr>
              ) : daily.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-neutral-500">
                    No revenue data found for the selected period.
                  </td>
                </tr>
              ) : (
                daily.map((r, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-neutral-900">
                      {new Date(r.date).toLocaleDateString("vi-VN", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-neutral-900">
                      {Number(r.amount).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-neutral-600">{r.invoiceCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && daily.length > 0 && (
          <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50 text-sm text-neutral-600">
            Showing {daily.length} days of revenue data
          </div>
        )}
      </Card>
    </div>
  );
}
