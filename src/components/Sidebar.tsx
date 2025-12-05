import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Store,
  Settings,
  LayoutDashboard,
  Palette,
  ShoppingBag
} from "lucide-react";

const Sidebar = () => {
  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, to: "/" },
    { name: "Магазины", icon: <Store size={18} />, to: "/shops" },
    { name: "Темы", icon: <Palette size={18} />, to: "/themes" },
    { name: "Товары", icon: <ShoppingBag size={18} />, to: "/products" },
    { name: "Настройки", icon: <Settings size={18} />, to: "/settings" },
  ];

  return (
    <aside className="w-64 bg-[var(--card)] border-r border-[var(--border)] min-h-screen p-5">
      <h1 className="text-xl font-semibold mb-8 tracking-tight">
        Admin Panel
      </h1>

      <nav className="space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition
              ${isActive ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "hover:bg-[var(--muted)]"}`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
