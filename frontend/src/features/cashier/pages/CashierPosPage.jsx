import React, { useMemo, useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import { Card } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/Table";

const CashierPosPage = () => {
  const [branchId, setBranchId] = useState(1);
  const [staffId, setStaffId] = useState(1);
  const [userId, setUserId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [pets, setPets] = useState([]);
  const [selectedPetIds, setSelectedPetIds] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);

  const [serviceCart, setServiceCart] = useState([]); // {serviceId, name, type, qty, unitPrice}
  const [productCart, setProductCart] = useState([]); // {productId, name, qty, unitPrice}
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const loadData = async () => {
    setError("");
    setLoading(true);
    try {
      const [petRes, serviceRes, productRes] = await Promise.all([
        axiosClient.get("/cashier/pets", { params: { userId } }),
        axiosClient.get("/cashier/services", { params: { branchId } }),
        axiosClient.get("/cashier/products", { params: { branchId } }),
      ]);
      setPets(Array.isArray(petRes.data) ? petRes.data : []);
      setSelectedPetIds([]);
      setServices(Array.isArray(serviceRes.data) ? serviceRes.data : []);
      setProducts(Array.isArray(productRes.data) ? productRes.data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load customer + catalog when the page mounts so the POS shows data immediately
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addService = (s) => {
    setServiceCart((prev) => {
      const idx = prev.findIndex((x) => x.serviceId === s.serviceId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { serviceId: s.serviceId, name: s.name, type: s.type, qty: 1, unitPrice: s.price }];
    });
  };

  const addProduct = (p) => {
    setProductCart((prev) => {
      const idx = prev.findIndex((x) => x.productId === p.productId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { productId: p.productId, name: p.name, qty: 1, unitPrice: p.sellingPrice }];
    });
  };

  const totals = useMemo(() => {
    const serviceSubtotal = serviceCart.reduce((sum, l) => sum + Number(l.qty) * Number(l.unitPrice), 0);
    const productSubtotal = productCart.reduce((sum, l) => sum + Number(l.qty) * Number(l.unitPrice), 0);
    const original = Math.round((serviceSubtotal + productSubtotal) * 100) / 100;
    const discount = Math.max(0, Number(discountAmount) || 0);
    const final = Math.max(0, Math.round((original - discount) * 100) / 100);
    return { original, discount, final };
  }, [serviceCart, productCart, discountAmount]);

  const createInvoice = async () => {
    setError("");
    setLoading(true);
    try {
      const payload = {
        branchId: Number(branchId),
        userId: Number(userId),
        staffId: Number(staffId),
        paymentMethod,
        paymentStatus: "Paid",
        discountAmount: Number(discountAmount) || 0,
        petIds: selectedPetIds,
        serviceLines: serviceCart.map((l) => ({ serviceId: l.serviceId, quantity: Number(l.qty), unitPrice: Number(l.unitPrice) })),
        productLines: productCart.map((l) => ({ productId: l.productId, quantity: Number(l.qty), unitPrice: Number(l.unitPrice) })),
      };
      const res = await axiosClient.post("/cashier/invoices", payload);
      // Reset carts on success
      setServiceCart([]);
      setProductCart([]);
      setDiscountAmount(0);
      alert(`Created invoice #${res.data.invoiceId} (Final: ${res.data.finalAmount})`);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const togglePet = (petId) => {
    setSelectedPetIds((prev) => (prev.includes(petId) ? prev.filter((x) => x !== petId) : [...prev, petId]));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Cashier POS</h1>
        <Button onClick={loadData} disabled={loading}>
          {loading ? "Loading..." : "Load"}
        </Button>
      </div>

      {error && <div className="text-danger-600 text-sm">{error}</div>}

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-neutral-600">BranchID</label>
            <Input type="number" value={branchId} onChange={(e) => setBranchId(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Cashier (StaffID)</label>
            <Input type="number" value={staffId} onChange={(e) => setStaffId(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Customer (UserID)</label>
            <Input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button fullWidth onClick={loadData} disabled={loading}>
              Load customer + catalog
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Customer pets</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {pets.length === 0 ? (
                <div className="text-neutral-500 text-sm">No pets (load by UserID)</div>
              ) : (
                pets.map((p) => (
                  <label key={p.petId} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                    <input type="checkbox" checked={selectedPetIds.includes(p.petId)} onChange={() => togglePet(p.petId)} />
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-neutral-500">{p.species}{p.breed ? ` • ${p.breed}` : ""}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Services</h2>
            <Card className="p-0 mt-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-neutral-500 py-6">
                        No services (load by BranchID)
                      </TableCell>
                    </TableRow>
                  ) : (
                    services.map((s) => (
                      <TableRow key={s.serviceId}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.type}</TableCell>
                        <TableCell className="text-right">{s.price}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => addService(s)}>
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Products</h2>
            <Card className="p-0 mt-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-neutral-500 py-6">
                        No products (load by BranchID)
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((p) => (
                      <TableRow key={p.productId}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-right">{p.stockQty}</TableCell>
                        <TableCell className="text-right">{p.sellingPrice}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => addProduct(p)} disabled={p.stockQty <= 0}>
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Cart</h2>

          <div>
            <div className="text-sm font-medium text-neutral-700">Service lines</div>
            {serviceCart.length === 0 ? (
              <div className="text-sm text-neutral-500 mt-2">No services</div>
            ) : (
              <div className="space-y-2 mt-2">
                {serviceCart.map((l) => (
                  <div key={l.serviceId} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{l.name}</div>
                      <div className="text-xs text-neutral-500">{l.type} • {l.unitPrice}</div>
                    </div>
                    <Input
                      type="number"
                      className="w-20"
                      value={l.qty}
                      min={1}
                      onChange={(e) =>
                        setServiceCart((prev) =>
                          prev.map((x) => (x.serviceId === l.serviceId ? { ...x, qty: Number(e.target.value || 1) } : x))
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-medium text-neutral-700">Product lines</div>
            {productCart.length === 0 ? (
              <div className="text-sm text-neutral-500 mt-2">No products</div>
            ) : (
              <div className="space-y-2 mt-2">
                {productCart.map((l) => (
                  <div key={l.productId} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{l.name}</div>
                      <div className="text-xs text-neutral-500">{l.unitPrice}</div>
                    </div>
                    <Input
                      type="number"
                      className="w-20"
                      value={l.qty}
                      min={1}
                      onChange={(e) =>
                        setProductCart((prev) =>
                          prev.map((x) => (x.productId === l.productId ? { ...x, qty: Number(e.target.value || 1) } : x))
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t">
            <label className="text-sm text-neutral-600">Discount amount</label>
            <Input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Payment method</label>
            <Input value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Original</span>
              <span className="font-medium">{totals.original}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Discount</span>
              <span className="font-medium">{totals.discount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-800 font-semibold">Final</span>
              <span className="font-semibold">{totals.final}</span>
            </div>
          </div>

          <Button
            fullWidth
            onClick={createInvoice}
            disabled={loading || (serviceCart.length === 0 && productCart.length === 0)}
          >
            Create invoice
          </Button>

          <Button fullWidth variant="outline" onClick={() => { setServiceCart([]); setProductCart([]); setDiscountAmount(0); }}>
            Clear cart
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default CashierPosPage;
