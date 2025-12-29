import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { Card } from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/Table";

const CashierInvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axiosClient.get(`/cashier/invoices/${id}`);
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load invoice");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
          <Button variant="dark" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Invoice #{data.invoiceId}</h1>
          <div className="text-sm text-neutral-600">{new Date(data.invoiceDate).toLocaleString()}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="dark" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button variant="dark" onClick={load}>Refresh</Button>
        </div>
      </div>

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
              <div className="text-sm text-neutral-600">Customer</div>
              <div className="font-medium">{data.customer?.fullName}</div>
              <div className="text-xs text-neutral-500">{data.customer?.phone}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-600">Cashier</div>
              <div className="font-medium">{data.staff?.fullName}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-600">Payment</div>
              <div className="font-medium">{data.payment?.method}</div>
              <div className="text-xs text-neutral-500">{data.payment?.status}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-6">
          <div>
            <div className="text-sm text-neutral-600">Original</div>
            <div className="font-semibold">{data.amounts?.originalAmount}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-600">Discount</div>
            <div className="font-semibold">{data.amounts?.discountAmount}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-600">Final</div>
            <div className="font-semibold">{data.amounts?.finalAmount}</div>
          </div>
        </div>

        {(data.pets || []).length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-neutral-600">Pets</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {data.pets.map((p) => (
                <span key={p.petId} className="px-3 py-1 bg-neutral-100 rounded-full text-sm">
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-neutral-900">Service lines</h2>
        <div className="mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit</TableHead>
                <TableHead className="text-right">Line</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.serviceLines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-neutral-500 py-6">
                    No service lines
                  </TableCell>
                </TableRow>
              ) : (
                data.serviceLines.map((l) => (
                  <TableRow key={l.lineNo}>
                    <TableCell className="font-medium">{l.serviceName}</TableCell>
                    <TableCell className="text-right">{l.quantity}</TableCell>
                    <TableCell className="text-right">{l.unitPrice}</TableCell>
                    <TableCell className="text-right">{l.lineAmount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-neutral-900">Product lines</h2>
        <div className="mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit</TableHead>
                <TableHead className="text-right">Line</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.productLines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-neutral-500 py-6">
                    No product lines
                  </TableCell>
                </TableRow>
              ) : (
                data.productLines.map((l) => (
                  <TableRow key={l.lineNo}>
                    <TableCell className="font-medium">{l.productName}</TableCell>
                    <TableCell className="text-right">{l.quantity}</TableCell>
                    <TableCell className="text-right">{l.unitPrice}</TableCell>
                    <TableCell className="text-right">{l.lineAmount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default CashierInvoiceDetailPage;
