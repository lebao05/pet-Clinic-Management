import React, { useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { Card } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

const DoctorMedicinesPage = () => {
  const [query, setQuery] = useState("");
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axiosClient.get("/doctor/medicines", { params: { query } });
      setMeds(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search medicines");
      setMeds([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Medicines Search</h1>
      </div>

      <Card className="p-4">
        <form onSubmit={search} className="flex gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search medicine name" />
          <Button type="submit" variant="dark" disabled={loading}>{loading ? 'Searching...' : 'Search'}</Button>
        </form>
        {error && <div className="mt-2 text-danger-600">{error}</div>}

        <div className="mt-3">
          {meds.length === 0 ? <div className="text-sm text-neutral-500">No medicines</div> : meds.map((m) => (
            <div key={m.productId} className="p-2 border rounded my-1">
              <div className="font-medium">{m.name}</div>
              <div className="text-xs text-neutral-500">Unit: {m.unit} • Type: {m.type}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DoctorMedicinesPage;
