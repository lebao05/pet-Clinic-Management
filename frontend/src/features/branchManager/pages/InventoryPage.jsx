// src/features/branchManager/pages/InventoryPage.jsx
import React, { useState } from "react";
import {Card} from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";

const InventoryPage = () => {
  const [inventory, setInventory] = useState([
    { id: 1, name: "Dog Food Premium", category: "Food", stock: 45, price: 29.99, status: "In Stock" },
    { id: 2, name: "Cat Litter", category: "Supplies", stock: 23, price: 15.99, status: "In Stock" },
    { id: 3, name: "Flea Medication", category: "Medicine", stock: 8, price: 45.0, status: "Low Stock" },
    { id: 4, name: "Pet Shampoo", category: "Grooming", stock: 67, price: 12.5, status: "In Stock" },
    { id: 5, name: "Dental Treats", category: "Treats", stock: 5, price: 8.99, status: "Low Stock" },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-success-100 text-success-700";
      case "Low Stock":
        return "bg-warning-100 text-warning-700";
      case "Out of Stock":
        return "bg-danger-100 text-danger-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Inventory Management</h1>
          <p className="text-neutral-600">Track and manage branch stock</p>
        </div>
        <Button icon="➕">Add Product</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Total Products</p>
          <p className="text-3xl font-bold text-neutral-900">187</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Low Stock Items</p>
          <p className="text-3xl font-bold text-warning-600">12</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Out of Stock</p>
          <p className="text-3xl font-bold text-danger-600">3</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Total Value</p>
          <p className="text-3xl font-bold text-success-600">$45.2K</p>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
          />
          <select className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none">
            <option>All Categories</option>
            <option>Food</option>
            <option>Medicine</option>
            <option>Supplies</option>
            <option>Grooming</option>
          </select>
          <select className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none">
            <option>All Status</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Product Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Category</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Stock</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">Price</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50 transition">
                  <td className="px-6 py-4 font-medium text-neutral-900">{item.name}</td>
                  <td className="px-6 py-4 text-neutral-700">{item.category}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-lg font-bold ${
                        item.stock < 10 ? "bg-warning-50 text-warning-600" : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-neutral-900">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-neutral-100 rounded-lg transition" title="Edit">
                        ✏️
                      </button>
                      <button
                        className="p-2 hover:bg-secondary-50 rounded-lg transition text-secondary-600"
                        title="Restock"
                      >
                        📦
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default InventoryPage;
