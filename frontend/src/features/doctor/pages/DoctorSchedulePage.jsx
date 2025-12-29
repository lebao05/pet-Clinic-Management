import React, { useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { Card } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

// Simple dropdown + datalist component to select a doctor (fetches active doctors)
const SelectDoctors = ({ value, onChange }) => {
  const [doctors, setDoctors] = React.useState([]);
  const [input, setInput] = React.useState(value ? String(value) : "");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axiosClient.get('/company-owner/employees', { params: { role: 'Doctor', page: 1, pageSize: 1000 } });
        if (!mounted) return;
        const data = res.data && res.data.data ? res.data.data : [];
        setDoctors(data.map(d => ({ id: d.EmployeeID, name: d.FullName })));
      } catch (e) {
        console.warn('Failed to load doctors', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => { setInput(value ? String(value) : ''); }, [value]);

  const onInputChange = (v) => {
    setInput(v);
    const match = doctors.find(d => String(d.id) === String(v));
    if (match) onChange(Number(match.id));
    else onChange('');
  };

  return (
    <div>
      <input list="doctors-list" value={input} onChange={(e) => onInputChange(e.target.value)} className="w-full" />
      <datalist id="doctors-list">
        {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </datalist>
    </div>
  );
};

const DoctorSchedulePage = () => {
  const [searchPetId, setSearchPetId] = useState("");
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [appointmentQuery, setAppointmentQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [history, setHistory] = useState({ exams: [], vaccinations: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchPets = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Only exact search by petId for doctor
      if (!searchPetId) {
        setError("Enter PetID (exact)");
        setPets([]);
        setLoading(false);
        return;
      }
      const res = await axiosClient.get("/doctor/search-pets", { params: { petId: Number(searchPetId) } });
      setPets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search pets");
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (pet) => {
    setSelectedPet(pet);
    setAppointments([]);
    setSelectedAppointment(null);
    setHistory({ exams: [], vaccinations: [] });
    setError("");
    try {
      const res = await axiosClient.get(`/doctor/pets/${pet.petId}/history`);
      setHistory(res.data || { exams: [], vaccinations: [] });
      // fetch appointments for this pet to populate appointment dropdown
      try {
        const aRes = await axiosClient.get(`/doctor/pets/${pet.petId}/appointments`);
        setAppointments(Array.isArray(aRes.data) ? aRes.data : []);
      } catch (e) {
        // non-fatal
        console.warn('Failed to load appointments for pet', e);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load history");
    }
  };

  

  const [form, setForm] = useState({ appointmentId: "", doctorId: "", symptoms: "", diagnosis: "", prescription: "", nextVisitDate: "" });

  const submitRecord = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form };
      if (!payload.doctorId) return setError("doctorId is required");
      // Appointment must be selected from the list
      if (!payload.appointmentId) return setError("Please select an appointment from the dropdown");
      const found = appointments.find(a => String(a.appointmentId) === String(payload.appointmentId));
      if (!found) return setError("Selected appointment is not valid for this pet");
      const res = await axiosClient.post("/doctor/records", payload);
      alert(`Created exam record #${res.data.examRecordId} (appointment ${res.data.appointmentId || 'n/a'})`);
      if (selectedPet) loadHistory(selectedPet);
      setForm({ ...form, symptoms: "", diagnosis: "", prescription: "", appointmentId: "", nextVisitDate: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create record");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Doctor (Demo)</h1>
      </div>

      <Card className="p-4">
        <form onSubmit={searchPets} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm text-neutral-600">PetID (exact)</label>
            <Input value={searchPetId} onChange={(e) => setSearchPetId(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="dark" disabled={loading}>{loading ? "Searching..." : "Search"}</Button>
          </div>
        </form>
        {error && <div className="mt-2 text-danger-600">{error}</div>}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          {pets.map((p) => (
            <button key={p.petId} className={`p-3 border rounded text-left ${selectedPet?.petId === p.petId ? 'bg-slate-50' : 'bg-white'}`} onClick={() => loadHistory(p)}>
              <div className="font-medium">{p.name} {p.breed ? `• ${p.breed}` : ''}</div>
              <div className="text-xs text-neutral-500">ID: {p.petId} • Owner: {p.owner?.fullName} • {p.owner?.phone}</div>
              <div className="text-xs mt-1">{p.hasHistory ? 'Returning' : 'First-time'}</div>
            </button>
          ))}
        </div>
      </Card>

      {selectedPet && (
        <Card className="p-4">
    <h2 className="text-lg font-semibold">{selectedPet.name} — ID #{selectedPet.petId} — History</h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Exam records</h3>
              {history.exams.length === 0 ? <div className="text-sm text-neutral-500 mt-2">No exam records</div> : (
                history.exams.map((e) => (
                  <div key={e.ExamRecordID} className="p-2 border rounded my-2">
                    <div className="text-sm text-neutral-700">{new Date(e.ScheduleTime).toLocaleString()}</div>
                    <div className="text-xs text-neutral-500">DoctorID: {e.DoctorID}</div>
                    <div className="mt-1"><strong>Symptoms:</strong> {e.Symptoms}</div>
                    <div className="mt-1"><strong>Diagnosis:</strong> {e.Diagnosis}</div>
                    <div className="mt-1"><strong>Prescription:</strong> {e.Prescription}</div>
                  </div>
                ))
              )}
            </div>
            <div>
              <h3 className="font-medium">Vaccinations</h3>
              {history.vaccinations.length === 0 ? <div className="text-sm text-neutral-500 mt-2">No vaccination records</div> : (
                history.vaccinations.map((v) => (
                  <div key={v.VaccinationID} className="p-2 border rounded my-2">
                    <div className="text-sm text-neutral-700">{new Date(v.ScheduleTime).toLocaleString()}</div>
                    <div className="text-xs text-neutral-500">Vaccine: {v.VaccineName} • Dose: {v.Dose}</div>
                    <div className="mt-1">Note: {v.Note}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={submitRecord} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-neutral-600">Appointment (required)</label>
              <Input placeholder="Type to filter appointments" value={appointmentQuery} onChange={(e) => setAppointmentQuery(e.target.value)} />
              <div className="mt-1 max-h-40 overflow-auto border rounded bg-white">
                {appointments.filter(a => {
                  if (!appointmentQuery) return true;
                  const q = appointmentQuery.toString().toLowerCase();
                  return a.appointmentId.toString().includes(q) || (a.serviceName || '').toLowerCase().includes(q) || (a.branchName || '').toLowerCase().includes(q);
                }).map((a) => (
                  <div key={a.appointmentId} className={`p-2 cursor-pointer ${selectedAppointment?.appointmentId === a.appointmentId ? 'bg-slate-100' : ''}`} onClick={() => { setSelectedAppointment(a); setForm({ ...form, appointmentId: a.appointmentId }); setAppointmentQuery(a.appointmentId.toString()); }}>
                    <div className="text-sm font-medium">ID #{a.appointmentId} — {a.serviceName || 'Service'} • {a.branchName || ''}</div>
                    <div className="text-xs text-neutral-500">{new Date(a.scheduleTime).toLocaleString()} — {a.status}</div>
                  </div>
                ))}
                {appointments.length === 0 && <div className="p-2 text-xs text-neutral-500">No appointments for this pet</div>}
              </div>
            </div>

            <div>
              <label className="text-sm text-neutral-600">Doctor (required)</label>
              <SelectDoctors value={form.doctorId} onChange={(val) => setForm({ ...form, doctorId: val })} />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-neutral-600">Symptoms</label>
              <Input value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
            </div>

            <div>
              <label className="text-sm text-neutral-600">Diagnosis</label>
              <Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-neutral-600">Prescription</label>
              <Input value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })} />
            </div>

            <div>
              <label className="text-sm text-neutral-600">Next visit date</label>
              <Input type="date" value={form.nextVisitDate} onChange={(e) => setForm({ ...form, nextVisitDate: e.target.value })} />
            </div>

            <div className="flex items-end">
              <Button type="submit" variant="dark" disabled={!(form.appointmentId && form.doctorId)}>Save exam record</Button>
            </div>
          </form>

          {/* Medicines search moved to its own page: /doctor/medicines */}
        </Card>
      )}
    </div>
  );
};

export default DoctorSchedulePage;
