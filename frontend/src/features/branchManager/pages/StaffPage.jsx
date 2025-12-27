import React, { useEffect, useState, useMemo } from "react";
import { Card } from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import { branchManagerApi } from "../../../api/branchManagerApi";
import { UserPlus, UserMinus, AlertCircle, Search, RefreshCw } from "lucide-react";

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

export default function StaffPage() {
  const [branchId, setBranchId] = useState(getDefaultBranchId());
  const [date, setDate] = useState(dateISO(new Date()));
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [newEmployeeId, setNewEmployeeId] = useState("");
  const [newStartDate, setNewStartDate] = useState(dateISO(new Date()));

  // ==================== FILTERED STAFF ====================
  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return staff;

    const query = searchQuery.toLowerCase();
    return staff.filter(
      (s) =>
        s.FullName?.toLowerCase().includes(query) ||
        String(s.EmployeeID).includes(query) ||
        s.Role?.toLowerCase().includes(query) ||
        s.WorkStatus?.toLowerCase().includes(query)
    );
  }, [staff, searchQuery]);

  // ==================== LOAD DATA ====================
  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await branchManagerApi.listStaff(branchId, date);
      setStaff(res.data?.data?.staff || []);
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

  // ==================== CREATE ASSIGNMENT ====================
  async function createAssignment() {
    if (!newEmployeeId) {
      setError("Please enter Employee ID");
      return;
    }

    try {
      setError("");
      await branchManagerApi.createAssignment({
        employeeId: Number(newEmployeeId),
        branchId,
        startDate: newStartDate,
      });
      setNewEmployeeId("");
      load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  // ==================== END ASSIGNMENT ====================
  async function endAssignment(assignmentId, employeeName) {
    const confirmed = window.confirm(`Are you sure you want to end the assignment for ${employeeName}?`);

    if (!confirmed) return;

    try {
      setError("");
      await branchManagerApi.endAssignment(assignmentId, dateISO(new Date()));
      load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Staff Management</h1>
          <p className="text-sm text-neutral-600 mt-1">View active staff in a branch, and manage assignment history.</p>
        </div>

        <Button onClick={load} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters - Hidden Branch ID Input (for testing only) */}
      <details className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
        <summary className="cursor-pointer font-medium text-neutral-700 text-sm">
          🔧 Testing Controls (Click to expand)
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Branch ID (for testing)</label>
            <input
              type="number"
              value={branchId}
              onChange={(e) => setBranchId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={saveBranch} variant="primary" className="w-full">
              Load Data
            </Button>
          </div>
        </div>
        <div className="mt-2 text-xs text-neutral-600 bg-blue-50 p-2 rounded border border-blue-200">
          💡 <strong>Tip:</strong> Change Branch ID to test different branches (1, 2, 3, etc.)
        </div>
      </details>

      {/* Add New Assignment */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center">
          <UserPlus className="w-4 h-4 mr-2" />
          Assign New Employee
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Employee ID *</label>
            <input
              type="number"
              value={newEmployeeId}
              onChange={(e) => setNewEmployeeId(e.target.value)}
              placeholder="Enter Employee ID"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Start Date *</label>
            <input
              type="date"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={createAssignment} variant="primary" className="w-full" disabled={!newEmployeeId}>
              <UserPlus className="w-4 h-4 mr-2" />
              Assign Employee
            </Button>
          </div>
        </div>
        <p className="text-xs text-neutral-600 mt-2">
          💡 Tip: You can assign Doctors, Cashiers, or Receptionists by their Employee ID
        </p>
      </Card>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, employee ID, role, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-neutral-600">
            Found {filteredStaff.length} of {staff.length} staff members
          </div>
        )}
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-600">Total Staff</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{staff.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600">Active Status</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {staff.filter((s) => s.WorkStatus === "Active").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600">Doctors</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{staff.filter((s) => s.Role === "Doctor").length}</div>
        </Card>
      </div>

      {/* Staff Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Work Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">
                  Assignment Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading staff...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                    {searchQuery
                      ? `No staff found matching "${searchQuery}"`
                      : "No active staff found for this branch/date."}
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr key={s.AssignmentID} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-neutral-900">{s.FullName}</div>
                      <div className="text-xs text-neutral-500">ID: {s.EmployeeID}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {s.Role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          s.WorkStatus === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {s.WorkStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="text-xs text-neutral-500 w-12">Start:</span>
                          <span className="font-medium">
                            {s.StartDate ? new Date(s.StartDate).toLocaleDateString("vi-VN") : "—"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-neutral-500 w-12">End:</span>
                          <span className={s.EndDate ? "font-medium" : "text-neutral-400"}>
                            {s.EndDate ? new Date(s.EndDate).toLocaleDateString("vi-VN") : "Ongoing"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {!s.EndDate && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => endAssignment(s.AssignmentID, s.FullName)}
                          className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          End
                        </Button>
                      )}
                      {s.EndDate && <span className="text-xs text-neutral-400 italic">Ended</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filteredStaff.length > 0 && (
          <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50 text-sm text-neutral-600">
            Showing {filteredStaff.length} {searchQuery && `of ${staff.length}`} staff member(s)
          </div>
        )}
      </Card>
    </div>
  );
}
