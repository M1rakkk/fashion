import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart2,
  HelpCircle,
  Package
} from "lucide-react";

const Sidebar = () => {
  const mainMenu = [
    { name: "Панель управления", icon: <LayoutDashboard size={18} />, to: "/" },
    { name: "Аналитика", icon: <BarChart2 size={18} />, to: "/analytics" },
  ];

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 min-h-screen flex flex-col">
      {/* Логотип */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">FashionConstruct</h1>
            <p className="text-xs text-slate-400">Панель управления</p>
          </div>
        </div>
      </div>

      {/* Основная навигация */}
      <div className="flex-1 p-4">
        <nav className="space-y-1">
          {mainMenu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? "bg-white text-slate-900 shadow-lg" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-300"}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Нижняя панель */}
      <div className="p-4 border-t border-slate-800">
        <NavLink
          to="/support"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
            ${isActive 
              ? "bg-white text-slate-900 shadow-lg" 
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <HelpCircle size={18} className="text-slate-400 group-hover:text-slate-300" />
          <span className="font-medium">Помощь и поддержка</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;