// src/features/branchManager/pages/StaffPage.jsx
import React, { useState } from "react";
import {Card} from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";

const StaffPage = () => {
  const [staff, setStaff] = useState([
    { id: 1, name: "Dr. Emily Smith", role: "Veterinarian", phone: "(555) 123-4567", status: "Active" },
    { id: 2, name: "Dr. Ben Jones", role: "Veterinarian", phone: "(555) 234-5678", status: "Active" },
    { id: 3, name: "Alex Doe", role: "Receptionist", phone: "(555) 345-6789", status: "Active" },
    { id: 4, name: "Sarah Wilson", role: "Sales", phone: "(555) 456-7890", status: "On Leave" },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Staff Management</h1>
          <p className="text-neutral-600">Manage branch employees</p>
        </div>
        <Button icon="➕">Add New Staff</Button>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search staff by name or role..."
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
          />
          <select className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500">
            <option>All Roles</option>
            <option>Veterinarian</option>
            <option>Receptionist</option>
            <option>Sales</option>
          </select>
          <select className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500">
            <option>All Status</option>
            <option>Active</option>
            <option>On Leave</option>
          </select>
        </div>
      </Card>

      {/* Staff Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {staff.map((person) => (
                <tr key={person.id} className="hover:bg-neutral-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-500 text-white flex items-center justify-center font-semibold">
                        {person.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="font-medium text-neutral-900">{person.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-700">{person.role}</td>
                  <td className="px-6 py-4 text-neutral-700">{person.phone}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        person.status === "Active"
                          ? "bg-success-100 text-success-700"
                          : "bg-warning-100 text-warning-700"
                      }`}
                    >
                      {person.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-neutral-100 rounded-lg transition" title="Edit">
                        ✏️
                      </button>
                      <button className="p-2 hover:bg-neutral-100 rounded-lg transition" title="View">
                        👁️
                      </button>
                      <button className="p-2 hover:bg-danger-50 rounded-lg transition text-danger-600" title="Delete">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">Showing 1-4 of 4 staff members</p>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50"
            disabled
          >
            Previous
          </button>
          <button className="px-4 py-2 bg-secondary-500 text-white rounded-lg">1</button>
          <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
