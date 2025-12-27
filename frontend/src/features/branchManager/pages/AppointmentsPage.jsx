import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card } from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import { branchManagerApi } from "../../../api/branchManagerApi";
import { Calendar, Search, Download, RefreshCw, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

// ==================== HELPER FUNCTIONS ====================
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

function formatDateTime(dateString) {
  const date = new Date(dateString);
  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return { time, date: dateStr };
}

// ==================== STATUS BADGE ====================
function StatusBadge({ status }) {
  const config = {
    Completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
    Booked: { bg: "bg-blue-100", text: "text-blue-700", label: "Booked" },
    Scheduled: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Scheduled" },
    Cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
  };
  const style = config[status] || { bg: "bg-gray-100", text: "text-gray-700", label: status };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}

// ==================== STATS CARD ====================
function StatsCard({ title, value, icon: Icon, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
}

// ==================== MAIN COMPONENT ====================
export default function AppointmentsPage() {
  const [branchId, setBranchId] = useState(getDefaultBranchId());
  const [from, setFrom] = useState(dateISO(new Date(Date.now() - 7 * 86400000)));
  const [to, setTo] = useState(dateISO(new Date()));
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==================== STATS CALCULATION ====================
  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter((a) => a.Status === "Completed").length;
    const booked = appointments.filter((a) => a.Status === "Booked" || a.Status === "Scheduled").length;
    const cancelled = appointments.filter((a) => a.Status === "Cancelled").length;

    return { total, completed, booked, cancelled };
  }, [appointments]);

  // ==================== FILTERED DATA ====================
  const filteredAppointments = useMemo(() => {
    let result = appointments;

    // Filter by status
    if (statusFilter) {
      result = result.filter((a) => a.Status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.CustomerName?.toLowerCase().includes(query) ||
          a.PetName?.toLowerCase().includes(query) ||
          a.Phone?.toLowerCase().includes(query) ||
          a.DoctorName?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [appointments, statusFilter, searchQuery]);

  // ==================== LOAD DATA ====================
  const load = useCallback(async () => {
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

      const params = {
        branchId,
        from,
        to,
        ...(statusFilter && { status: statusFilter }),
      };

      const res = await branchManagerApi.listAppointments(params);
      setAppointments(res.data?.data?.items || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [branchId, from, to, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // ==================== HANDLERS ====================
  function saveBranch() {
    localStorage.setItem("branchId", String(branchId));
    load();
  }

  function handleExport() {
    const headers = ["Time", "Pet", "Customer", "Phone", "Service", "Doctor", "Status"];
    const rows = filteredAppointments.map((a) => {
      const { time, date } = formatDateTime(a.ScheduleTime);
      return [
        `${date} ${time}`,
        a.PetName,
        a.CustomerName,
        a.Phone || "",
        a.ServiceName,
        a.DoctorName || "—",
        a.Status,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `appointments_${branchId}_${from}_${to}.csv`;
    link.click();
  }

  // ==================== RENDER ====================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Appointments</h1>
          <p className="text-sm text-neutral-600 mt-1">Manage and track appointments by date range and status</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={load} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleExport} variant="outline" disabled={filteredAppointments.length === 0}>
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

      {/* Date Range Filter - SIMPLIFIED LIKE REPORTS */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Booked">Booked</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total" value={stats.total} icon={Calendar} color="blue" />
        <StatsCard title="Completed" value={stats.completed} icon={CheckCircle} color="green" />
        <StatsCard title="Booked" value={stats.booked} icon={Clock} color="yellow" />
        <StatsCard title="Cancelled" value={stats.cancelled} icon={XCircle} color="red" />
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by customer, pet, phone, or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-neutral-600">
            Found {filteredAppointments.length} of {appointments.length} appointments
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Pet</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Doctor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading appointments...
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                    {searchQuery || statusFilter
                      ? "No appointments found. Try adjusting your filters."
                      : "No appointments found for the selected date range."}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => {
                  const { time, date } = formatDateTime(appointment.ScheduleTime);
                  return (
                    <tr key={appointment.AppointmentID} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-neutral-900">{time}</div>
                        <div className="text-xs text-neutral-500">{date}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-neutral-900">{appointment.PetName}</div>
                        <div className="text-xs text-neutral-500">{appointment.Species}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-neutral-900">{appointment.CustomerName}</div>
                        <div className="text-xs text-neutral-500">{appointment.Phone || "—"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-neutral-900">{appointment.ServiceName}</div>
                        <div className="text-xs text-neutral-500">{appointment.ServiceType}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-900">{appointment.DoctorName || "—"}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={appointment.Status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with count */}
        {!loading && filteredAppointments.length > 0 && (
          <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50 text-sm text-neutral-600">
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </div>
        )}
      </Card>
    </div>
  );
}
