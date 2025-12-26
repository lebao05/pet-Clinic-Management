import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { Card } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import { Textarea } from "../../../shared/components/ui/Textarea";
import Button from "../../../shared/components/ui/Button";
import { Select, SelectItem } from "../../../shared/components/ui/Select";

const DoctorAppointmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [vaccines, setVaccines] = useState([]);

  const isVaccineService = useMemo(() => {
    return (data?.service?.type || "").toUpperCase() === "VACCINE";
  }, [data]);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [detailRes, vaccineRes] = await Promise.all([
        axiosClient.get(`/doctor/appointments/${id}`),
        axiosClient.get(`/doctor/vaccines`),
      ]);
      setData(detailRes.data);
      setVaccines(Array.isArray(vaccineRes.data) ? vaccineRes.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load appointment");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (status) => {
    setSaving(true);
    setError("");
    try {
      await axiosClient.patch(`/doctor/appointments/${id}/status`, { status });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const saveExam = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        appointmentId: Number(id),
        doctorId: data?.doctorId,
        symptoms: data?.examDraft?.symptoms ?? data?.examRecord?.Symptoms ?? "",
        diagnosis: data?.examDraft?.diagnosis ?? data?.examRecord?.Diagnosis ?? "",
        prescription: data?.examDraft?.prescription ?? data?.examRecord?.Prescription ?? "",
        nextVisitDate: data?.examDraft?.nextVisitDate ?? data?.examRecord?.NextVisitDate ?? null,
      };
      const res = await axiosClient.post(`/doctor/exam-records`, payload);
      setData((prev) => ({ ...prev, examRecord: res.data, examDraft: null }));
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save exam record");
    } finally {
      setSaving(false);
    }
  };

  const saveVaccination = async () => {
    setSaving(true);
    setError("");
    try {
      const v = data?.vaccDraft || {};
      const payload = {
        appointmentId: Number(id),
        doctorId: data?.doctorId,
        vaccineId: Number(v.vaccineId || data?.vaccinationRecord?.VaccineID),
        dateGiven: v.dateGiven || data?.vaccinationRecord?.DateGiven || new Date().toISOString().slice(0, 10),
        dose: v.dose ?? data?.vaccinationRecord?.Dose ?? "",
        note: v.note ?? data?.vaccinationRecord?.Note ?? "",
        subscriptionId: v.subscriptionId || data?.vaccinationRecord?.SubscriptionID || null,
        packageId: v.packageId || data?.vaccinationRecord?.PackageID || null,
        sequenceNo: v.sequenceNo || data?.vaccinationRecord?.SequenceNo || null,
      };
      const res = await axiosClient.post(`/doctor/vaccination-records`, payload);
      setData((prev) => ({ ...prev, vaccinationRecord: res.data, vaccDraft: null }));
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save vaccination record");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-neutral-600">Loading...</div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6">
        <div className="text-danger-600">{error || "Not found"}</div>
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </Card>
    );
  }

  const statusValue = data.status || "Booked";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Appointment #{data.appointmentId}</h1>
          <div className="text-sm text-neutral-600">{new Date(data.scheduleTime).toLocaleString()}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button onClick={load} disabled={saving}>
            Refresh
          </Button>
        </div>
      </div>

      {error && <div className="text-danger-600 text-sm">{error}</div>}

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-neutral-600">Branch</div>
            <div className="font-medium">{data.branch?.name}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-600">Patient</div>
            <div className="font-medium">{data.pet?.name}</div>
            <div className="text-xs text-neutral-500">{data.pet?.species}{data.pet?.breed ? ` • ${data.pet.breed}` : ""}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-600">Owner</div>
            <div className="font-medium">{data.user?.fullName}</div>
            <div className="text-xs text-neutral-500">{data.user?.phone}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-neutral-600">Service</div>
            <div className="font-medium">{data.service?.name}</div>
            <div className="text-xs text-neutral-500">{data.service?.type}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-600">Status</div>
            <Select value={statusValue} onValueChange={(v) => updateStatus(v)}>
              <SelectItem value="Booked">Booked</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </Select>
            <div className="text-xs text-neutral-500 mt-1">Auto-save on change</div>
          </div>
          <div className="flex items-end">
            <Button variant="outline" fullWidth disabled={saving} onClick={() => updateStatus("Completed")}
            >
              Mark Completed
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-neutral-900">Exam Record</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm text-neutral-600">Symptoms</label>
            <Textarea
              value={data.examDraft?.symptoms ?? data.examRecord?.Symptoms ?? ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  examDraft: { ...(prev.examDraft || {}), symptoms: e.target.value },
                }))
              }
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Diagnosis</label>
            <Textarea
              value={data.examDraft?.diagnosis ?? data.examRecord?.Diagnosis ?? ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  examDraft: { ...(prev.examDraft || {}), diagnosis: e.target.value },
                }))
              }
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Prescription</label>
            <Textarea
              value={data.examDraft?.prescription ?? data.examRecord?.Prescription ?? ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  examDraft: { ...(prev.examDraft || {}), prescription: e.target.value },
                }))
              }
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Next visit date</label>
            <Input
              type="date"
              value={(data.examDraft?.nextVisitDate ?? data.examRecord?.NextVisitDate ?? "").toString().slice(0, 10)}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  examDraft: { ...(prev.examDraft || {}), nextVisitDate: e.target.value || null },
                }))
              }
            />
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={saveExam} disabled={saving}>
            {saving ? "Saving..." : "Save exam record"}
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Vaccination Record</h2>
          {!isVaccineService && (
            <div className="text-xs text-neutral-500">Note: Service type is not VACCINE (still allowed for demo)</div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm text-neutral-600">Vaccine</label>
            <Select
              value={String(data.vaccDraft?.vaccineId ?? data.vaccinationRecord?.VaccineID ?? "")}
              onValueChange={(v) =>
                setData((prev) => ({
                  ...prev,
                  vaccDraft: { ...(prev.vaccDraft || {}), vaccineId: v },
                }))
              }
            >
              <SelectItem value="">Select vaccine</SelectItem>
              {vaccines.map((v) => (
                <SelectItem key={v.VaccineID} value={String(v.VaccineID)}>
                  {v.VaccineName}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-sm text-neutral-600">Date given</label>
            <Input
              type="date"
              value={
                (data.vaccDraft?.dateGiven ??
                  data.vaccinationRecord?.DateGiven ??
                  new Date().toISOString().slice(0, 10))
                  .toString()
                  .slice(0, 10)
              }
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  vaccDraft: { ...(prev.vaccDraft || {}), dateGiven: e.target.value },
                }))
              }
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Dose</label>
            <Input
              value={data.vaccDraft?.dose ?? data.vaccinationRecord?.Dose ?? ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  vaccDraft: { ...(prev.vaccDraft || {}), dose: e.target.value },
                }))
              }
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Note</label>
            <Input
              value={data.vaccDraft?.note ?? data.vaccinationRecord?.Note ?? ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  vaccDraft: { ...(prev.vaccDraft || {}), note: e.target.value },
                }))
              }
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600">SubscriptionID (optional)</label>
            <Input
              type="number"
              value={data.vaccDraft?.subscriptionId ?? data.vaccinationRecord?.SubscriptionID ?? ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  vaccDraft: { ...(prev.vaccDraft || {}), subscriptionId: e.target.value },
                }))
              }
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600">PackageID / SequenceNo (optional)</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="PackageID"
                value={data.vaccDraft?.packageId ?? data.vaccinationRecord?.PackageID ?? ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    vaccDraft: { ...(prev.vaccDraft || {}), packageId: e.target.value },
                  }))
                }
              />
              <Input
                type="number"
                placeholder="SequenceNo"
                value={data.vaccDraft?.sequenceNo ?? data.vaccinationRecord?.SequenceNo ?? ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    vaccDraft: { ...(prev.vaccDraft || {}), sequenceNo: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={saveVaccination} disabled={saving}>
            {saving ? "Saving..." : "Save vaccination record"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DoctorAppointmentDetailPage;
