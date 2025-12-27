import React, { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { Card } from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/Table";

const DoctorVaccineCatalogPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axiosClient.get("/doctor/vaccines");
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load vaccines");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Vaccine Catalog</h1>
        <Button onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {error && <div className="text-danger-600 text-sm">{error}</div>}

      <Card className="p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Dose</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-neutral-500 py-8">
                  No vaccines
                </TableCell>
              </TableRow>
            ) : (
              rows.map((v) => (
                <TableRow key={v.VaccineID}>
                  <TableCell>{v.VaccineID}</TableCell>
                  <TableCell className="font-medium">{v.VaccineName}</TableCell>
                  <TableCell>{v.Manufacturer || "—"}</TableCell>
                  <TableCell>{v.DefaultDose || "—"}</TableCell>
                  <TableCell className="text-right">{v.DefaultPrice ?? "—"}</TableCell>
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
