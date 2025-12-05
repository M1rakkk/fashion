// src/pages/dashboard/DashboardPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../app/store";
import { removeShop } from "../../features/shops/shopsSlice"; // ← важно!
import { Plus, Settings, Trash2, AlertCircle } from "lucide-react";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const shops = useSelector((state: RootState) => state.shops.items);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      dispatch(removeShop(deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Добро пожаловать!</h1>
        <p className="text-sm text-gray-400 mt-2">Управление вашей империей моды</p>
      </div>

      {shops.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div
            onClick={() => navigate("/shops/create")}
            className="text-center p-12 bg-white/5 rounded-3xl border-2 border-dashed border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer group"
          >
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-cyan-500/20 transition">
              <Plus className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-2">Создать первый магазин</h3>
            <p className="text-gray-400">Запустите свой бренд за 2 минуты</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {shops.map((shop) => (
            <div key={shop.id} className="group relative">
              {/* Кнопка удаления — появляется при наведении */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(shop.id);
                }}
                className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all p-2.5 bg-red-500/20 hover:bg-red-500/40 rounded-xl backdrop-blur-sm"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>

              <div
                onClick={() => navigate(`/stores/${shop.id}`)}
                className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-lg transition-all hover:scale-[1.02] hover:shadow-cyan-500/10 cursor-pointer"
              >
                <div className="relative h-48">
                  <img
                    src={shop.coverImage || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200"}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-green-500 text-black text-xs font-bold rounded-full">
                      Онлайн
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold truncate">{shop.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {shop.domain}.fashionconstruct.ru
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                    <span>{shop.products.length} товаров</span>
                    <span>•</span>
                    <span>{shop.categories.length} категорий</span>
                  </div>

                  <div className="flex gap-2 mt-5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/stores/${shop.id}`);
                      }}
                      className="flex-1 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-gray-200 transition"
                    >
                      Управлять
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Создать новый */}
          <div
            onClick={() => navigate("/shops/create")}
            className="bg-white/5 rounded-2xl border-2 border-dashed border-white/10 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold">Новый магазин</h3>
            <p className="text-xs text-gray-400 mt-1">Добавить бренд</p>
          </div>
        </div>
      )}

      {/* Модалка подтверждения удаления */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1621] rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="text-xl font-bold">Удалить магазин?</h3>
            </div>
            <p className="text-gray-400 mb-8">
              Все товары, настройки и данные будут удалены навсегда. Это действие нельзя отменить.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-6 py-3 text-gray-400 hover:text-white transition"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition"
              >
                Удалить навсегда
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;