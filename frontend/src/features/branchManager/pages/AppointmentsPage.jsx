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

export default function AppointmentsPage() {
  const [branchId, setBranchId] = useState(getDefaultBranchId());
  const [from, setFrom] = useState(dateISO(new Date(Date.now() - 7 * 86400000)));
  const [to, setTo] = useState(dateISO(new Date()));
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const params = useMemo(() => {
    const p = { branchId, from, to };
    if (status) p.status = status;
    return p;
  }, [branchId, from, to, status]);

  async function load() {
    try {
      setLoading(true);
      setError("");

      console.log("🔍 Loading appointments with params:", params);

      const res = await branchManagerApi.listAppointments(params);

      console.log("📦 API Response:", res);
      console.log("📊 Items:", res.data?.data?.items);

      setItems(res.data?.data?.items || []);
    } catch (e) {
      console.error("❌ Error:", e);
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  // ✅ FIX: Thêm params vào dependency để auto-reload
  useEffect(() => {
    load();
  }, [params]); // ← QUAN TRỌNG!

  function saveBranch() {
    localStorage.setItem("branchId", String(branchId));
    // Không cần gọi load() ở đây vì useEffect sẽ tự động chạy khi branchId thay đổi
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Appointments Overview</h1>
          <p className="text-neutral-600">Track appointments by date range and status (branch-level).</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="w-28 px-3 py-2 border rounded-lg"
            type="number"
            value={branchId}
            min={1}
            onChange={(e) => setBranchId(Number(e.target.value))}
            placeholder="Branch"
          />
          <Button onClick={saveBranch}>Set Branch</Button>
        </div>
      </div>

      <Card>
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-sm text-neutral-600 mb-1">From</label>
            <input
              className="px-3 py-2 border rounded-lg"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-600 mb-1">To</label>
            <input
              className="px-3 py-2 border rounded-lg"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-600 mb-1">Status</label>
            <select className="px-3 py-2 border rounded-lg" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="Booked">Booked</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <Button onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </Card>

      {loading && (
        <Card>
          <div className="text-center py-8 text-neutral-600">Loading appointments...</div>
        </Card>
      )}

      {!loading && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Pet</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Service</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Doctor</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-neutral-600" colSpan={6}>
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  items.map((a) => (
                    <tr key={a.AppointmentID} className="hover:bg-neutral-50 transition">
                      <td className="px-6 py-4 text-neutral-800">{new Date(a.ScheduleTime).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-900">{a.PetName}</div>
                        <div className="text-sm text-neutral-600">{a.Species}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-900">{a.CustomerName}</div>
                        <div className="text-sm text-neutral-600">{a.Phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-900">{a.ServiceName}</div>
                        <div className="text-sm text-neutral-600">{a.ServiceType}</div>
                      </td>
                      <td className="px-6 py-4 text-neutral-800">{a.DoctorName || "—"}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            a.Status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : a.Status === "Booked"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {a.Status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
