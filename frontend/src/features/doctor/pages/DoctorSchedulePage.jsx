import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { Card } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/Table";

const DoctorSchedulePage = () => {
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState(1);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const params = { doctorId };
      if (date) params.date = date;
      const res = await axiosClient.get("/doctor/appointments", { params });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load appointments");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load appointments when the page mounts so the UI is populated
  // without requiring the user to press the button.
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Doctor Schedule</h1>
        <Button onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <Card className="p-5">
        {/* Wrap controls in a form so Enter submits the search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-neutral-600">DoctorID</label>
              <Input type="number" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-neutral-600">Date (optional)</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button fullWidth type="submit" disabled={loading}>
                Load appointments
              </Button>
            </div>
          </div>
          {error && <div className="mt-3 text-danger-600 text-sm">{error}</div>}
        </form>
      </Card>

      <Card className="p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Pet</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-neutral-500 py-8">
                  No appointments
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.appointmentId}>
                  <TableCell>{new Date(r.scheduleTime).toLocaleString()}</TableCell>
                  <TableCell>{r.branch?.name}</TableCell>
                  <TableCell>
                    <div className="font-medium">{r.pet?.name}</div>
                    <div className="text-xs text-neutral-500">{r.pet?.species}{r.pet?.breed ? ` • ${r.pet.breed}` : ""}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{r.user?.fullName}</div>
                    <div className="text-xs text-neutral-500">{r.user?.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{r.service?.name}</div>
                    <div className="text-xs text-neutral-500">{r.service?.type}</div>
                  </TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/doctor/appointments/${r.appointmentId}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default DoctorSchedulePage;
