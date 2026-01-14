// src/components/Header.tsx

import React from "react";
import { Bell, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import type { RootState } from "../app/store";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { email } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout() as any);
    navigate("/login");
  };

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-end px-6">
      <div className="flex items-center gap-4">
        {/* Аватарка слева от колокольчика */}
        <img
          src="https://i.pravatar.cc/40"
          alt="User"
          className="w-9 h-9 rounded-full ring-2 ring-[var(--border)]"
        />

        <button className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {/* Кнопка выхода */}
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors flex items-center gap-2"
          title="Выйти"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;