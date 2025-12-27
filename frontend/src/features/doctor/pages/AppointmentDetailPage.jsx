import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import useAppSettings from "../../../shared/hooks/useAppSettings";

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const { settings } = useAppSettings();
  const doctorId = settings.doctorId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [saving, setSaving] = useState(false);
  const canSave = useMemo(() => !!doctorId, [doctorId]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await axiosClient.get(`/doctor/appointments/${id}`);
        if (!mounted) return;
        setData(res.data?.data || null);
      } catch (e) {
        if (!mounted) return;
        setError(e.response?.data?.error || e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    async function loadVaccines() {
      try {
        const res = await axiosClient.get("/doctor/vaccines");
        if (!mounted) return;
        setVaccines(res.data?.data || []);
      } catch {
        // silent
      }
    }
    loadVaccines();
    return () => { mounted = false; };
  }, []);

  const appointment = data?.appointment;
  const [status, setStatus] = useState("");
  const [exam, setExam] = useState({ symptoms: "", diagnosis: "", prescription: "", nextVisitDate: "" });
  const [vacc, setVacc] = useState({ vaccineId: "", dose: "", dateGiven: "", note: "" });

  useEffect(() => {
    if (!appointment) return;
    setStatus(appointment.Status || "Booked");
    const er = data?.exam;
    setExam({
      symptoms: er?.Symptoms || "",
      diagnosis: er?.Diagnosis || "",
      prescription: er?.Prescription || "",
      nextVisitDate: er?.NextVisitDate ? String(er.NextVisitDate).slice(0, 10) : "",
    });
    const vr = data?.vaccination;
    setVacc({
      vaccineId: vr?.VaccineID ? String(vr.VaccineID) : "",
      dose: vr?.Dose || "",
      dateGiven: vr?.DateGiven ? String(vr.DateGiven).slice(0, 10) : "",
      note: vr?.Note || "",
    });
  }, [appointment, data]);

  async function saveStatus() {
    setSaving(true);
    setError("");
    try {
      await axiosClient.patch(`/doctor/appointments/${id}/status`, { status });
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveExam() {
    if (!canSave) return;
    setSaving(true);
    setError("");
    try {
      await axiosClient.post(`/doctor/exam-records`, {
        appointmentId: Number(id),
        doctorId: Number(doctorId),
        ...exam,
        nextVisitDate: exam.nextVisitDate || null,
      });
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveVaccination() {
    if (!canSave) return;
    setSaving(true);
    setError("");
    try {
      await axiosClient.post(`/doctor/vaccination-records`, {
        appointmentId: Number(id),
        doctorId: Number(doctorId),
        vaccineId: Number(vacc.vaccineId),
        dose: vacc.dose || null,
        dateGiven: vacc.dateGiven,
        note: vacc.note || null,
      });
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Appointment Detail</div>
          <div className="text-sm text-neutral-600">
            <Link className="text-secondary-600 hover:underline" to="/doctor/schedule">Back to schedule</Link>
          </div>
        </div>
        <div className="text-sm text-neutral-600">DoctorID: {doctorId || "(set in sidebar)"}</div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded p-4 text-sm">{error}</div>}
      {loading && <div className="text-sm text-neutral-600">Loading...</div>}

      {appointment && (
        <div className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-neutral-500">Pet</div>
            <div className="font-medium">{appointment.PetName} ({appointment.Species})</div>
            <div className="text-sm text-neutral-600">Owner: {appointment.OwnerName} ({appointment.OwnerPhone})</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Service</div>
            <div className="font-medium">{appointment.ServiceName}</div>
            <div className="text-sm text-neutral-600">Type: {appointment.ServiceType}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Schedule</div>
            <div className="font-medium">{new Date(appointment.ScheduleTime).toLocaleString()}</div>
            <div className="text-sm text-neutral-600">Branch: {appointment.BranchName}</div>
          </div>
        </div>
      )}

      {appointment && (
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Status</div>
            <button
              className="px-3 py-1 rounded bg-secondary-600 text-white text-sm disabled:opacity-50"
              disabled={saving}
              onClick={saveStatus}
            >
              Save
            </button>
          </div>
          <select className="border rounded px-2 py-2 w-full max-w-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Booked">Booked</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Exam Record</div>
            <button
              className="px-3 py-1 rounded bg-secondary-600 text-white text-sm disabled:opacity-50"
              disabled={saving || !canSave}
              onClick={saveExam}
            >
              Save
            </button>
          </div>
          {!canSave && <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">Set Doctor ID in sidebar to save.</div>}
          <textarea className="border rounded px-2 py-2 w-full" rows={3} placeholder="Symptoms" value={exam.symptoms} onChange={(e) => setExam((s) => ({ ...s, symptoms: e.target.value }))} />
          <textarea className="border rounded px-2 py-2 w-full" rows={3} placeholder="Diagnosis" value={exam.diagnosis} onChange={(e) => setExam((s) => ({ ...s, diagnosis: e.target.value }))} />
          <textarea className="border rounded px-2 py-2 w-full" rows={3} placeholder="Prescription" value={exam.prescription} onChange={(e) => setExam((s) => ({ ...s, prescription: e.target.value }))} />
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-600">Next visit</label>
            <input className="border rounded px-2 py-1" type="date" value={exam.nextVisitDate} onChange={(e) => setExam((s) => ({ ...s, nextVisitDate: e.target.value }))} />
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Vaccination Record</div>
            <button
              className="px-3 py-1 rounded bg-secondary-600 text-white text-sm disabled:opacity-50"
              disabled={saving || !canSave}
              onClick={saveVaccination}
            >
              Save
            </button>
          </div>
          {!canSave && <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">Set Doctor ID in sidebar to save.</div>}

          <div>
            <div className="text-sm text-neutral-600 mb-1">Vaccine</div>
            <select className="border rounded px-2 py-2 w-full" value={vacc.vaccineId} onChange={(e) => setVacc((s) => ({ ...s, vaccineId: e.target.value }))}>
              <option value="">-- select --</option>
              {vaccines.map((v) => (
                <option key={v.VaccineID} value={String(v.VaccineID)}>{v.VaccineName}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className="border rounded px-2 py-2" placeholder="Dose" value={vacc.dose} onChange={(e) => setVacc((s) => ({ ...s, dose: e.target.value }))} />
            <input className="border rounded px-2 py-2" type="date" value={vacc.dateGiven} onChange={(e) => setVacc((s) => ({ ...s, dateGiven: e.target.value }))} />
          </div>
          <textarea className="border rounded px-2 py-2 w-full" rows={3} placeholder="Note" value={vacc.note} onChange={(e) => setVacc((s) => ({ ...s, note: e.target.value }))} />
        </div>
      </div>
    </div>
  );
}
