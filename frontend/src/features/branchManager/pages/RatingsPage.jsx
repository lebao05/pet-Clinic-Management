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

export default function RatingsPage() {
  const [branchId, setBranchId] = useState(getDefaultBranchId());
  const [from, setFrom] = useState(dateISO(new Date(Date.now() - 30 * 86400000)));
  const [to, setTo] = useState(dateISO(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ratings, setRatings] = useState([]);
  const [summary, setSummary] = useState({ avgService: 0, avgAttitude: 0, avgOverall: 0, total: 0 });

  const params = useMemo(() => ({ branchId, from, to }), [branchId, from, to]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await branchManagerApi.listRatings(params);
      setRatings(res.data?.data?.ratings || []);
      setSummary(res.data?.data?.summary || summary);
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
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Customer Ratings</h1>
          <p className="text-neutral-600">Monitor service quality by branch and date range.</p>
        </div>
        <div className="flex items-center gap-2">
          <input className="w-28 px-3 py-2 border rounded-lg" type="number" min={1} value={branchId} onChange={(e) => setBranchId(Number(e.target.value))} />
          <Button onClick={saveBranch}>Set Branch</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Avg Service</p>
          <p className="text-3xl font-bold text-neutral-900">{summary.avgService.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Avg Attitude</p>
          <p className="text-3xl font-bold text-neutral-900">{summary.avgAttitude.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Avg Overall</p>
          <p className="text-3xl font-bold text-neutral-900">{summary.avgOverall.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Total Ratings</p>
          <p className="text-3xl font-bold text-neutral-900">{summary.total}</p>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Customer</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Service</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Attitude</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Overall</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {ratings.map((r) => (
                <tr key={r.RatingID} className="hover:bg-neutral-50 transition">
                  <td className="px-6 py-4 text-neutral-800">{new Date(r.RatingDate).toLocaleString()}</td>
                  <td className="px-6 py-4 text-neutral-800">{r.CustomerName}</td>
                  <td className="px-6 py-4 text-center">{r.ServiceScore}</td>
                  <td className="px-6 py-4 text-center">{r.AttitudeScore}</td>
                  <td className="px-6 py-4 text-center font-semibold">{r.OverallScore}</td>
                  <td className="px-6 py-4 text-neutral-700">{r.Comment || "—"}</td>
                </tr>
              ))}
              {!ratings.length && !loading && (
                <tr>
                  <td className="px-6 py-8 text-center text-neutral-600" colSpan={6}>No ratings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
