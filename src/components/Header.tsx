// src/components/Header.tsx

import React from "react";
import { LogOut, Search, Settings } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import type { RootState } from "../app/store";
import NotificationsDropdown from "./NotificationsDropdown";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { email } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout() as any);
    navigate("/login");
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      {/* Левая часть - поиск */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Поиск по магазинам, товарам..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent text-sm text-white placeholder-slate-400"
          />
        </div>
      </div>

      {/* Правая часть */}
      <div className="flex items-center gap-3">
        {/* Уведомления */}
        <NotificationsDropdown />

        {/* Кнопка настроек */}
        <button className="p-2.5 hover:bg-slate-800 rounded-xl transition-colors group">
          <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-200" />
        </button>

        {/* Разделитель */}
        <div className="w-px h-6 bg-slate-700 mx-1"></div>

        {/* Информация о пользователе */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">
              {email || "Администратор"}
            </p>
            <p className="text-xs text-slate-400">Владелец магазина</p>
          </div>
          
          {/* Аватар */}
          <div className="relative">
            <img
              src="https://i.pravatar.cc/40"
              alt="User"
              className="w-10 h-10 rounded-full ring-2 ring-slate-700 hover:ring-slate-600 transition-all"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>

          {/* Кнопка выхода */}
          <button
            onClick={handleLogout}
            className="p-2.5 hover:bg-red-900/20 rounded-xl transition-colors group"
            title="Выйти"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;