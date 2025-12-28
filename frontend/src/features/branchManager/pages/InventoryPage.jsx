// frontend/src/features/branchManager/pages/InventoryPage.jsx

import React, { useState, useEffect } from "react";
import branchManagerApi from "../../../api/branchManagerApi";
import { Package, Search, AlertCircle, Edit, Save, X, RefreshCw } from "lucide-react";

const InventoryPage = () => {
  const branchId = 10;
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editQty, setEditQty] = useState("");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await branchManagerApi.getInventory(branchId);
      setInventory(res.data.inventory || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (productId) => {
    try {
      await branchManagerApi.updateInventory({
        branchId,
        productId,
        stockQty: parseInt(editQty),
      });
      alert("Cập nhật tồn kho thành công!");
      setEditingItem(null);
      fetchInventory();
    } catch (error) {
      console.error("Error updating inventory:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  const getStockBadge = (status) => {
    const config = {
      out_of_stock: { bg: "bg-red-100", text: "text-red-800", label: "Hết hàng" },
      low_stock: { bg: "bg-amber-100", text: "text-amber-800", label: "Sắp hết" },
      in_stock: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Còn hàng" },
    };
    const c = config[status] || config.in_stock;
    return <span className={`${c.bg} ${c.text} px-3 py-1 rounded-full text-sm font-medium`}>{c.label}</span>;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const filteredInventory = inventory.filter((item) =>
    item.ProductName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    inStock: inventory.filter((i) => i.stockStatus === "in_stock").length,
    lowStock: inventory.filter((i) => i.stockStatus === "low_stock").length,
    outOfStock: inventory.filter((i) => i.stockStatus === "out_of_stock").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-amber-600" />
            Quản lý Tồn kho
          </h1>
          <p className="text-gray-600 mt-1">Theo dõi và cập nhật hàng tồn kho</p>
        </div>
        <button
          onClick={fetchInventory}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <Package className="w-12 h-12 opacity-80" />
            <div>
              <div className="text-3xl font-bold">{stats.inStock}</div>
              <div className="text-sm opacity-90">Còn hàng</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <AlertCircle className="w-12 h-12 opacity-80" />
            <div>
              <div className="text-3xl font-bold">{stats.lowStock}</div>
              <div className="text-sm opacity-90">Sắp hết</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <AlertCircle className="w-12 h-12 opacity-80" />
            <div>
              <div className="text-3xl font-bold">{stats.outOfStock}</div>
              <div className="text-sm opacity-90">Hết hàng</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Danh sách tồn kho ({filteredInventory.length})</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Loại</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Số lượng</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Giá bán</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const isEditing = editingItem === item.ProductID;
                  return (
                    <tr key={item.ProductID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.ProductName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.ProductType}</td>
                      <td className="px-6 py-4 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            className="w-24 px-3 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-amber-500"
                          />
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            {item.StockQty} {item.Unit}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(item.SellingPrice)}
                      </td>
                      <td className="px-6 py-4 text-center">{getStockBadge(item.stockStatus)}</td>
                      <td className="px-6 py-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleSave(item.ProductID)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingItem(item.ProductID);
                              setEditQty(item.StockQty);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
