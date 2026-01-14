// src/pages/dashboard/DashboardPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../app/store";
import { removeShop } from "../../features/shops/shopsSlice";
import { fetchMyShops, deleteShop } from "../../features/shops/shopsThunks";
import { Plus, Settings, Trash2, AlertCircle, Loader2, ShoppingBag, Package, TrendingUp, Clock } from "lucide-react";
import { productsApi, categoriesApi } from "../../api/products.api";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get shops from API (items) and fallback to local storage (localItems)
  const { items: apiShops, localItems, loading, error } = useSelector((state: RootState) => state.shops);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  // Combine API shops with local shops for backward compatibility
  const shops = apiShops.length > 0 ? apiShops : localItems;

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyShops());
    }
  }, [dispatch, isAuthenticated]);

  // Fetch product and category counts for each shop
  useEffect(() => {
    const fetchCounts = async () => {
      const counts: Record<string, { products: number; categories: number }> = {};
      for (const shop of shops) {
        try {
          const [productsRes, categoriesRes] = await Promise.all([
            productsApi.getByShopId(shop.id),
            categoriesApi.getByShopId(shop.id),
          ]);
          counts[shop.id] = {
            products: productsRes.data.length,
            categories: categoriesRes.data.length,
          };
        } catch (error) {
          counts[shop.id] = { products: 0, categories: 0 };
        }
      }
      setShopCounts(counts);
    };
    if (shops.length > 0) {
      fetchCounts();
    }
  }, [shops]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [shopCounts, setShopCounts] = useState<Record<string, { products: number; categories: number }>>({});

  const handleDelete = () => {
    if (deleteId) {
      dispatch(removeShop(deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="p-8 bg-slate-900 min-h-screen">
      {/* Заголовок */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">Добро пожаловать!</h1>
        <p className="text-lg text-slate-400">Управление вашей империей моды</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-green-400 font-medium bg-green-900/30 px-2 py-1 rounded-full">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{shops.length}</h3>
          <p className="text-sm text-slate-400">Активных магазинов</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-green-400 font-medium bg-green-900/30 px-2 py-1 rounded-full">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-white">
            {Object.values(shopCounts).reduce((sum, count) => sum + count.products, 0)}
          </h3>
          <p className="text-sm text-slate-400">Всего товаров</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-green-400 font-medium bg-green-900/30 px-2 py-1 rounded-full">+24%</span>
          </div>
          <h3 className="text-2xl font-bold text-white">₽234K</h3>
          <p className="text-sm text-slate-400">Выручка за месяц</p>
        </div>
      </div>

      {/* Магазины */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Ваши магазины</h2>
        <button
          onClick={() => navigate("/shops/create")}
          className="px-4 py-2 bg-white text-slate-900 rounded-xl hover:bg-gray-100 transition-colors font-medium text-sm"
        >
          Создать магазин
        </button>
      </div>

      {shops.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div
            onClick={() => navigate("/shops/create")}
            className="text-center p-16 bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700 hover:border-slate-600 transition-all cursor-pointer group max-w-md"
          >
            <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-600 transition">
              <Plus className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Создайте первый магазин</h3>
            <p className="text-slate-400 text-lg">Запустите свой бренд за 2 минуты</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {shops.map((shop) => (
            <div key={shop.id} className="group relative">
              {/* Кнопка удаления */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(shop.id);
                }}
                className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all p-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-xl backdrop-blur-sm"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>

              <div
                onClick={() => navigate(`/stores/${shop.id}`)}
                className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-600 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
              >
                <div className="relative h-48">
                  <img
                    src={shop.coverImage || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200"}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      Онлайн
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white truncate mb-2">{shop.name}</h3>
                  <p className="text-sm text-slate-400 mb-4 truncate">
                    {shop.domain}.fashionconstruct.ru
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {shopCounts[shop.id]?.products ?? 0}
                    </span>
                    <span>•</span>
                    <span>{shopCounts[shop.id]?.categories ?? 0} категорий</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/stores/${shop.id}`);
                      }}
                      className="flex-1 py-2.5 bg-white text-slate-900 text-sm font-semibold rounded-xl hover:bg-gray-100 transition"
                    >
                      Управлять
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/stores/${shop.id}?tab=settings`);
                      }}
                      className="p-2.5 bg-slate-700 rounded-xl hover:bg-slate-600 transition"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Создать новый */}
          <div
            onClick={() => navigate("/shops/create")}
            className="bg-slate-800 rounded-2xl border-2 border-dashed border-slate-700 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-slate-600 hover:bg-slate-750 transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mb-4 group-hover:bg-slate-600 transition">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Новый магазин</h3>
            <p className="text-sm text-slate-400 mt-1">Добавить бренд</p>
          </div>
        </div>
      )}

      {/* Модалка подтверждения удаления */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Удалить магазин?</h3>
            </div>
            <p className="text-slate-400 mb-8">
              Все товары, настройки и данные будут удалены навсегда. Это действие нельзя отменить.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-6 py-3 text-slate-400 hover:text-white transition font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
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