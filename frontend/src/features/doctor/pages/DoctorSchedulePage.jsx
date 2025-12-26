import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import useAppSettings from "../../../shared/hooks/useAppSettings";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function DoctorSchedulePage() {
  const { settings } = useAppSettings();
  const doctorId = settings.doctorId;
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canLoad = useMemo(() => !!doctorId, [doctorId]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!canLoad) return;
      setLoading(true);
      setError("");
      try {
        const res = await axiosClient.get("/doctor/appointments", {
          params: { doctorId, date },
        });
        if (!mounted) return;
        setRows(res.data?.data || []);
      } catch (e) {
        if (!mounted) return;
        setError(e.response?.data?.error || e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [doctorId, date, canLoad]);

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Doctor Schedule</div>
          <div className="text-sm text-neutral-600">DoctorID: {doctorId || "(set in sidebar)"}</div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-600">Date</label>
          <input className="border rounded px-2 py-1" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {!canLoad && (
        <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm">
          Please set <b>Doctor ID</b> in the sidebar to load appointments.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-semibold">Appointments ({rows.length})</div>
          {loading && <div className="text-sm text-neutral-600">Loading...</div>}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50">
              <tr className="text-left">
                <th className="p-3">Time</th>
                <th className="p-3">Pet</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Service</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.AppointmentID} className="border-t">
                  <td className="p-3 whitespace-nowrap">{new Date(r.ScheduleTime).toLocaleString()}</td>
                  <td className="p-3">{r.PetName} ({r.Species})</td>
                  <td className="p-3">{r.OwnerName} - {r.OwnerPhone}</td>
                  <td className="p-3">{r.ServiceName} <span className="text-neutral-500">({r.ServiceType})</span></td>
                  <td className="p-3">{r.Status}</td>
                  <td className="p-3">
                    <Link className="text-secondary-600 hover:underline" to={`/doctor/appointments/${r.AppointmentID}`}>Open</Link>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="p-6 text-neutral-600" colSpan={6}>No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
