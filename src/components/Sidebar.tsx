import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart2,
  HelpCircle
} from "lucide-react";

const Sidebar = () => {
  const mainMenu = [
    { name: "Панель управления", icon: <LayoutDashboard size={18} />, to: "/" },
    { name: "Аналитика", icon: <BarChart2 size={18} />, to: "/analytics" },
  ];

  return (
    <aside className="w-64 bg-[var(--card)] border-r border-[var(--border)] min-h-screen p-5 flex flex-col justify-between">
      {/* Основная часть */}
      <div>
        <h1 className="text-xl font-semibold mb-8 tracking-tight">
          FashionConstruct
        </h1>

        <nav className="space-y-2">
          {mainMenu.map((item) => (
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
      </div>

      {/* Нижняя панель "Помощь и поддержка" */}
      <div className="mt-auto pt-4 border-t border-[var(--border)]">
        <NavLink
          to="/support"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition
            ${isActive ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "hover:bg-[var(--muted)]"}`
          }
        >
          <HelpCircle size={18} />
          Помощь и поддержка
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;