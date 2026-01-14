// src/components/layout/AdminLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../Sidebar";
import Header from "../Header";

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Левое меню */}
      <Sidebar />

      {/* Основная зона */}
      <div className="flex flex-col flex-1">
        {/* Верхняя панель */}
        <Header />

        {/* Контент */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
