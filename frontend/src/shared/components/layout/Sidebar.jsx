// src/shared/components/layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ logo, title, subtitle, menuItems, footer }) => {
  return (
    <aside className="w-60 bg-white border-r border-neutral-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo & Title */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
            {logo}
          </div>
          <div>
            <h1 className="font-bold text-lg text-neutral-900">{title}</h1>
            {subtitle && <p className="text-xs text-neutral-600">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-neutral-700 transition-colors
              ${
                isActive
                  ? "bg-primary-50 text-secondary-600 border-r-4 border-secondary-500 font-medium"
                  : "hover:bg-neutral-50"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {footer && <div className="p-4 border-t border-neutral-200">{footer}</div>}
    </aside>
  );
};

export default Sidebar;
