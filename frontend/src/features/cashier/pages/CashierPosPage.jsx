import React, { useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { Card } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

const CashierPosPage = () => {
  const [searchUserId, setSearchUserId] = useState("");
  const [searchPetId, setSearchPetId] = useState("");
  const [pets, setPets] = useState([]);
  const [checkedPet, setCheckedPet] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchFilters, setSearchFilters] = useState({ branchId: null, userId: "", petId: "", doctorId: "", serviceId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [walkin, setWalkin] = useState({ branchId: "", userId: "", petId: "", serviceId: "", doctorId: "" });

  const searchPets = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!searchUserId || !searchPetId) {
        setError("Please enter both Customer UserID and PetID to search.");
        setCheckedPet(null);
        setPets([]);
        return;
      }
      const res = await axiosClient.get(`/cashier/pets/${searchPetId}`, { params: { userId: searchUserId } });
      const r = res.data && res.data.data ? res.data.data : res.data;
      const p = r || null;
      const normalized = p ? ({
        petId: p.PetID || p.petId,
        name: p.PetName || p.name || p.Name,
        breed: p.Breed || p.breed,
        owner: p.Owner || p.owner || { fullName: p.OwnerName || p.FullName, phone: p.Phone },
        hasHistory: typeof p.hasHistory !== 'undefined' ? p.hasHistory : p.HasHistory || false,
        isOwnerMatch: typeof p.isOwnerMatch !== 'undefined' ? p.isOwnerMatch : true,
      }) : null;
      setCheckedPet(normalized);
      setPets([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search pet");
      setCheckedPet(null);
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  // NOTE: dropdown/autoload behavior removed per request — fields are free-text inputs now.

  const searchInvoices = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const params = {};
      if (searchFilters.branchId) params.branchId = Number(searchFilters.branchId);
      if (searchFilters.userId) params.userId = Number(searchFilters.userId);
      if (searchFilters.petId) params.petId = Number(searchFilters.petId);
      if (searchFilters.doctorId) params.doctorId = Number(searchFilters.doctorId);
      if (searchFilters.serviceId) params.serviceId = Number(searchFilters.serviceId);

      const res = await axiosClient.get("/cashier/appointments", { params });
      setSearchResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search appointments");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const createWalkin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        branchId: Number(walkin.branchId),
        userId: Number(walkin.userId),
        petId: Number(walkin.petId),
        serviceId: walkin.serviceId ? Number(walkin.serviceId) : null,
        doctorId: walkin.doctorId ? Number(walkin.doctorId) : null,
      };
      const res = await axiosClient.post("/cashier/walkin", payload);
      alert(`Created walk-in appointment #${res.data.appointmentId}`);
      // clear petId and keep other fields
      setWalkin({ ...walkin, petId: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create walk-in");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Cashier (Demo)</h1>
      </div>

      <Card className="p-4">
        <form onSubmit={searchPets} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm text-neutral-600">Customer UserID (required)</label>
            <Input value={searchUserId} onChange={(e) => setSearchUserId(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-neutral-600">PetID (required)</label>
            <Input value={searchPetId} onChange={(e) => setSearchPetId(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="dark" disabled={loading || !searchUserId || !searchPetId}>{loading ? 'Searching...' : 'Search'}</Button>
          </div>
        </form>
        {error && <div className="mt-2 text-danger-600">{error}</div>}

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          {checkedPet ? (
            <div key={checkedPet.petId} className="p-3 border rounded bg-white">
              <div className="font-medium">{checkedPet.name} {checkedPet.breed ? `• ${checkedPet.breed}` : ''}</div>
              <div className="text-xs text-neutral-500">Owner: {checkedPet.owner?.fullName} • {checkedPet.owner?.phone}</div>
              <div className="text-xs mt-1">{checkedPet.hasHistory ? 'Returning' : 'First-time'}</div>
              {!checkedPet.isOwnerMatch && <div className="text-xs text-danger-600 mt-1">Warning: provided UserID does not match pet owner.</div>}
            </div>
          ) : (
            pets.map((p) => (
              <div key={p.petId} className="p-3 border rounded bg-white">
                <div className="font-medium">{p.name} {p.breed ? `• ${p.breed}` : ''}</div>
                <div className="text-xs text-neutral-500">Owner: {p.owner?.fullName} • {p.owner?.phone}</div>
                <div className="text-xs mt-1">{p.hasHistory ? 'Returning' : 'First-time'}</div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-medium">Create walk-in appointment</h2>
        <form onSubmit={createWalkin} className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div>
            <label className="text-sm text-neutral-600">Branch (required)</label>
            <Input value={walkin.branchId} onChange={(e) => setWalkin({ ...walkin, branchId: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Customer UserID (required)</label>
            <Input value={walkin.userId} onChange={(e) => setWalkin({ ...walkin, userId: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Pet (required) — enter PetID</label>
            <Input value={walkin.petId} onChange={(e) => setWalkin({ ...walkin, petId: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Service (required) — enter ServiceID</label>
            <Input value={walkin.serviceId} onChange={(e) => setWalkin({ ...walkin, serviceId: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Doctor (enter EmployeeID or leave blank)</label>
            <Input value={walkin.doctorId} onChange={(e) => setWalkin({ ...walkin, doctorId: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" variant="dark" disabled={!walkin.branchId || !walkin.userId || !walkin.petId || !walkin.serviceId}>Create walk-in</Button>
          </div>
        </form>
      </Card>

      <Card className="p-4">
        <h2 className="font-medium">Search appointments (optional filters)</h2>
        <form onSubmit={searchInvoices} className="grid grid-cols-1 md:grid-cols-6 gap-3 mt-3">
          <div>
            <label className="text-sm text-neutral-600">Branch</label>
            <Input value={searchFilters.branchId || ""} onChange={(e) => setSearchFilters({ ...searchFilters, branchId: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-neutral-600">UserID</label>
            <Input value={searchFilters.userId} onChange={(e) => setSearchFilters({ ...searchFilters, userId: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-neutral-600">PetID</label>
            <Input value={searchFilters.petId} onChange={(e) => setSearchFilters({ ...searchFilters, petId: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Doctor</label>
            <Input value={searchFilters.doctorId || ""} onChange={(e) => setSearchFilters({ ...searchFilters, doctorId: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Service</label>
            <Input value={searchFilters.serviceId || ""} onChange={(e) => setSearchFilters({ ...searchFilters, serviceId: e.target.value })} />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="dark" disabled={loading}>{loading ? 'Searching...' : 'Search'}</Button>
          </div>
        </form>

        <div className="mt-4">
          {searchResults.length === 0 ? (
            <div className="text-neutral-500">No appointments</div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((r) => (
                <div key={r.appointmentId} className="p-2 border rounded">
                  <div className="font-medium">Appointment #{r.appointmentId} — {r.service?.name}</div>
                  <div className="text-xs text-neutral-500">{new Date(r.scheduleTime).toLocaleString()} — {r.status} — Branch: {r.branch?.name}</div>
                  <div className="text-xs">Patient: {r.pet?.name} • Customer: {r.user?.fullName} {r.doctor ? `• Doctor: ${r.doctor.fullName}` : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CashierPosPage;
