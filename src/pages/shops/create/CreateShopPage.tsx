// src/pages/shops/create/CreateShopPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  ChevronRight,
  ChevronLeft,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  X,
  Upload,
  Check,
  Loader2,
} from "lucide-react";
import { AppDispatch } from "../../../app/store";
import { createShop } from "../../../features/shops/shopsThunks";
import { addShop } from "../../../features/shops/shopsSlice";
import { filesApi } from "../../../api/files.api";
import { showShopCreatedNotification } from "../../../utils/notifications";
import {
  brandsApi,
  categoriesApi,
  productsApi,
} from "../../../api/products.api";
import { sizesApi } from "../../../api/sizes.api";
import { productSizesApi } from "../../../api/product-sizes.api";
import { newsApi } from "../../../api/news.api";

const steps = [
  { number: 1, title: "Инфо", subtitle: "Основная информация" },
  { number: 2, title: "Дизайн", subtitle: "Внешний вид" },
  { number: 3, title: "Категории", subtitle: "Структура каталога" },
  { number: 4, title: "Бренды", subtitle: "Производители" },
  { number: 5, title: "Товары", subtitle: "Наполнение" },
  { number: 6, title: "Новости", subtitle: "Блог и акции" },
  { number: 7, title: "Готово", subtitle: "Публикация" },
];

const themes = [
  { name: "Классика Dark", bg: "bg-black", accent: "bg-white" },
  { name: "Минимализм", bg: "bg-white", accent: "bg-black" },
  { name: "Эко / Беж", bg: "bg-amber-900", accent: "bg-amber-100" },
  { name: "Океан", bg: "bg-blue-950", accent: "bg-cyan-400" },
  { name: "Лес", bg: "bg-green-950", accent: "bg-lime-400" },
  { name: "Неон", bg: "bg-purple-950", accent: "bg-pink-400" },
];

interface Product {
  id: string;
  image: string;
  imageFile?: File | null;
  name: string;
  price: string;
  categoryId?: string;
  brandName?: string;
  sizeQuantities?: Record<string, string>;
}
interface News {
  id: string;
  image: string;
  imageFile?: File | null;
  title: string;
  content?: string;
}

interface Category {
  id: string;
  name: string;
  children: Category[];
}

export default function CreateShopPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isCreating, setIsCreating] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  // Шаг 1 — Инфо
  const [shopName, setShopName] = useState("");
  const [shopDomain, setShopDomain] = useState("");
  const [coverImage, setCoverImage] = useState("");

  // Категории
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Верхняя одежда",
      children: [
        { id: "2", name: "Куртки", children: [] },
        { id: "3", name: "Пальто", children: [] },
      ],
    },
    { id: "4", name: "Джинсы и брюки", children: [] },
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [addingToParentId, setAddingToParentId] = useState<string | null>(null);

  // Бренды
  const [brands, setBrands] = useState<string[]>(["Nike", "Adidas"]);
  const [newBrand, setNewBrand] = useState("");
  const [editingBrandIndex, setEditingBrandIndex] = useState<number | null>(null);
  const [editBrandValue, setEditBrandValue] = useState("");

  // Товары
  const [products, setProducts] = useState<Product[]>([]);

  // Новости
  const [news, setNews] = useState<News[]>([]);

  // Модалки
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Формы
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    image: "",
    imageFile: null as File | null,
    categoryId: "",
    brandName: "",
    sizeQuantities: {
      S: "",
      M: "",
      L: "",
      XL: "",
    } as Record<string, string>,
  });
  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    image: "",
    imageFile: null as File | null,
  });

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  // === Вспомогательные функции ===
  const handleProductImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductForm((prev) => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () =>
        setProductForm((prev) => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleNewsImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewsForm((prev) => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () =>
        setNewsForm((prev) => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const flattenCategories = (nodes: Category[], depth = 0): Array<{ id: string; label: string }> => {
    return nodes.flatMap((node) => {
      const label = `${"-- ".repeat(depth)}${node.name}`;
      const children = node.children?.length ? flattenCategories(node.children, depth + 1) : [];
      return [{ id: node.id, label }, ...children];
    });
  };

  const persistCatalogToBackend = async (shopId: string) => {
    const idMap = new Map<string, string>();

    const createCategoryTree = async (nodes: Category[], parentId?: string) => {
      for (const node of nodes) {
        const created = await categoriesApi.create({
          title: node.name,
          shopId,
          parentId: parentId || undefined,
        });
        idMap.set(node.id, created.data.id);
        if (node.children && node.children.length > 0) {
          await createCategoryTree(node.children, created.data.id);
        }
      }
    };

    await createCategoryTree(categories);

    const createdBrands = new Map<string, string>();
    for (const brandName of brands) {
      const name = String(brandName || '').trim();
      if (!name) continue;
      const res = await brandsApi.create({ name, shopId });
      createdBrands.set(name.toLowerCase(), res.data.id);
    }

    const sizeIdByValue = new Map<string, string>();
    try {
      const sizeListRes = await sizesApi.getAll();
      for (const s of sizeListRes.data || []) {
        sizeIdByValue.set(String(s.value).toUpperCase(), s.id);
      }
    } catch {
      // ignore sizes fetch errors
    }

    for (const p of products) {
      const rawPrice = String(p.price || '').replace(/[^0-9]/g, '');
      const parsedPrice = rawPrice ? Number(rawPrice) : 0;
      let imageUrls: string[] | undefined;
      if (p.imageFile) {
        try {
          const uploadRes = await filesApi.uploadToCategory(p.imageFile, "PRODUCT_IMAGE");
          imageUrls = [uploadRes.data.fileUrl];
        } catch {
          // ignore image upload errors
        }
      }

      const categoryId = p.categoryId ? idMap.get(p.categoryId) : undefined;
      const brandId = p.brandName ? createdBrands.get(p.brandName.toLowerCase()) : undefined;

      const productRes = await productsApi.create({
        shopId,
        name: p.name || "Товар",
        description: '',
        price: parsedPrice,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        imageUrls,
        isActive: true,
      });

      const createdProductId = productRes.data.id;

      const sizeEntries = Object.entries(p.sizeQuantities || {})
        .map(([value, qtyStr]) => ({ value, qty: Number(qtyStr || 0) }))
        .filter(x => Number.isFinite(x.qty) && x.qty > 0);

      for (const entry of sizeEntries) {
        const sizeValue = String(entry.value).toUpperCase();
        let sizeId = sizeIdByValue.get(sizeValue);
        if (!sizeId) {
          const createdSize = await sizesApi.create({ value: sizeValue });
          sizeId = createdSize.data.id;
          sizeIdByValue.set(sizeValue, sizeId);
        }
        await productSizesApi.create({
          productId: createdProductId,
          sizeId,
          quantityAvailable: entry.qty,
        });
      }
    }

    for (const item of news) {
      const title = String(item.title || "").trim() || "Новость";
      const content = String(item.content || "").trim() || title;
      let previewImageUrl: string | undefined;
      if (item.imageFile) {
        try {
          const uploadRes = await filesApi.uploadToCategory(item.imageFile, "NEWS_IMAGE");
          previewImageUrl = uploadRes.data.fileUrl;
        } catch {
          // ignore upload errors
        }
      }
      try {
        await newsApi.create({
          title,
          content,
          previewImageUrl,
          isPublished: true,
        });
      } catch {
        // ignore per-item errors
      }
    }
  };

  // Store the actual file for upload
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleCoverImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addCategory = (parentId: string | null = null) => {
    if (newCategory.trim()) {
      const newCat: Category = { id: Date.now().toString(), name: newCategory.trim(), children: [] };
      if (!parentId) {
        setCategories([...categories, newCat]);
      } else {
        const updateTree = (cats: Category[]): Category[] => {
          return cats.map(cat => {
            if (cat.id === parentId) {
              return { ...cat, children: [...cat.children, newCat] };
            }
            return { ...cat, children: updateTree(cat.children) };
          });
        };
        setCategories(updateTree(categories));
      }
      setNewCategory("");
      setAddingToParentId(null);
    }
  };

  const removeCategory = (id: string, cats: Category[] = categories): Category[] => {
    return cats.filter(cat => {
      if (cat.id === id) return false;
      cat.children = removeCategory(id, cat.children);
      return true;
    });
  };

  const handleRemoveCategory = (id: string) => {
    setCategories(removeCategory(id));
  };

  const moveCategory = (id: string, dir: "up" | "down", parentCats: Category[] = categories) => {
    const index = parentCats.findIndex(cat => cat.id === id);
    if (index === -1) {
      // Search in children
      parentCats.forEach(cat => {
        moveCategory(id, dir, cat.children);
      });
      return;
    }
    const arr = [...parentCats];
    if (dir === "up" && index > 0) [arr[index], arr[index - 1]] = [arr[index - 1], arr[index]];
    if (dir === "down" && index < arr.length - 1) [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    if (parentCats === categories) {
      setCategories(arr);
    } else {
      // Update the tree
      setCategories([...categories]); // Trigger re-render
    }
  };

  const startAddChild = (id: string) => {
    setAddingToParentId(id);
  };

  const CategoryTree: React.FC<{ cats: Category[] }> = ({ cats }) => (
    <>
      {cats.map((cat, i) => (
        <div key={cat.id}>
          <div className="tree-item">
            <div className="flex items-center gap-5 flex-1">
              <GripVertical className="w-5 h-5 text-gray-500 cursor-grab opacity-0 group-hover:opacity-100 transition" />
              <span className="text-lg font-medium">{cat.name}</span>
            </div>
            <div className="tree-actions">
              <button onClick={() => moveCategory(cat.id, "up")} className="action-btn">
                <ChevronUp className="w-5 h-5 text-gray-400" />
              </button>
              <button onClick={() => moveCategory(cat.id, "down")} className="action-btn">
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
              <button onClick={() => startAddChild(cat.id)} className="action-btn">
                <Plus className="w-5 h-5 text-gray-400" />
              </button>
              <button onClick={() => handleRemoveCategory(cat.id)} className="action-btn">
                <Trash2 className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
          {cat.children.length > 0 && (
            <div className="tree-sub-list">
              <CategoryTree cats={cat.children} />
            </div>
          )}
        </div>
      ))}
    </>
  );

  const addBrand = () => {
    if (newBrand.trim()) {
      setBrands([...brands, newBrand.trim()]);
      setNewBrand("");
    }
  };
  const removeBrand = (i: number) => setBrands(brands.filter((_, idx) => idx !== i));
  const startEditBrand = (i: number) => {
    setEditingBrandIndex(i);
    setEditBrandValue(brands[i]);
  };
  const saveEditBrand = () => {
    if (editingBrandIndex !== null && editBrandValue.trim()) {
      const updated = [...brands];
      updated[editingBrandIndex] = editBrandValue.trim();
      setBrands(updated);
    }
    setEditingBrandIndex(null);
    setEditBrandValue("");
  };
  const moveBrand = (i: number, dir: "up" | "down") => {
    const arr = [...brands];
    if (dir === "up" && i > 0) [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
    if (dir === "down" && i < arr.length - 1) [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    setBrands(arr);
  };

  const addProduct = () => {
    if (productForm.name && productForm.price) {
      setProducts([
        ...products,
        {
          id: Date.now().toString(),
          name: productForm.name,
          price: productForm.price + " ₽",
          image: productForm.image,
          imageFile: productForm.imageFile,
          categoryId: productForm.categoryId || undefined,
          brandName: productForm.brandName || undefined,
          sizeQuantities: productForm.sizeQuantities,
        },
      ]);
      setIsProductModalOpen(false);
      setProductForm({
        name: "",
        price: "",
        image: "",
        imageFile: null,
        categoryId: "",
        brandName: "",
        sizeQuantities: {
          S: "",
          M: "",
          L: "",
          XL: "",
        },
      });
    }
  };

  const addNewsItem = () => {
    if (newsForm.title) {
      setNews([
        ...news,
        {
          id: Date.now().toString(),
          title: newsForm.title,
          content: newsForm.content,
          image: newsForm.image,
          imageFile: newsForm.imageFile,
        },
      ]);
      setIsNewsModalOpen(false);
      setNewsForm({ title: "", content: "", image: "", imageFile: null });
    }
  };

  const categoryOptions = flattenCategories(categories);

  return (
    <div className="min-h-screen flex bg-[#0a0a0f] text-white">
      {/* Левое меню */}
      <aside className="w-64 bg-[#0f0f17] p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">FashionConstruct</h1>

        <nav className="space-y-3 flex-1">
          {steps.map((step) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;

            return (
              <button
                key={step.number}
                onClick={() => setCurrentStep(step.number)}
                className={`w-full text-left rounded-2xl px-4 py-4 transition-all ${
                  isActive ? "bg-white text-black shadow-xl" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold ${
                      isActive
                        ? "bg-black text-white"
                        : isCompleted
                        ? "bg-cyan-500 text-white"
                        : "bg-white/10 text-gray-500"
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <div>
                    <div className={`font-semibold ${isActive ? "" : "opacity-80"}`}>
                      {step.title}
                    </div>
                    <div className="text-xs opacity-70">{step.subtitle}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Основная часть */}
      <div className="flex-1 flex flex-col relative">
        <header className="px-12 pt-10 pb-8">
          <h2 className="text-5xl font-bold mb-3">Конструктор магазина</h2>
          <p className="text-lg text-gray-400 mb-6">
            Шаг {currentStep} из {steps.length} — {steps[currentStep - 1].subtitle}
          </p>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <main className="flex-1 px-12 pb-32 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* ШАГ 1 — Инфо */}
            {currentStep === 1 && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-semibold mb-6">Название и адрес</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <input
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="Название магазина"
                      className="px-6 py-5 bg-white/10 rounded-2xl placeholder-gray-500 text-lg focus:outline-none focus:ring-4 focus:ring-cyan-400/30"
                    />
                    <div className="flex items-center gap-4">
                      <input
                        value={shopDomain}
                        onChange={(e) =>
                          setShopDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                        }
                        placeholder="адрес"
                        className="flex-1 px-6 py-5 bg-white/10 rounded-2xl placeholder-gray-500 text-lg focus:outline-none focus:ring-4 focus:ring-cyan-400/30"
                      />
                      <span className="text-lg text-gray-400">.fashionconstruct.ru</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-6">Описание</h3>
                  <textarea
                    rows={6}
                    placeholder="Расскажите о вашем магазине одежды"
                    className="w-full px-6 py-5 bg-white/10 rounded-2xl placeholder-gray-500 text-lg resize-none"
                  />
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-6">Обложка магазина</h3>
                  <label className="block cursor-pointer">
                    <input type="file" accept="image/png, image/jpeg, image/gif" onChange={handleCoverImage} className="hidden" />
                    <div className="border-2 border-dashed border-white/20 rounded-3xl h-64 flex items-center justify-center text-gray-400 overflow-hidden">
                      {!coverImage ? (
                        <>
                          <div className="text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl mb-4 mx-auto" />
                            <p>Загрузите файл или перетащите его сюда</p>
                            <p className="text-sm mt-2">PNG, JPG, GIF до 10MB</p>
                          </div>
                        </>
                      ) : (
                        <img src={coverImage} alt="Обложка магазина" className="w-full h-full object-cover" />
                      )}
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* ШАГ 2 — Дизайн */}
            {currentStep === 2 && (
              <div className="bg-white/5 rounded-3xl p-10">
                <h3 className="text-2xl font-semibold mb-4">Визуальный стиль</h3>
                <p className="text-gray-400 mb-10">
                  Выберите цветовую палитру для вашего будущего магазина.
                </p>
                <div className="grid grid-cols-3 gap-8">
                  {themes.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => setSelectedTheme(theme.name)}
                      className={`rounded-3xl overflow-hidden transition-all duration-300 ${
                        selectedTheme === theme.name
                          ? "ring-4 ring-cyan-400 ring-offset-4 ring-offset-[#0a0a0f] scale-105 shadow-2xl shadow-cyan-400/30"
                          : "hover:scale-105 hover:shadow-xl"
                      }`}
                    >
                      <div className={`h-40 ${theme.bg} flex items-center justify-center`}>
                        <span className="text-xs font-medium opacity-70">ФОН</span>
                      </div>
                      <div className={`h-24 ${theme.accent} flex items-center justify-center`}>
                        <span className="text-xs font-bold">АКЦЕНТ</span>
                      </div>
                      <div className="py-4 bg-white/10 text-center text-sm font-medium">
                        {theme.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ШАГ 3 — Категории */}
            {currentStep === 3 && (
              <div className="bg-white/5 rounded-3xl p-10">
                <h3 className="text-2xl font-semibold mb-8">Структура каталога</h3>

                <div className="flex items-center gap-4 mb-8">
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCategory(addingToParentId)}
                    placeholder={addingToParentId ? "Название новой подкатегории" : "Название новой категории"}
                    className="flex-1 px-6 py-5 bg-white/10 rounded-2xl placeholder-gray-500 text-lg focus:outline-none focus:ring-4 focus:ring-cyan-400/30"
                  />
                  <button
                    onClick={() => addCategory(addingToParentId)}
                    className="px-8 py-5 bg-white text-black rounded-2xl font-medium hover:bg-gray-200 transition shadow-lg"
                  >
                    Добавить
                  </button>
                </div>

                <div className="space-y-4">
                  <CategoryTree cats={categories} />
                </div>
              </div>
            )}

            {/* ШАГ 4 — Бренды */}
            {currentStep === 4 && (
              <div className="bg-white/5 rounded-3xl p-10">
                <h3 className="text-2xl font-semibold mb-8">Бренды и производители</h3>

                <div className="flex items-center gap-4 mb-8">
                  <input
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addBrand()}
                    placeholder="Название бренда"
                    className="flex-1 px-6 py-5 bg-white/10 rounded-2xl placeholder-gray-500 text-lg focus:outline-none focus:ring-4 focus:ring-cyan-400/30"
                  />
                  <button
                    onClick={addBrand}
                    className="px-8 py-5 bg-white text-black rounded-2xl font-medium hover:bg-gray-200 transition shadow-lg"
                  >
                    Добавить
                  </button>
                </div>

                <div className="space-y-4">
                  {brands.map((brand, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-6 py-5 bg-white/5 rounded-2xl hover:bg-white/10 transition group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {editingBrandIndex === i ? (
                          <input
                            value={editBrandValue}
                            onChange={(e) => setEditBrandValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveEditBrand()}
                            onBlur={saveEditBrand}
                            autoFocus
                            className="px-4 py-2 bg-white/20 rounded-lg text-lg flex-1"
                          />
                        ) : (
                          <span className="text-lg font-medium">{brand}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => moveBrand(i, "up")} className="p-2 hover:bg-white/10 rounded-lg">
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        </button>
                        <button onClick={() => moveBrand(i, "down")} className="p-2 hover:bg-white/10 rounded-lg">
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        </button>
                        <button onClick={() => startEditBrand(i)} className="p-2 hover:bg-white/10 rounded-lg">
                          <Edit2 className="w-5 h-5 text-gray-400" />
                        </button>
                        <button onClick={() => removeBrand(i)} className="p-2 hover:bg-red-500/20 rounded-lg">
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ШАГ 5 — Товары */}
            {currentStep === 5 && (
              <div className="py-10">
                <h3 className="text-3xl font-semibold mb-12 text-center">Наполнение товарами</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                  <button
                    onClick={() => setIsProductModalOpen(true)}
                    className="aspect-square border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center hover:border-white/40 transition group"
                  >
                    <Plus className="w-12 h-12 mb-4 group-hover:scale-110 transition" />
                    <span className="text-lg">Добавить товар</span>
                  </button>

                  {products.map((p) => (
                    <div key={p.id} className="relative group">
                      <div className="aspect-square bg-white/5 rounded-3xl overflow-hidden">
                        {p.image ? (
                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-6xl">T-shirt</div>
                        )}
                      </div>
                      <div className="mt-3 text-center">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-cyan-400">{p.price}</p>
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-start justify-end p-4 gap-2">
                        <button
                          onClick={() => setProducts(products.filter((x) => x.id !== p.id))}
                          className="p-2 bg-red-500/20 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ШАГ 6 — Новости */}
            {currentStep === 6 && (
              <div className="py-10">
                <h3 className="text-3xl font-semibold mb-12 text-center">Новости и блог</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <button
                    onClick={() => setIsNewsModalOpen(true)}
                    className="aspect-video border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center hover:border-white/40 transition group"
                  >
                    <Plus className="w-12 h-12 mb-4 group-hover:scale-110 transition" />
                    <span className="text-lg">Добавить новость</span>
                  </button>

                  {news.map((n) => (
                    <div key={n.id} className="relative group">
                      <div className="aspect-video bg-white/5 rounded-3xl overflow-hidden">
                        {n.image ? (
                          <img src={n.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="h-full flex items-center justify-center text-4xl">Newspaper</div>
                        )}
                      </div>
                      <p className="mt-4 text-lg font-medium">{n.title}</p>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => setNews(news.filter((x) => x.id !== n.id))}
                          className="p-2 bg-red-500/20 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ШАГ 7 — Готово */}
            {currentStep === 7 && (
              <div className="flex items-center justify-center min-h-full">
                <div className="bg-white/5 rounded-3xl p-12 text-center max-w-md">
                  <div className="w-24 h-24 mx-auto mb-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-12 h-12 text-cyan-400" />
                  </div>
                  <h3 className="text-4xl font-bold mb-4">Всё готово!</h3>
                  <p className="text-gray-400 mb-10">
                    Ваш магазин "{shopName || "Мой магазин"}" готов к публикации.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setCurrentStep(6)}
                      className="px-8 py-4 bg-white/10 rounded-full hover:bg-white/20 transition"
                    >
                      Назад
                    </button>
                    <button
                      onClick={() => setIsConfirmModalOpen(true)}
                      className="px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 shadow-xl"
                    >
                      Создать магазин
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Нижняя панель */}
        <div className="fixed bottom-0 left-64 right-0 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-md px-12 py-6 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ChevronLeft className="w-5 h-5" />
              Назад
            </button>
            <button onClick={() => navigate("/")} className="text-gray-400 hover:text-white transition">
              Отмена
            </button>
          </div>

          <button
            onClick={() => {
              if (currentStep === steps.length) setIsConfirmModalOpen(true);
              else setCurrentStep((s) => s + 1);
            }}
            className="flex items-center gap-3 px-10 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition shadow-2xl"
          >
            {currentStep === steps.length ? "Готово" : "Далее"}
            {currentStep < steps.length && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Модалка товара */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-[#0f0f17] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-8 border-b border-white/10 flex-shrink-0">
              <h3 className="text-2xl font-bold">Новый товар</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-8 overflow-y-auto flex-1">
              <label className="block">
                <input type="file" accept="image/*" onChange={handleProductImage} className="hidden" />
                {!productForm.image ? (
                  <div className="border-2 border-dashed border-white/20 rounded-3xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-white/40">
                    <Upload className="w-12 h-12 mb-4" />
                    <p>Добавить изображение</p>
                  </div>
                ) : (
                  <img src={productForm.image} alt="preview" className="w-full h-64 object-cover rounded-3xl" />
                )}
              </label>
              <input
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="Название товара"
                className="w-full px-6 py-5 bg-white/10 rounded-2xl"
              />
              <input
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value.replace(/\D/g, "") })}
                placeholder="Цена (₽)"
                className="w-full px-6 py-5 bg-white/10 rounded-2xl"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  className="w-full px-6 py-5 bg-white/10 rounded-2xl text-white"
                  style={{
                    color: 'white',
                  }}
                >
                  <option value="" style={{ background: '#0f0f17', color: 'white' }}>Без категории</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt.id} value={opt.id} style={{ background: '#0f0f17', color: 'white' }}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <select
                  value={productForm.brandName}
                  onChange={(e) => setProductForm({ ...productForm, brandName: e.target.value })}
                  className="w-full px-6 py-5 bg-white/10 rounded-2xl text-white"
                  style={{
                    color: 'white',
                  }}
                >
                  <option value="" style={{ background: '#0f0f17', color: 'white' }}>Без бренда</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand} style={{ background: '#0f0f17', color: 'white' }}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-3">Размеры и остатки</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["S", "M", "L", "XL"].map((size) => (
                    <div key={size} className="bg-white/5 rounded-xl px-4 py-3">
                      <div className="text-xs text-gray-400 mb-2">Размер {size}</div>
                      <input
                        type="text"
                        value={productForm.sizeQuantities[size] || ""}
                        onChange={(e) =>
                          setProductForm((prev) => ({
                            ...prev,
                            sizeQuantities: {
                              ...prev.sizeQuantities,
                              [size]: e.target.value.replace(/\D/g, ""),
                            },
                          }))
                        }
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white/10 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
            <div className="flex justify-end gap-4 p-8 border-t border-white/10 flex-shrink-0">
              <button onClick={() => setIsProductModalOpen(false)} className="px-8 py-4 text-gray-400 hover:text-white">
                Отмена
              </button>
              <button
                onClick={addProduct}
                className="px-10 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 shadow-xl"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка новости */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-[#0f0f17] rounded-3xl shadow-2xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-8 border-b border-white/10">
              <h3 className="text-2xl font-bold">Добавить новость</h3>
              <button onClick={() => setIsNewsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <label className="block">
                <input type="file" accept="image/*" onChange={handleNewsImage} className="hidden" />
                {!newsForm.image ? (
                  <div className="border-2 border-dashed border-white/20 rounded-3xl h-48 flex flex-col items-center justify-center cursor-pointer">
                    <Upload className="w-12 h-12 mb-4" />
                    <p>Обложка новости (16:9)</p>
                  </div>
                ) : (
                  <img src={newsForm.image} alt="preview" className="w-full h-48 object-cover rounded-3xl" />
                )}
              </label>
              <input
                value={newsForm.title}
                onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                placeholder="Заголовок новости"
                className="w-full px-6 py-5 bg-white/10 rounded-2xl"
              />
              <textarea
                value={newsForm.content}
                onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                placeholder="Текст новости"
                className="w-full px-6 py-5 bg-white/10 rounded-2xl min-h-[140px]"
              />
            </div>
            <div className="flex justify-end gap-4 p-8 border-t border-white/10">
              <button onClick={() => setIsNewsModalOpen(false)} className="px-8 py-4 text-gray-400 hover:text-white">
                Отмена
              </button>
              <button
                onClick={addNewsItem}
                className="px-10 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 shadow-xl"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Финальная модалка — создание магазина */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-[#0f0f17] rounded-3xl shadow-2xl p-12 text-center max-w-md">
            <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Check className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-3xl font-bold mb-4">Магазин создан!</h3>
            <p className="text-gray-400 mb-10">
              {shopName || "Ваш магазин"} успешно опубликован!
            </p>
            <button
              disabled={isCreating}
              onClick={async () => {
                setIsCreating(true);
                try {
                  // Step 1: Upload cover image if provided
                  let uploadedImageUrl = "";
                  if (coverImageFile) {
                    try {
                      const uploadResponse = await filesApi.uploadToCategory(coverImageFile, "SHOP_AVATAR");
                      uploadedImageUrl = uploadResponse.data.fileUrl;
                      console.log("Cover image uploaded:", uploadedImageUrl);
                    } catch (uploadError) {
                      console.warn("Failed to upload cover image, continuing without it:", uploadError);
                    }
                  }

                  // Step 2: Create shop via API with the uploaded image URL
                  const result = await dispatch(createShop({
                    shopName: shopName || "Мой магазин",
                    shopUrl: shopDomain || "my-shop",
                    description: "",
                    designCode: selectedTheme || "Классика Dark",
                    pfpUrl: uploadedImageUrl || undefined,
                  }));

                  if (createShop.fulfilled.match(result)) {
                    const createdShopId = (result.payload as any)?.id;
                    showShopCreatedNotification(dispatch, shopName || "Мой магазин");
                    if (createdShopId) {
                      try {
                        await persistCatalogToBackend(createdShopId);
                      } catch (e) {
                        console.warn("Failed to persist catalog to backend:", e);
                      }
                      navigate(`/stores/${createdShopId}`);
                    } else {
                      navigate("/");
                    }
                  } else {
                    // Fallback to local storage if API fails
                    const newShop = {
                      id: Date.now().toString(),
                      name: shopName || "Мой магазин",
                      domain: shopDomain || "my-shop",
                      coverImage: uploadedImageUrl || coverImage || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200",
                      theme: selectedTheme || "Классика Dark",
                      categories: categories.map(c => c.name),
                      brands,
                      products,
                      news,
                      createdAt: Date.now(),
                    };
                    dispatch(addShop(newShop));
                    showShopCreatedNotification(dispatch, shopName || "Мой магазин");
                    navigate("/");
                  }
                } catch (error) {
                  console.error("Failed to create shop:", error);
                  // Fallback to local storage
                  const newShop = {
                    id: Date.now().toString(),
                    name: shopName || "Мой магазин",
                    domain: shopDomain || "my-shop",
                    coverImage: coverImage || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200",
                    theme: selectedTheme || "Классика Dark",
                    categories: categories.map(c => c.name),
                    brands,
                    products,
                    news,
                    createdAt: Date.now(),
                  };
                  dispatch(addShop(newShop));
                  showShopCreatedNotification(dispatch, shopName || "Мой магазин");
                  navigate("/");
                } finally {
                  setIsCreating(false);
                }
              }}
              className="px-10 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 shadow-xl disabled:opacity-50 flex items-center gap-2"
            >
              {isCreating && <Loader2 className="w-5 h-5 animate-spin" />}
              Перейти в личный кабинет
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
