import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import { branchManagerApi } from "../../../api/branchManagerApi";
import { RefreshCw, Package, AlertTriangle, XCircle, DollarSign } from "lucide-react";

function getDefaultBranchId() {
  const v = localStorage.getItem("branchId");
  return v ? Number(v) : 1;
}

export default function InventoryPage() {
  const [branchId, setBranchId] = useState(getDefaultBranchId());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==================== STATS ====================
  const stats = useMemo(() => {
    const totalProducts = items.length;
    const lowStock = items.filter((x) => Number(x.StockQty) < 10 && x.IsActive).length;
    const outStock = items.filter((x) => Number(x.StockQty) === 0 && x.IsActive).length;
    const totalValue = items.reduce((acc, x) => acc + Number(x.StockQty || 0) * Number(x.SellingPrice || 0), 0);
    return { totalProducts, lowStock, outStock, totalValue };
  }, [items]);

  // ==================== LOAD DATA ====================
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

  // ==================== UPDATE ROW ====================
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

  // ==================== STATUS HELPER ====================
  const getStatus = (x) => {
    if (!x.IsActive) return { label: "Inactive", cls: "bg-neutral-100 text-neutral-700" };
    if (Number(x.StockQty) === 0) return { label: "Out of Stock", cls: "bg-danger-100 text-danger-700" };
    if (Number(x.StockQty) < 10) return { label: "Low Stock", cls: "bg-warning-100 text-warning-700" };
    return { label: "In Stock", cls: "bg-success-100 text-success-700" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Inventory Management</h1>
          <p className="text-sm text-neutral-600 mt-1">Track and manage stock per branch.</p>
        </div>

        <Button onClick={load} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong className="font-medium">Error: </strong>
          <span>{error}</span>
        </div>
      )}

      {/* Testing Controls - Collapsible */}
      <details className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
        <summary className="cursor-pointer font-medium text-neutral-700 text-sm">
          🔧 Testing Controls (Click to expand)
        </summary>
        <div className="flex gap-4 items-end mt-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Branch ID (for testing)</label>
            <input
              type="number"
              value={branchId}
              onChange={(e) => setBranchId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
            />
          </div>
          <Button onClick={saveBranch} variant="primary">
            Load Data
          </Button>
        </div>
        <div className="mt-2 text-xs text-neutral-600 bg-blue-50 p-2 rounded border border-blue-200">
          💡 <strong>Tip:</strong> Change Branch ID to test different branches (1, 2, 3, etc.)
        </div>
      </details>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Products</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.totalProducts}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.lowStock}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.outStock}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 text-red-600">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{(stats.totalValue / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
        ℹ️ Low stock threshold is &lt; 10 units. Items marked as "Inactive" won't appear in sales.
      </div>

      {/* Inventory Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Selling Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading inventory...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                    No inventory items found for this branch.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const st = getStatus(item);
                  return (
                    <tr key={item.ProductID} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-neutral-900">{item.ProductName}</div>
                        <div className="text-xs text-neutral-500">#{item.ProductID}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700">
                          {item.ProductType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.StockQty}
                          onChange={(e) => setRow(idx, { StockQty: e.target.value })}
                          className="w-20 px-2 py-1 border border-neutral-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.SellingPrice}
                          onChange={(e) => setRow(idx, { SellingPrice: e.target.value })}
                          className="w-28 px-2 py-1 border border-neutral-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={item.IsActive}
                          onChange={(e) => setRow(idx, { IsActive: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="primary" size="sm" onClick={() => saveRow(item)}>
                          Save
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && items.length > 0 && (
          <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50 text-sm text-neutral-600">
            Total: {items.length} products | Low Stock: {stats.lowStock} | Out of Stock: {stats.outStock}
          </div>
        )}
      </Card>
    </div>
  );
}
