import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import { branchManagerApi } from "../../../api/branchManagerApi";

function getDefaultBranchId() {
  const v = localStorage.getItem("branchId");
  return v ? Number(v) : 1;
}

export default function InventoryPage() {
  const [branchId, setBranchId] = useState(getDefaultBranchId());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const totalProducts = items.length;
    const lowStock = items.filter((x) => Number(x.StockQty) < 10 && x.IsActive).length;
    const outStock = items.filter((x) => Number(x.StockQty) === 0 && x.IsActive).length;
    const totalValue = items.reduce((acc, x) => acc + Number(x.StockQty || 0) * Number(x.SellingPrice || 0), 0);
    return { totalProducts, lowStock, outStock, totalValue };
  }, [items]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await branchManagerApi.listInventory(branchId);
      setItems(res.data?.data?.items || []);
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

  function saveBranch() {
    localStorage.setItem("branchId", String(branchId));
    load();
  }

  function setRow(idx, patch) {
    setItems((prev) => prev.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  }

  async function saveRow(row) {
    try {
      setError("");
      await branchManagerApi.updateInventory({
        branchId,
        productId: row.ProductID,
        stockQty: Number(row.StockQty),
        sellingPrice: Number(row.SellingPrice),
        isActive: !!row.IsActive,
      });
      load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  const getStatus = (x) => {
    if (!x.IsActive) return { label: "Inactive", cls: "bg-neutral-100 text-neutral-700" };
    if (Number(x.StockQty) === 0) return { label: "Out of Stock", cls: "bg-danger-100 text-danger-700" };
    if (Number(x.StockQty) < 10) return { label: "Low Stock", cls: "bg-warning-100 text-warning-700" };
    return { label: "In Stock", cls: "bg-success-100 text-success-700" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Inventory Management</h1>
          <p className="text-neutral-600">Track and manage stock per branch.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="w-28 px-3 py-2 border rounded-lg"
            type="number"
            min={1}
            value={branchId}
            onChange={(e) => setBranchId(Number(e.target.value))}
          />
          <Button onClick={saveBranch}>Set Branch</Button>
        </div>
      </div>

      {error && <p className="text-sm text-danger-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Total Products</p>
          <p className="text-3xl font-bold text-neutral-900">{stats.totalProducts}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Low Stock</p>
          <p className="text-3xl font-bold text-warning-600">{stats.lowStock}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Out of Stock</p>
          <p className="text-3xl font-bold text-danger-600">{stats.outStock}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Total Value</p>
          <p className="text-3xl font-bold text-success-600">
            {stats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
          <p className="text-sm text-neutral-600">Low stock threshold is &lt; 10.</p>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Type</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Stock</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">Selling Price</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Active</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {items.map((item, idx) => {
                const st = getStatus(item);
                return (
                  <tr key={`${item.BranchID}-${item.ProductID}`} className="hover:bg-neutral-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-900">{item.ProductName}</div>
                      <div className="text-sm text-neutral-600">#{item.ProductID}</div>
                    </td>
                    <td className="px-6 py-4 text-neutral-700">{item.ProductType}</td>
                    <td className="px-6 py-4 text-center">
                      <input
                        className="w-24 text-center px-3 py-2 border rounded-lg"
                        type="number"
                        min={0}
                        value={item.StockQty}
                        onChange={(e) => setRow(idx, { StockQty: e.target.value })}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <input
                        className="w-32 text-right px-3 py-2 border rounded-lg"
                        type="number"
                        step="0.01"
                        min={0}
                        value={item.SellingPrice}
                        onChange={(e) => setRow(idx, { SellingPrice: e.target.value })}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input type="checkbox" checked={!!item.IsActive} onChange={(e) => setRow(idx, { IsActive: e.target.checked })} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button onClick={() => saveRow(item)}>Save</Button>
                    </td>
                  </tr>
                );
              })}
              {!items.length && !loading && (
                <tr>
                  <td className="px-6 py-8 text-center text-neutral-600" colSpan={7}>No inventory items found for this branch.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
