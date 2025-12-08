// src/features/companyAdmin/pages/BranchesPage.jsx
import React, { useState } from "react";
import Card from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";

const BranchesPage = () => {
  const [branches] = useState([
    {
      id: 1,
      name: "Downtown Branch",
      city: "New York",
      phone: "(555) 001-0001",
      staff: 12,
      revenue: 125000,
      status: "Active",
    },
    {
      id: 2,
      name: "Westside Branch",
      city: "Los Angeles",
      phone: "(555) 002-0002",
      staff: 10,
      revenue: 98000,
      status: "Active",
    },
    {
      id: 3,
      name: "Central Branch",
      city: "Chicago",
      phone: "(555) 003-0003",
      staff: 15,
      revenue: 145000,
      status: "Active",
    },
    {
      id: 4,
      name: "Harbor Branch",
      city: "San Francisco",
      phone: "(555) 004-0004",
      staff: 8,
      revenue: 87000,
      status: "Active",
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Branch Management</h1>
          <p className="text-neutral-600">Manage all company branches</p>
        </div>
        <Button icon="➕">Add New Branch</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Total Branches</p>
          <p className="text-3xl font-bold text-neutral-900">10</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Total Staff</p>
          <p className="text-3xl font-bold text-secondary-600">124</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Avg Revenue/Branch</p>
          <p className="text-3xl font-bold text-success-600">$125K</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-600 mb-1">Top Performer</p>
          <p className="text-lg font-bold text-warning-600">Branch 5</p>
        </Card>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map((branch) => (
          <Card key={branch.id} hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center text-2xl">
                  🏢
                </div>
                <div>
                  <h3 className="font-bold text-lg text-neutral-900">{branch.name}</h3>
                  <p className="text-sm text-neutral-600">{branch.city}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-success-100 text-success-700 text-xs font-medium rounded-full">
                {branch.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-neutral-700 mb-4">
              <p className="flex items-center gap-2">
                <span>📞</span>
                {branch.phone}
              </p>
              <p className="flex items-center gap-2">
                <span>👥</span>
                {branch.staff} Staff Members
              </p>
              <p className="flex items-center gap-2">
                <span>💰</span>${branch.revenue.toLocaleString()} Revenue
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="primary" size="sm" fullWidth>
                View Details
              </Button>
              <Button variant="outline" size="sm" fullWidth>
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BranchesPage;
