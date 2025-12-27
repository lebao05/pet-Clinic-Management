import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { Card } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/Table";

const CashierInvoicesPage = () => {
  const navigate = useNavigate();
  const [branchId, setBranchId] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const params = { branchId };
      if (from) params.from = from;
      if (to) params.to = to;
  if (userId) params.userId = userId;
      const res = await axiosClient.get("/cashier/invoices", { params });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load invoices");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Invoices</h1>
        <Button onClick={load} variant="dark" disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {error && <div className="text-danger-600 text-sm">{error}</div>}

      <Card className="p-5">
        {/* Wrap controls in a form so Enter key triggers the same load() as clicking Filter */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-neutral-600">BranchID</label>
              <Input type="number" value={branchId} onChange={(e) => setBranchId(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-neutral-600">From (optional)</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-neutral-600">To (optional)</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-neutral-600">UserID (optional)</label>
              <Input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} />
            </div>
            
            <div className="flex items-end">
              <Button fullWidth type="submit" variant="dark" disabled={loading}>
                Filter
              </Button>
            </div>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Cashier</TableHead>
              <TableHead className="text-right">Final</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-neutral-500 py-8">
                  No invoices
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.invoiceId}>
                  <TableCell>{r.invoiceId}</TableCell>
                  <TableCell>{new Date(r.invoiceDate).toLocaleString()}</TableCell>
                  <TableCell>{r.user?.fullName}</TableCell>
                  <TableCell>{r.cashier?.fullName}</TableCell>
                  <TableCell className="text-right">{r.finalAmount}</TableCell>
                  <TableCell>{r.paymentStatus}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/cashier/invoices/${r.invoiceId}`)}>
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

export default CashierInvoicesPage;
