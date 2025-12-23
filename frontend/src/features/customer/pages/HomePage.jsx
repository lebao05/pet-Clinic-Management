// src/features/customer/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import Button from "../../../shared/components/ui/Button";
import {Card} from "../../../shared/components/ui/Card";

const HomePage = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      {/* Hero Banner */}
      <div
        className="relative rounded-2xl overflow-hidden h-96 mb-8"
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
        <div className="relative h-full flex flex-col justify-center px-12 text-white">
          <h1 className="text-5xl font-bold mb-4">Welcome back, John!</h1>
          <p className="text-xl mb-6 max-w-xl text-white/90">
            Your trusted partner in pet care. We're here to help ensure your furry friends are happy and healthy.
          </p>
          <div>
            <Button size="lg" variant="secondary">
              Book a New Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <h2 className="text-2xl font-bold mb-6 text-neutral-900">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card hover>
          <div className="h-40 rounded-lg bg-rose-100 mb-4 flex items-center justify-center overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1506755855567-92ff770e8d00?w=400"
              alt="Calendar"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-bold text-lg mb-2">Upcoming Appointments</h3>
          <p className="text-neutral-600 text-sm mb-4">Your next visit is on Oct 26.</p>
          <Link to="/customer/appointments" className="text-secondary-600 font-medium hover:text-secondary-700">
            View all →
          </Link>
        </Card>

        <Card hover>
          <div className="h-40 rounded-lg bg-amber-100 mb-4 flex items-center justify-center overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400"
              alt="Pet"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-bold text-lg mb-2">My Pet's Profiles</h3>
          <p className="text-neutral-600 text-sm mb-4">Manage your pet's health records.</p>
          <Link to="/customer/pets" className="text-secondary-600 font-medium hover:text-secondary-700">
            Manage pets →
          </Link>
        </Card>

        <Card hover>
          <div className="h-40 rounded-lg bg-sky-100 mb-4 flex items-center justify-center overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1554224311-beee4ece8070?w=400"
              alt="Billing"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-bold text-lg mb-2">Billing History</h3>
          <p className="text-neutral-600 text-sm mb-4">View your latest invoices.</p>
          <Link to="/customer/billing" className="text-secondary-600 font-medium hover:text-secondary-700">
            View history →
          </Link>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <h2 className="text-2xl font-bold mb-6 text-neutral-900">Upcoming Appointments</h2>
      <Card className="mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-secondary-500 rounded-lg flex flex-col items-center justify-center text-white">
            <span className="text-xs uppercase">OCT</span>
            <span className="text-3xl font-bold">26</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Annual Check-up for Buddy</h3>
            <p className="text-neutral-600 text-sm">with Dr. Emily Carter</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <span>🕐</span>
              <span>10:30 AM</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>Main Street Clinic</span>
            </div>
          </div>
          <Button variant="outline">View Details</Button>
        </div>
      </Card>
    </div>
  );
};

export default HomePage;
