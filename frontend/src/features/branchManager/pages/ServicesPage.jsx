import React, { useEffect, useState } from "react";
import { Card } from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import { branchManagerApi } from "../../../api/branchManagerApi";

function getDefaultBranchId() {
  const v = localStorage.getItem("branchId");
  return v ? Number(v) : 1;
}

export default function ServicesPage() {
  const [branchId, setBranchId] = useState(getDefaultBranchId());
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await branchManagerApi.listServices(branchId);
      setServices(res.data?.data?.services || []);
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

  async function onSave(row) {
    try {
      setError("");
      await branchManagerApi.updateService({
        branchId,
        serviceId: row.ServiceID,
        servicePrice: Number(row.ServicePrice),
        isAvailable: row.IsAvailable,
      });
      load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  function saveBranch() {
    localStorage.setItem("branchId", String(branchId));
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Branch Services</h1>
          <p className="text-neutral-600">Manage service price & availability per branch.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="w-28 px-3 py-2 border rounded-lg"
            type="number"
            value={branchId}
            min={1}
            onChange={(e) => setBranchId(Number(e.target.value))}
            placeholder="Branch"
          />
          <Button onClick={saveBranch}>Set Branch</Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
          {error && <p className="text-sm text-danger-600">{error}</p>}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Service</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Type</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">Price</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Available</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {services.map((s, idx) => (
                <tr key={`${s.BranchID}-${s.ServiceID}`} className="hover:bg-neutral-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">{s.ServiceName}</div>
                    <div className="text-sm text-neutral-600">#{s.ServiceID}</div>
                  </td>
                  <td className="px-6 py-4 text-neutral-700">{s.ServiceType}</td>
                  <td className="px-6 py-4 text-right">
                    <input
                      className="w-32 text-right px-3 py-2 border rounded-lg"
                      type="number"
                      step="0.01"
                      value={s.ServicePrice}
                      onChange={(e) => {
                        const v = e.target.value;
                        setServices((prev) =>
                          prev.map((x, i) => (i === idx ? { ...x, ServicePrice: v } : x))
                        );
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={!!s.IsAvailable}
                      onChange={(e) => {
                        const v = e.target.checked;
                        setServices((prev) =>
                          prev.map((x, i) => (i === idx ? { ...x, IsAvailable: v } : x))
                        );
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button onClick={() => onSave(s)}>Save</Button>
                  </td>
                </tr>
              ))}
              {!services.length && !loading && (
                <tr>
                  <td className="px-6 py-8 text-center text-neutral-600" colSpan={5}>
                    No branch services found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
