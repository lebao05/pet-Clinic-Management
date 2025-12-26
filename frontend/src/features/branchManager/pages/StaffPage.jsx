import React, { useEffect, useState } from "react";
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

export default function StaffPage() {
  const [branchId, setBranchId] = useState(getDefaultBranchId());
  const [date, setDate] = useState(dateISO(new Date()));

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newEmployeeId, setNewEmployeeId] = useState("");
  const [newStartDate, setNewStartDate] = useState(dateISO(new Date()));

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

  async function createAssignment() {
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

  async function endAssignment(assignmentId) {
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Staff (Branch Assignment)</h1>
          <p className="text-neutral-600">View active staff in a branch, and manage assignment history.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="w-28 px-3 py-2 border rounded-lg"
            type="number"
            min={1}
            value={branchId}
            onChange={(e) => setBranchId(Number(e.target.value))}
          />
          <Button onClick={saveBranch}>Set Branch</Button>
        </div>
      </div>

      {error && <p className="text-sm text-danger-600">{error}</p>}

      <Card>
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-sm text-neutral-600 mb-1">As of date</label>
            <input className="px-3 py-2 border rounded-lg" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <Button onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-neutral-900 mb-4">Assign Employee to this Branch</h3>
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-sm text-neutral-600 mb-1">EmployeeID</label>
            <input
              className="w-40 px-3 py-2 border rounded-lg"
              type="number"
              value={newEmployeeId}
              onChange={(e) => setNewEmployeeId(e.target.value)}
              placeholder="e.g. 12"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-600 mb-1">StartDate</label>
            <input className="px-3 py-2 border rounded-lg" type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} />
          </div>
          <Button onClick={createAssignment} disabled={!newEmployeeId}>Create Assignment</Button>
          <p className="text-sm text-neutral-600">Tip: Manager can assign Doctor / Cashier / Receptionist by EmployeeID.</p>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Employee</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Work Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Assignment</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {staff.map((s) => (
                <tr key={s.AssignmentID} className="hover:bg-neutral-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">{s.FullName}</div>
                    <div className="text-sm text-neutral-600">#{s.EmployeeID}</div>
                  </td>
                  <td className="px-6 py-4 text-neutral-700">{s.Role}</td>
                  <td className="px-6 py-4 text-neutral-700">{s.WorkStatus}</td>
                  <td className="px-6 py-4 text-neutral-700">
                    <div className="text-sm">Start: {s.StartDate ? String(s.StartDate).slice(0,10) : "—"}</div>
                    <div className="text-sm">End: {s.EndDate ? String(s.EndDate).slice(0,10) : "—"}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button variant="secondary" onClick={() => endAssignment(s.AssignmentID)}>End Today</Button>
                  </td>
                </tr>
              ))}
              {!staff.length && !loading && (
                <tr>
                  <td className="px-6 py-8 text-center text-neutral-600" colSpan={5}>No active staff found for this branch/date.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
