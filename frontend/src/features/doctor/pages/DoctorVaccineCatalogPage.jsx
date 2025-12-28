import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { Card } from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/Table";

function toYMD(value) {
  if (!value) return "";
  // SQL Date/Datetime string -> YYYY-MM-DD for display
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeVaccine(v) {
  return {
    id: v.vaccineId ?? v.VaccineID,
    name: v.name ?? v.VaccineName,
    type: v.type ?? v.VaccineType,
    manufacturer: v.manufacturer ?? v.Manufacturer,
    dose: v.defaultDose ?? v.DefaultDose,
    price: v.defaultPrice ?? v.DefaultPrice,
    manufactureDate: v.manufactureDate ?? v.ManufactureDate,
    expiryDate: v.expiryDate ?? v.ExpiryDate,
    stockQty: v.stockQty ?? v.StockQty,
    inStock: typeof v.inStock !== "undefined" ? v.inStock : (typeof v.StockQty !== "undefined" ? Number(v.StockQty) > 0 : undefined),
    branchId: v.branchId ?? v.BranchID,
  };
}

const inputCls =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400";

const labelCls = "text-xs font-medium text-neutral-600";

const DoctorVaccineCatalogPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    manufacturer: "",
    mfgFrom: "",
    mfgTo: "",
    expFrom: "",
    expTo: "",
    branchId: "",
    inStock: "all", // all | in | out
  });

  const params = useMemo(() => {
    const p = {};
    if (filters.name.trim()) p.name = filters.name.trim();
    if (filters.type.trim()) p.type = filters.type.trim();
    if (filters.manufacturer.trim()) p.manufacturer = filters.manufacturer.trim();

    if (filters.mfgFrom) p.mfgFrom = filters.mfgFrom;
    if (filters.mfgTo) p.mfgTo = filters.mfgTo;
    if (filters.expFrom) p.expFrom = filters.expFrom;
    if (filters.expTo) p.expTo = filters.expTo;

    if (filters.branchId.trim()) p.branchId = Number(filters.branchId);

    if (filters.inStock === "in") p.inStock = 1;
    if (filters.inStock === "out") p.inStock = 0;

    return p;
  }, [filters]);

  const load = async (customParams) => {
    setError("");
    setLoading(true);
    try {
      const res = await axiosClient.get("/doctor/vaccines", { params: customParams ?? params });
      const data = Array.isArray(res.data) ? res.data : [];
      setRows(data.map(normalizeVaccine));
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load vaccines");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApply = () => load(params);

  const onClear = () => {
    const cleared = {
      name: "",
      type: "",
      manufacturer: "",
      mfgFrom: "",
      mfgTo: "",
      expFrom: "",
      expTo: "",
      branchId: "",
      inStock: "all",
    };
    setFilters(cleared);
    load({}); // load all
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900">Vaccine Catalog</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => load(params)} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {error && <div className="text-danger-600 text-sm">{error}</div>}

      {/* Filters */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-neutral-900">Filters</div>
          <div className="flex gap-2">
            <Button onClick={onApply} disabled={loading}>
              Apply
            </Button>
            <Button onClick={onClear} disabled={loading} variant="outline">
              Clear
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className={labelCls}>Name</div>
            <input
              className={inputCls}
              value={filters.name}
              onChange={(e) => setFilters((s) => ({ ...s, name: e.target.value }))}
              placeholder="e.g. Rabies"
            />
          </div>

          <div className="space-y-1">
            <div className={labelCls}>Type</div>
            <input
              className={inputCls}
              value={filters.type}
              onChange={(e) => setFilters((s) => ({ ...s, type: e.target.value }))}
              placeholder="e.g. Core / Non-core"
            />
          </div>

          <div className="space-y-1">
            <div className={labelCls}>Manufacturer</div>
            <input
              className={inputCls}
              value={filters.manufacturer}
              onChange={(e) => setFilters((s) => ({ ...s, manufacturer: e.target.value }))}
              placeholder="e.g. MSD"
            />
          </div>

          <div className="space-y-1">
            <div className={labelCls}>Manufacture Date (From)</div>
            <input
              type="date"
              className={inputCls}
              value={filters.mfgFrom}
              onChange={(e) => setFilters((s) => ({ ...s, mfgFrom: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <div className={labelCls}>Manufacture Date (To)</div>
            <input
              type="date"
              className={inputCls}
              value={filters.mfgTo}
              onChange={(e) => setFilters((s) => ({ ...s, mfgTo: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <div className={labelCls}>Branch ID (for stock)</div>
            <input
              className={inputCls}
              value={filters.branchId}
              onChange={(e) => setFilters((s) => ({ ...s, branchId: e.target.value }))}
              placeholder="e.g. 1"
              inputMode="numeric"
            />
          </div>

          <div className="space-y-1">
            <div className={labelCls}>Expiry Date (From)</div>
            <input
              type="date"
              className={inputCls}
              value={filters.expFrom}
              onChange={(e) => setFilters((s) => ({ ...s, expFrom: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <div className={labelCls}>Expiry Date (To)</div>
            <input
              type="date"
              className={inputCls}
              value={filters.expTo}
              onChange={(e) => setFilters((s) => ({ ...s, expTo: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <div className={labelCls}>Stock Status</div>
            <select
              className={inputCls}
              value={filters.inStock}
              onChange={(e) => setFilters((s) => ({ ...s, inStock: e.target.value }))}
            >
              <option value="all">All</option>
              <option value="in">In stock</option>
              <option value="out">Out of stock</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>MFG</TableHead>
              <TableHead>EXP</TableHead>
              <TableHead>Dose</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-neutral-500 py-8">
                  No vaccines
                </TableCell>
              </TableRow>
            ) : (
              rows.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.id}</TableCell>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.type || "—"}</TableCell>
                  <TableCell>{v.manufacturer || "—"}</TableCell>
                  <TableCell>{toYMD(v.manufactureDate) || "—"}</TableCell>
                  <TableCell>{toYMD(v.expiryDate) || "—"}</TableCell>
                  <TableCell>{v.dose || "—"}</TableCell>
                  <TableCell>
                    {typeof v.stockQty === "undefined" ? "—" : `${v.stockQty}${v.inStock ? "" : " (Out)"}`}
                  </TableCell>
                  <TableCell className="text-right">{v.price ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default DoctorVaccineCatalogPage;
