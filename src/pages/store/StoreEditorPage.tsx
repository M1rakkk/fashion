// src/pages/store/StoreEditorPage.tsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  productsApi,
  categoriesApi,
  brandsApi,
  IProductResponse,
  ICategoryResponse,
  IBrandResponse,
} from "../../api/products.api";
import { filesApi } from "../../api/files.api";
import { shopsApi, IShopDisplay, toShopDisplay, IShopResponse } from "../../api/shops.api";
import { newsApi, INewsResponse } from "../../api/news.api";
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
  Loader2,
} from "lucide-react";

export default function StoreEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Товары");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // API data
  const [products, setProducts] = useState<IProductResponse[]>([]);
  const [categories, setCategories] = useState<ICategoryResponse[]>([]);
  const [brands, setBrands] = useState<IBrandResponse[]>([]);
  const [news, setNews] = useState<INewsResponse[]>([]);
  const [shop, setShop] = useState<IShopDisplay | null>(null);

  // Form state
  const [form, setForm] = useState({
    image: "",
    imageFile: null as File | null,
    name: "",
    categoryId: "",
    brandId: "",
    price: "",
    description: "",
  });

  // Category/Brand form state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] = useState("");
  const [newBrandName, setNewBrandName] = useState("");

  // News form state
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    previewImageUrl: "",
    previewImageFile: null as File | null,
    isPublished: true,
  });

  // Design settings state
  const [designSettings, setDesignSettings] = useState({
    primaryColor: "#06b6d4",
    secondaryColor: "#8b5cf6",
    backgroundColor: "#0a0f1a",
    textColor: "#ffffff",
    accentColor: "#f59e0b",
    fontFamily: "Inter",
    borderRadius: "12",
    cardStyle: "modern",
  });
  const [isDesignSaving, setIsDesignSaving] = useState(false);

  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    shopName: "",
    description: "",
    pfpUrl: "",
    pfpFile: null as File | null,
  });
  const [isGeneralSaving, setIsGeneralSaving] = useState(false);

  // Get shop from Redux store (used as fallback)
  const shopFromRedux = useSelector((state: RootState) =>
    state.shops.items.find((s) => s.id === id)
  );

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        // Fetch products, categories, brands scoped to this shop
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          productsApi.getByShopId(id),
          categoriesApi.getByShopId(id),
          brandsApi.getByShopId(id),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setBrands(brandsRes.data);

        // Fetch news separately (requires auth, may fail)
        try {
          const newsRes = await newsApi.getAll(0, 100);
          setNews(newsRes.data.content || []);
        } catch (newsError) {
          console.warn("Failed to fetch news:", newsError);
          setNews([]);
        }

        // Fetch shop - try Redux first, then API
        if (shopFromRedux) {
          setShop(shopFromRedux);
          // Load design settings from shop
          if (shopFromRedux.theme) {
            try {
              const parsed = JSON.parse(shopFromRedux.theme);
              setDesignSettings(prev => ({ ...prev, ...parsed }));
            } catch {
              // designCode is not JSON, ignore
            }
          }
          // Load general settings from shop
          setGeneralSettings(prev => ({
            ...prev,
            shopName: shopFromRedux.name || "",
            description: shopFromRedux.description || "",
            pfpUrl: shopFromRedux.coverImage || "",
          }));
        } else {
          try {
            const shopRes = await shopsApi.getById(id);
            const shopDisplay = toShopDisplay(shopRes.data);
            setShop(shopDisplay);
            // Load design settings from shop
            if (shopDisplay.theme) {
              try {
                const parsed = JSON.parse(shopDisplay.theme);
                setDesignSettings(prev => ({ ...prev, ...parsed }));
              } catch {
                // designCode is not JSON, ignore
              }
            }
            // Load general settings from shop
            setGeneralSettings(prev => ({
              ...prev,
              shopName: shopDisplay.name || "",
              description: shopDisplay.description || "",
              pfpUrl: shopDisplay.coverImage || "",
            }));
          } catch {
            console.error("Shop not found");
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, shopFromRedux]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex items-center justify-center text-sm">
        <div className="text-center">
          <p className="mb-4">Магазин не найден</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async () => {
    if (!form.name.trim() || !form.price.trim() || !id) return;

    setIsSaving(true);
    try {
      // Upload image if provided
      let imageUrls: string[] = [];
      if (form.imageFile) {
        try {
          const uploadRes = await filesApi.uploadToCategory(form.imageFile, "PRODUCT_IMAGE");
          imageUrls = [uploadRes.data.fileUrl];
        } catch (err) {
          console.warn("Failed to upload image:", err);
        }
      }

      // Create product via API
      const productData = {
        shopId: id,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        categoryId: form.categoryId || undefined,
        brandId: form.brandId || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        isActive: true,
      };

      const response = await productsApi.create(productData);
      setProducts((prev) => [...prev, response.data]);
      setIsModalOpen(false);
      setForm({
        image: "",
        imageFile: null,
        name: "",
        categoryId: "",
        brandId: "",
        price: "",
        description: "",
      });
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Не удалось создать товар");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productsApi.delete(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !id) return;
    setIsSaving(true);
    try {
      const payload: { title: string; shopId: string; parentId?: string } = { 
        title: newCategoryName.trim(),
        shopId: id,
      };
      if (newCategoryParentId) {
        payload.parentId = newCategoryParentId;
      }
      const response = await categoriesApi.create(payload);
      setCategories((prev) => [...prev, response.data]);
      setNewCategoryName("");
      setNewCategoryParentId("");
    } catch (error) {
      console.error("Failed to create category:", error);
      alert("Не удалось создать категорию");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await categoriesApi.delete(categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim() || !id) return;
    setIsSaving(true);
    try {
      const response = await brandsApi.create({ name: newBrandName.trim(), shopId: id });
      setBrands((prev) => [...prev, response.data]);
      setNewBrandName("");
    } catch (error) {
      console.error("Failed to create brand:", error);
      alert("Не удалось создать бренд");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    try {
      await brandsApi.delete(brandId);
      setBrands((prev) => prev.filter((b) => b.id !== brandId));
    } catch (error) {
      console.error("Failed to delete brand:", error);
    }
  };

  const handleNewsImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewsForm((prev) => ({ ...prev, previewImageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewsForm((prev) => ({ ...prev, previewImageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNews = async () => {
    if (!newsForm.title.trim() || !newsForm.content.trim()) return;
    setIsSaving(true);
    try {
      let previewImageUrl: string | undefined;
      if (newsForm.previewImageFile) {
        try {
          const uploadRes = await filesApi.uploadToCategory(newsForm.previewImageFile, "NEWS_IMAGE");
          previewImageUrl = uploadRes.data.fileUrl;
        } catch (err) {
          console.warn("Failed to upload news image:", err);
        }
      }

      const payload = {
        title: newsForm.title.trim(),
        content: newsForm.content.trim(),
        previewImageUrl,
        isPublished: newsForm.isPublished,
      };

      const response = await newsApi.create(payload);
      setNews((prev) => [response.data, ...prev]);
      setIsNewsModalOpen(false);
      setNewsForm({
        title: "",
        content: "",
        previewImageUrl: "",
        previewImageFile: null,
        isPublished: true,
      });
    } catch (error) {
      console.error("Failed to create news:", error);
      alert("Не удалось создать новость");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    try {
      await newsApi.delete(newsId);
      setNews((prev) => prev.filter((n) => n.id !== newsId));
    } catch (error) {
      console.error("Failed to delete news:", error);
    }
  };

  const handleSaveDesign = async () => {
    if (!id) return;
    setIsDesignSaving(true);
    try {
      const designCode = JSON.stringify(designSettings);
      await shopsApi.update(id, { designCode });
      alert("Дизайн сохранен!");
    } catch (error) {
      console.error("Failed to save design:", error);
      alert("Не удалось сохранить дизайн");
    } finally {
      setIsDesignSaving(false);
    }
  };

  const handleResetDesign = () => {
    setDesignSettings({
      primaryColor: "#06b6d4",
      secondaryColor: "#8b5cf6",
      backgroundColor: "#0a0f1a",
      textColor: "#ffffff",
      accentColor: "#f59e0b",
      fontFamily: "Inter",
      borderRadius: "12",
      cardStyle: "modern",
    });
  };

  const handleGeneralAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGeneralSettings((prev) => ({ ...prev, pfpFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setGeneralSettings((prev) => ({ ...prev, pfpUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGeneral = async () => {
    if (!id) return;
    setIsGeneralSaving(true);
    try {
      let pfpUrl = generalSettings.pfpUrl;
      
      // Upload new avatar if file selected
      if (generalSettings.pfpFile) {
        try {
          const uploadRes = await filesApi.uploadToCategory(generalSettings.pfpFile, "SHOP_AVATAR");
          pfpUrl = uploadRes.data.fileUrl;
        } catch (err) {
          console.warn("Failed to upload avatar:", err);
        }
      }

      await shopsApi.update(id, {
        shopName: generalSettings.shopName,
        description: generalSettings.description,
        pfpUrl: pfpUrl,
      });

      // Update local shop state
      setShop(prev => prev ? {
        ...prev,
        name: generalSettings.shopName,
        description: generalSettings.description,
        coverImage: pfpUrl,
      } : null);

      alert("Настройки сохранены!");
    } catch (error) {
      console.error("Failed to save general settings:", error);
      alert("Не удалось сохранить настройки");
    } finally {
      setIsGeneralSaving(false);
    }
  };

  const handleDeleteShop = async () => {
    if (!id) return;
    const confirmed = window.confirm("Вы уверены, что хотите удалить магазин? Это действие нельзя отменить.");
    if (!confirmed) return;
    
    try {
      await shopsApi.delete(id);
      alert("Магазин удален");
      navigate("/profile");
    } catch (error) {
      console.error("Failed to delete shop:", error);
      alert("Не удалось удалить магазин");
    }
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
            {isLoading ? (
              <div className="col-span-full text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-500" />
              </div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className="group relative bg-[#111822] rounded-xl overflow-hidden shadow-md hover:shadow-cyan-500/20 transition-all"
                >
                  <div className="aspect-[3/4] bg-gray-800 relative overflow-hidden">
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      <img
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-2xl">
                        📦
                      </div>
                    )}
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-medium truncate leading-tight">{product.name}</h3>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                      {product.category?.title || "Без категории"}
                    </p>
                    <p className="text-sm font-bold mt-1.5">{product.price.toLocaleString()} ₽</p>
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

        {activeTab === "Категории" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Название категории"
                className="flex-1 px-4 py-3 bg-white/10 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              />
              <select
                value={newCategoryParentId}
                onChange={(e) => setNewCategoryParentId(e.target.value)}
                className="px-4 py-3 bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              >
                <option value="">Без родителя</option>
                {categories.filter(c => !c.parentId).map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim() || isSaving}
                className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categories.map((category) => {
                const parentCategory = category.parentId 
                  ? categories.find(c => c.id === category.parentId) 
                  : null;
                return (
                  <div
                    key={category.id}
                    className="group bg-[#111822] rounded-xl p-4 flex items-center justify-between hover:bg-[#1a2332] transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Tag className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm font-medium block truncate">{category.title}</span>
                        {parentCategory && (
                          <span className="text-[10px] text-gray-500 block truncate">
                            в {parentCategory.title}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="opacity-0 group-hover:opacity-100 transition p-1.5 hover:bg-red-500/20 rounded-lg flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                );
              })}
              {categories.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <p className="text-sm">Категорий пока нет</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "Бренды" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Название бренда"
                className="flex-1 px-4 py-3 bg-white/10 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              />
              <button
                onClick={handleAddBrand}
                disabled={!newBrandName.trim() || isSaving}
                className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="group bg-[#111822] rounded-xl p-4 flex items-center justify-between hover:bg-[#1a2332] transition"
                >
                  <div className="flex items-center gap-3">
                    <Package2 className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium">{brand.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="opacity-0 group-hover:opacity-100 transition p-1.5 hover:bg-red-500/20 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              ))}
              {brands.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <p className="text-sm">Брендов пока нет</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "Новости" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setIsNewsModalOpen(true)}
                className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Добавить новость
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="group bg-[#111822] rounded-xl overflow-hidden hover:bg-[#1a2332] transition"
                >
                  {item.previewImageUrl ? (
                    <img
                      src={item.previewImageUrl}
                      alt={item.title}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <Newspaper className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium truncate">{item.title}</h3>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {new Date(item.createdAt).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteNews(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition p-1.5 hover:bg-red-500/20 rounded-lg flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        item.isPublished 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {item.isPublished ? "Опубликовано" : "Черновик"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {news.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Новостей пока нет</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "Дизайн" && (
          <div className="space-y-6">
            {/* Preview Card */}
            <div 
              className="rounded-2xl p-6 border border-white/10"
              style={{ 
                backgroundColor: designSettings.backgroundColor,
                borderRadius: `${designSettings.borderRadius}px`
              }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: designSettings.textColor }}>
                Предпросмотр дизайна
              </h3>
              <div className="flex gap-4">
                <div 
                  className="w-24 h-24 rounded-xl flex items-center justify-center"
                  style={{ 
                    backgroundColor: designSettings.primaryColor,
                    borderRadius: `${designSettings.borderRadius}px`
                  }}
                >
                  <span className="text-white text-xs">Primary</span>
                </div>
                <div 
                  className="w-24 h-24 rounded-xl flex items-center justify-center"
                  style={{ 
                    backgroundColor: designSettings.secondaryColor,
                    borderRadius: `${designSettings.borderRadius}px`
                  }}
                >
                  <span className="text-white text-xs">Secondary</span>
                </div>
                <div 
                  className="w-24 h-24 rounded-xl flex items-center justify-center"
                  style={{ 
                    backgroundColor: designSettings.accentColor,
                    borderRadius: `${designSettings.borderRadius}px`
                  }}
                >
                  <span className="text-white text-xs">Accent</span>
                </div>
              </div>
            </div>

            {/* Color Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-[#111822] rounded-xl p-4">
                <label className="block text-sm font-medium mb-2">Основной цвет</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={designSettings.primaryColor}
                    onChange={(e) => setDesignSettings({ ...designSettings, primaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={designSettings.primaryColor}
                    onChange={(e) => setDesignSettings({ ...designSettings, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="bg-[#111822] rounded-xl p-4">
                <label className="block text-sm font-medium mb-2">Дополнительный цвет</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={designSettings.secondaryColor}
                    onChange={(e) => setDesignSettings({ ...designSettings, secondaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={designSettings.secondaryColor}
                    onChange={(e) => setDesignSettings({ ...designSettings, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="bg-[#111822] rounded-xl p-4">
                <label className="block text-sm font-medium mb-2">Акцентный цвет</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={designSettings.accentColor}
                    onChange={(e) => setDesignSettings({ ...designSettings, accentColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={designSettings.accentColor}
                    onChange={(e) => setDesignSettings({ ...designSettings, accentColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="bg-[#111822] rounded-xl p-4">
                <label className="block text-sm font-medium mb-2">Цвет фона</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={designSettings.backgroundColor}
                    onChange={(e) => setDesignSettings({ ...designSettings, backgroundColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={designSettings.backgroundColor}
                    onChange={(e) => setDesignSettings({ ...designSettings, backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="bg-[#111822] rounded-xl p-4">
                <label className="block text-sm font-medium mb-2">Цвет текста</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={designSettings.textColor}
                    onChange={(e) => setDesignSettings({ ...designSettings, textColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={designSettings.textColor}
                    onChange={(e) => setDesignSettings({ ...designSettings, textColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="bg-[#111822] rounded-xl p-4">
                <label className="block text-sm font-medium mb-2">Скругление углов</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={designSettings.borderRadius}
                    onChange={(e) => setDesignSettings({ ...designSettings, borderRadius: e.target.value })}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right">{designSettings.borderRadius}px</span>
                </div>
              </div>
            </div>

            {/* Font & Style Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#111822] rounded-xl p-4">
                <label className="block text-sm font-medium mb-2">Шрифт</label>
                <select
                  value={designSettings.fontFamily}
                  onChange={(e) => setDesignSettings({ ...designSettings, fontFamily: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Raleway">Raleway</option>
                </select>
              </div>

              <div className="bg-[#111822] rounded-xl p-4">
                <label className="block text-sm font-medium mb-2">Стиль карточек</label>
                <select
                  value={designSettings.cardStyle}
                  onChange={(e) => setDesignSettings({ ...designSettings, cardStyle: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                >
                  <option value="modern">Современный</option>
                  <option value="minimal">Минималистичный</option>
                  <option value="classic">Классический</option>
                  <option value="bold">Яркий</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleResetDesign}
                className="px-6 py-3 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition"
              >
                Сбросить
              </button>
              <button
                onClick={handleSaveDesign}
                disabled={isDesignSaving}
                className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isDesignSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Сохранить дизайн
              </button>
            </div>
          </div>
        )}

        {activeTab === "Общие" && (
          <div className="space-y-6">
            {/* Shop Avatar */}
            <div className="bg-[#111822] rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Аватар магазина</h3>
              <div className="flex items-center gap-6">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleGeneralAvatar} className="hidden" />
                  {generalSettings.pfpUrl ? (
                    <img 
                      src={generalSettings.pfpUrl} 
                      alt="Shop avatar" 
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-white/10 hover:border-cyan-400/50 transition"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center border-2 border-dashed border-white/20 hover:border-cyan-400/50 transition">
                      <Upload className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                </label>
                <div>
                  <p className="text-sm text-gray-400">Нажмите на изображение, чтобы изменить</p>
                  <p className="text-xs text-gray-500 mt-1">Рекомендуемый размер: 200x200px</p>
                </div>
              </div>
            </div>

            {/* Shop Info */}
            <div className="bg-[#111822] rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold mb-4">Информация о магазине</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Название магазина</label>
                <input
                  type="text"
                  value={generalSettings.shopName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, shopName: e.target.value })}
                  placeholder="Введите название магазина"
                  className="w-full px-4 py-3 bg-white/10 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <textarea
                  value={generalSettings.description}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, description: e.target.value })}
                  placeholder="Расскажите о вашем магазине"
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL магазина</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">marketplace.com/</span>
                  <input
                    type="text"
                    value={shop?.domain || ""}
                    disabled
                    className="flex-1 px-4 py-3 bg-white/5 rounded-xl text-gray-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">URL магазина нельзя изменить после создания</p>
              </div>
            </div>

            {/* Shop Stats */}
            <div className="bg-[#111822] rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Статистика</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-cyan-400">{products.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Товаров</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-purple-400">{categories.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Категорий</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-400">{brands.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Брендов</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">{news.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Новостей</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleDeleteShop}
                className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition"
              >
                Удалить магазин
              </button>
              <button
                onClick={handleSaveGeneral}
                disabled={isGeneralSaving || !generalSettings.shopName.trim()}
                className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isGeneralSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Сохранить настройки
              </button>
            </div>
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
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="px-4 py-3 bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                <select
                  value={form.brandId}
                  onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                  className="px-4 py-3 bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                >
                  <option value="">Выберите бренд</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, "") })}
                  placeholder="Цена (₽)"
                  className="px-4 py-3 bg-white/10 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                />
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
                disabled={isSaving}
                className="px-7 py-2.5 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* News Modal */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1621] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-white/10">
              <h3 className="text-lg font-bold">Новая новость</h3>
              <button onClick={() => setIsNewsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              <label className="block cursor-pointer">
                <input type="file" accept="image/*" onChange={handleNewsImage} className="hidden" />
                {!newsForm.previewImageUrl ? (
                  <div className="border-2 border-dashed border-white/20 rounded-2xl h-40 flex flex-col items-center justify-center hover:border-white/40 bg-white/5">
                    <Upload className="w-9 h-9 mb-2 text-gray-500" />
                    <p className="text-xs text-gray-400">Добавить превью</p>
                  </div>
                ) : (
                  <img src={newsForm.previewImageUrl} alt="preview" className="w-full h-40 object-cover rounded-2xl" />
                )}
              </label>

              <input
                value={newsForm.title}
                onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                placeholder="Заголовок новости"
                className="w-full px-4 py-3 bg-white/10 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              />

              <textarea
                value={newsForm.content}
                onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                placeholder="Содержание новости"
                rows={6}
                className="w-full px-4 py-3 bg-white/10 rounded-xl placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              />

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newsForm.isPublished}
                  onChange={(e) => setNewsForm({ ...newsForm, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Опубликовать сразу</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-white/10">
              <button
                onClick={() => setIsNewsModalOpen(false)}
                className="px-5 py-2.5 text-gray-400 hover:text-white transition"
              >
                Отмена
              </button>
              <button
                onClick={handleAddNews}
                disabled={isSaving || !newsForm.title.trim() || !newsForm.content.trim()}
                className="px-7 py-2.5 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}