// src/pages/store/StoreEditorPage.tsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../app/store";
import {
  addProductToShop,
  removeProductFromShop,
} from "../../features/shops/shopsSlice";
import {
  ChevronLeft,
  Package,
  Tag,
  Package2,
  Newspaper,
  Brush,
  Settings,
  Plus,
  Upload,
  X,
  Trash2,
} from "lucide-react";

export default function StoreEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Товары");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    image: "",
    name: "",
    category: "Верхняя одежда",
    subcategory: "Без подкатегории",
    brand: "Nike",
    price: "",
    sizes: [] as string[],
    description: "",
  });

  const shop = useSelector((state: RootState) =>
    state.shops.items.find((s) => s.id === id)
  );

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex items-center justify-center text-sm">
        Магазин не найден
      </div>
    );
  }

  const categories = ["Верхняя одежда", "Нижняя одежда", "Обувь", "Аксессуары"];
  const subcategories = ["Без подкатегории", "Куртки", "Пальто", "Джинсы", "Кроссовки"];
  const brands = shop.brands.length > 0 ? shop.brands : ["Nike", "Adidas", "Zara"];
  const sizes = ["S", "M", "L", "XL"];

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleAddProduct = () => {
    if (!form.name.trim() || !form.price.trim()) return;

    const product = {
      id: Date.now().toString(),
      image: form.image,
      name: form.name.trim(),
      category: form.category,
      subcategory: form.subcategory,
      brand: form.brand,
      price: Number(form.price).toLocaleString() + " ₽",
      sizes: form.sizes,
      description: form.description.trim(),
    };

    dispatch(addProductToShop({ shopId: id!, product }));
    setIsModalOpen(false);
    setForm({
      image: "",
      name: "",
      category: "Верхняя одежда",
      subcategory: "Без подкатегории",
      brand: brands[0],
      price: "",
      sizes: [],
      description: "",
    });
  };

  const managementItems = [
    { icon: Package, label: "Товары" },
    { icon: Tag, label: "Категории" },
    { icon: Package2, label: "Бренды" },
    { icon: Newspaper, label: "Новости" },
  ];

  const settingsItems = [
    { icon: Brush, label: "Дизайн" },
    { icon: Settings, label: "Общие" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white flex">
      {/* САЙДБАР — без изменений */}
      <aside className="w-64 bg-[#0f1621] flex flex-col">
        <div className="px-5 pt-4 pb-4 border-b border-white/10">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs font-medium mb-5"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Назад
          </button>
          <div className="space-y-3">
            <h2 className="text-lg font-bold leading-none">{shop.name}</h2>
            <div className="pt-1">
              <span className="inline-block text-[9px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                Онлайн
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-5 pt-5 space-y-6">
          <div>
            <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Управление
            </h3>
            <nav className="space-y-0.5">
              {managementItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => setActiveTab(item.label)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                      isActive
                        ? "bg-white text-black font-semibold"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Настройки
            </h3>
            <nav className="space-y-0.5">
              {settingsItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => setActiveTab(item.label)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                      isActive
                        ? "bg-white text-black font-semibold"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* КОНТЕНТ */}
      <main className="flex-1 px-6 pt-5">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{activeTab}</h1>
          {activeTab === "Товары" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 px-10 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition shadow-2xl text-base"
            >
              <Plus className="w-5 h-5" />
              Добавить товар
            </button>
          )}
        </div>

        {activeTab === "Товары" && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4">
            {shop.products?.length > 0 ? (
              shop.products.map((product: any) => (
                <div
                  key={product.id}
                  className="group relative bg-[#111822] rounded-xl overflow-hidden shadow-md hover:shadow-cyan-500/20 transition-all"
                >
                  <div className="aspect-[3/4] bg-gray-800 relative overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-2xl">
                        Shirt
                      </div>
                    )}
                    <button
                      onClick={() =>
                        dispatch(removeProductFromShop({ shopId: id!, productId: product.id }))
                      }
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-medium truncate leading-tight">{product.name}</h3>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                      {product.category} / {product.subcategory}
                    </p>
                    <p className="text-sm font-bold mt-1.5">{product.price}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p className="text-sm">Товаров пока нет</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* МОДАЛКА — МАКСИМАЛЬНО КОМПАКТНАЯ, БЕЗ СКРОЛЛА */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1621] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-white/10">
              <h3 className="text-lg font-bold">Новый товар</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              {/* Фото */}
              <label className="block cursor-pointer">
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                {!form.image ? (
                  <div className="border-2 border-dashed border-white/20 rounded-2xl h-40 flex flex-col items-center justify-center hover:border-white/40 bg-white/5">
                    <Upload className="w-9 h-9 mb-2 text-gray-500" />
                    <p className="text-xs text-gray-400">Добавить изображение</p>
                  </div>
                ) : (
                  <img src={form.image} alt="preview" className="w-full h-40 object-cover rounded-2xl" />
                )}
              </label>

              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Название товара"
                className="w-full px-4 py-3 bg-white/10 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="px-4 py-3 bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={form.subcategory}
                  onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                  className="px-4 py-3 bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                >
                  {subcategories.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="px-4 py-3 bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                >
                  {brands.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
                <input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, "") })}
                  placeholder="Цена (₽)"
                  className="px-4 py-3 bg-white/10 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Размеры</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                        form.sizes.includes(size)
                          ? "bg-white text-black"
                          : "bg-white/10 text-gray-400 hover:bg-white/20"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Описание (необязательно)"
                rows={2}
                className="w-full px-4 py-3 bg-white/10 rounded-xl placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              />
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-white/10">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-gray-400 hover:text-white transition"
              >
                Отмена
              </button>
              <button
                onClick={handleAddProduct}
                className="px-7 py-2.5 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition shadow-lg"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}