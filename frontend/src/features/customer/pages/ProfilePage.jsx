// src/features/customer/pages/ProfilePage.jsx
import React from "react";
import Card from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-primary-50 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-neutral-900">My Profile</h1>

        <h2 className="text-2xl font-bold mb-6 text-neutral-800">Welcome back, Jane Doe!</h2>

        {/* Rewards Card */}
        <Card className="mb-6">
          <div className="text-center py-8">
            <p className="text-secondary-600 font-semibold text-sm uppercase tracking-wide mb-3">PETCAREX REWARDS</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl">🏅</span>
              <h3 className="text-3xl font-bold text-neutral-900">Gold Member</h3>
            </div>
            <p className="text-neutral-600 mb-2">Your Points Balance</p>
            <p className="text-6xl font-bold text-primary-400">1,250</p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button variant="primary" size="lg">
            Edit Profile
          </Button>
          <Button variant="outline" size="lg">
            View Points History
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
