import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import useAppSettings from "../../../shared/hooks/useAppSettings";

function money(n) {
  const x = Number(n || 0);
  return x.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function POSPage() {
  const nav = useNavigate();
  const { settings } = useAppSettings();
  const branchId = settings.branchId;
  const staffId = settings.cashierId;

  const [userId, setUserId] = useState("");
  const [pets, setPets] = useState([]);
  const [selectedPets, setSelectedPets] = useState([]);

  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [serviceLines, setServiceLines] = useState([]);
  const [productLines, setProductLines] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [headerDiscount, setHeaderDiscount] = useState(0);

  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const canLoadCatalog = useMemo(() => !!branchId, [branchId]);
  const canCreate = useMemo(() => !!branchId && !!staffId && !!userId, [branchId, staffId, userId]);

  useEffect(() => {
    let mounted = true;
    async function loadCatalog() {
      if (!canLoadCatalog) return;
      setLoadingCatalog(true);
      setError("");
      try {
        const [sRes, pRes] = await Promise.all([
          axiosClient.get("/cashier/services", { params: { branchId } }),
          axiosClient.get("/cashier/products", { params: { branchId } }),
        ]);
        if (!mounted) return;
        setServices(sRes.data?.data || []);
        setProducts(pRes.data?.data || []);
      } catch (e) {
        if (!mounted) return;
        setError(e.response?.data?.error || e.message);
      } finally {
        if (mounted) setLoadingCatalog(false);
      }
    }
    loadCatalog();
    return () => { mounted = false; };
  }, [branchId, canLoadCatalog]);

  async function loadPets() {
    if (!userId) return;
    setError("");
    try {
      const res = await axiosClient.get(`/users/${userId}/pets`);
      setPets(res.data?.data || []);
      setSelectedPets([]);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  }

  function addServiceLine(serviceId) {
    const s = services.find((x) => x.ServiceID === Number(serviceId));
    if (!s) return;
    setServiceLines((lines) => ([
      ...lines,
      { serviceId: s.ServiceID, name: s.ServiceName, quantity: 1, unitPrice: Number(s.ServicePrice), discountAmount: 0, petId: selectedPets[0] || null },
    ]));
  }

  function addProductLine(productId) {
    const p = products.find((x) => x.ProductID === Number(productId));
    if (!p) return;
    setProductLines((lines) => ([
      ...lines,
      { productId: p.ProductID, name: p.ProductName, quantity: 1, unitPrice: Number(p.SellingPrice), discountAmount: 0 },
    ]));
  }

  const totals = useMemo(() => {
    const serviceSubtotal = serviceLines.reduce((a, l) => a + Number(l.quantity) * Number(l.unitPrice), 0);
    const productSubtotal = productLines.reduce((a, l) => a + Number(l.quantity) * Number(l.unitPrice), 0);
    const lineDiscount =
      serviceLines.reduce((a, l) => a + Number(l.discountAmount || 0), 0) +
      productLines.reduce((a, l) => a + Number(l.discountAmount || 0), 0);
    const original = serviceSubtotal + productSubtotal;
    const discount = Number(headerDiscount || 0) + lineDiscount;
    const final = original - discount;
    return { original, discount, final };
  }, [serviceLines, productLines, headerDiscount]);

  async function createInvoice() {
    if (!canCreate) return;
    setCreating(true);
    setError("");
    try {
      const payload = {
        branchId: Number(branchId),
        userId: Number(userId),
        staffId: Number(staffId),
        paymentMethod,
        paymentStatus,
        discountAmount: Number(headerDiscount || 0),
        pets: selectedPets.map(Number),
        serviceLines: serviceLines.map((l) => ({
          serviceId: Number(l.serviceId),
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          discountAmount: Number(l.discountAmount || 0),
          petId: l.petId ? Number(l.petId) : null,
        })),
        productLines: productLines.map((l) => ({
          productId: Number(l.productId),
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          discountAmount: Number(l.discountAmount || 0),
        })),
      };
      const res = await axiosClient.post("/cashier/invoices", payload);
      const invoiceId = res.data?.invoiceId;
      if (invoiceId) nav(`/cashier/invoices/${invoiceId}`);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4">
        <div className="text-lg font-semibold">Cashier POS</div>
        <div className="text-sm text-neutral-600">BranchID: {branchId || "(set in sidebar)"} | StaffID: {staffId || "(set in sidebar)"}</div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded p-4 text-sm">{error}</div>}
      {!canLoadCatalog && <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm">Set <b>Branch ID</b> in sidebar to load services/products.</div>}

      <div className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="text-sm text-neutral-600">Customer (UserID)</div>
          <div className="flex gap-2">
            <input className="border rounded px-2 py-2 flex-1" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g. 1" />
            <button className="px-3 py-2 rounded bg-neutral-900 text-white text-sm" onClick={loadPets}>Load Pets</button>
          </div>
          <div className="text-xs text-neutral-500">Tip: use /api/users to find a customer.</div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-neutral-600">Pets in invoice</div>
          <div className="border rounded p-2 max-h-32 overflow-y-auto">
            {pets.length === 0 && <div className="text-sm text-neutral-500">No pets loaded.</div>}
            {pets.map((p) => {
              const checked = selectedPets.includes(p.PetID);
              return (
                <label key={p.PetID} className="flex items-center gap-2 text-sm py-1">
                  <input type="checkbox" checked={checked} onChange={() => {
                    setSelectedPets((s) => checked ? s.filter((x) => x !== p.PetID) : [...s, p.PetID]);
                  }} />
                  <span>{p.PetName} ({p.Species})</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-neutral-600">Payment</div>
          <div className="grid grid-cols-2 gap-2">
            <select className="border rounded px-2 py-2" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Transfer">Transfer</option>
            </select>
            <select className="border rounded px-2 py-2" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">Invoice discount</span>
            <input className="border rounded px-2 py-1 w-32" type="number" value={headerDiscount} onChange={(e) => setHeaderDiscount(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Service Lines</div>
            <div className="text-sm text-neutral-600">{loadingCatalog ? "Loading..." : `${services.length} services`}</div>
          </div>
          <div className="flex gap-2">
            <select className="border rounded px-2 py-2 flex-1" onChange={(e) => { if (e.target.value) { addServiceLine(e.target.value); e.target.value = ""; } }} defaultValue="">
              <option value="">+ Add service</option>
              {services.map((s) => (
                <option key={s.ServiceID} value={s.ServiceID}>{s.ServiceName} ({money(s.ServicePrice)})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            {serviceLines.map((l, idx) => (
              <div key={idx} className="border rounded p-2 grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5 text-sm font-medium">{l.name}</div>
                <input className="col-span-2 border rounded px-2 py-1" type="number" min="1" value={l.quantity} onChange={(e) => setServiceLines((arr) => arr.map((x, i) => i === idx ? { ...x, quantity: e.target.value } : x))} />
                <input className="col-span-2 border rounded px-2 py-1" type="number" value={l.unitPrice} onChange={(e) => setServiceLines((arr) => arr.map((x, i) => i === idx ? { ...x, unitPrice: e.target.value } : x))} />
                <input className="col-span-2 border rounded px-2 py-1" type="number" value={l.discountAmount} onChange={(e) => setServiceLines((arr) => arr.map((x, i) => i === idx ? { ...x, discountAmount: e.target.value } : x))} />
                <button className="col-span-1 text-red-600" onClick={() => setServiceLines((arr) => arr.filter((_, i) => i !== idx))}>×</button>
                <div className="col-span-12 text-xs text-neutral-500">PetID: {l.petId || "(none)"}</div>
              </div>
            ))}
            {serviceLines.length === 0 && <div className="text-sm text-neutral-500">No service lines.</div>}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Product Lines</div>
            <div className="text-sm text-neutral-600">{loadingCatalog ? "Loading..." : `${products.length} products`}</div>
          </div>
          <div className="flex gap-2">
            <select className="border rounded px-2 py-2 flex-1" onChange={(e) => { if (e.target.value) { addProductLine(e.target.value); e.target.value = ""; } }} defaultValue="">
              <option value="">+ Add product</option>
              {products.map((p) => (
                <option key={p.ProductID} value={p.ProductID}>{p.ProductName} (stock: {p.StockQty}) ({money(p.SellingPrice)})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            {productLines.map((l, idx) => (
              <div key={idx} className="border rounded p-2 grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5 text-sm font-medium">{l.name}</div>
                <input className="col-span-2 border rounded px-2 py-1" type="number" min="1" value={l.quantity} onChange={(e) => setProductLines((arr) => arr.map((x, i) => i === idx ? { ...x, quantity: e.target.value } : x))} />
                <input className="col-span-2 border rounded px-2 py-1" type="number" value={l.unitPrice} onChange={(e) => setProductLines((arr) => arr.map((x, i) => i === idx ? { ...x, unitPrice: e.target.value } : x))} />
                <input className="col-span-2 border rounded px-2 py-1" type="number" value={l.discountAmount} onChange={(e) => setProductLines((arr) => arr.map((x, i) => i === idx ? { ...x, discountAmount: e.target.value } : x))} />
                <button className="col-span-1 text-red-600" onClick={() => setProductLines((arr) => arr.filter((_, i) => i !== idx))}>×</button>
              </div>
            ))}
            {productLines.length === 0 && <div className="text-sm text-neutral-500">No product lines.</div>}
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm text-neutral-600">Original: {money(totals.original)} | Discount: {money(totals.discount)}</div>
          <div className="text-xl font-semibold">Final: {money(totals.final)}</div>
        </div>
        <button
          className="px-4 py-2 rounded bg-secondary-600 text-white disabled:opacity-50"
          disabled={creating || !canCreate}
          onClick={createInvoice}
        >
          {creating ? "Creating..." : "Create Invoice"}
        </button>
      </div>

      {!canCreate && (
        <div className="text-sm text-neutral-600">
          To create: set <b>Branch ID</b> and <b>Staff ID</b> in sidebar and input <b>UserID</b>.
        </div>
      )}
    </div>
  );
}
