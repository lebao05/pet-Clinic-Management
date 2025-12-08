// src/shared/components/layout/Navbar.jsx
import React from "react";
import Avatar from "../ui/Avatar";

const Navbar = ({ title, searchPlaceholder, user, showNotifications = true, actions }) => {
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left: Title or Search */}
        <div className="flex-1">
          {searchPlaceholder ? (
            <div className="max-w-md">
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
              />
            </div>
          ) : (
            <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
          )}
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-4">
          {actions}

          {showNotifications && (
            <button className="relative p-2 hover:bg-neutral-100 rounded-lg transition">
              <span className="text-2xl">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-warning-500 rounded-full"></span>
            </button>
          )}

          <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
            <Avatar src={user?.avatar} name={user?.name} />
            <div className="text-sm">
              <p className="font-medium text-neutral-900">{user?.name}</p>
              <p className="text-neutral-600">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
