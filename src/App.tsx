// src/App.tsx

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import ConfirmPage from "./pages/auth/ConfirmPage";

import DashboardPage from "./pages/dashboard/DashboardPage";
import ShopsPage from "./pages/shops/ShopsPage";
import CreateShopPage from "./pages/shops/create/CreateShopPage";
import StoreEditorPage from "./pages/store/StoreEditorPage";  
import AdminLayout from "./components/layout/AdminLayout";
import PrivateRoute from "./components/layout/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/confirm" element={<ConfirmPage />} />

        {/* Страницы с AdminLayout   */}
        <Route
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/shops" element={<ShopsPage />} />
          {/* другие страницы админки */}
        </Route>

        {/*  Страница создания магазина  */}
        <Route
          path="/shops/create"
          element={
            <PrivateRoute>
              <CreateShopPage />
            </PrivateRoute>
          }
        />

        {/* УПРАВЛЕНИЕ МАГАЗИНОМ */}
        <Route
          path="/stores/:id"
          element={
            <PrivateRoute>
              <StoreEditorPage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<div className="p-10 text-3xl">404</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;