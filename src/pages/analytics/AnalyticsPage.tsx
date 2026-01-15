import React, { useMemo, useEffect, useState } from "react";
import { BarChart2, PieChart, TrendingUp, Users, Package, DollarSign } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../app/store";
import { Shop } from "../../features/shops/shopsSlice";
import { categoriesApi, productsApi } from "../../api/products.api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const AnalyticsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  // Get shops from API (items) and fallback to local storage (localItems) - как на дашборде
  const { items: apiShops, localItems } = useSelector((state: RootState) => state.shops);
  const products = useSelector((state: RootState) => state.products.items);
  
  // Combine API shops with local shops for backward compatibility - как на дашборде
  const shops = apiShops.length > 0 ? apiShops : localItems;
  
  // State для хранения категорий всех магазинов
  const [allCategories, setAllCategories] = useState<any[]>([]);
  // State для хранения товаров всех магазинов
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Загружаем категории и товары для каждого магазина
  useEffect(() => {
    const loadData = async () => {
      try {
        // Загружаем категории
        const categoriesPromises = shops.map(shop => 
          categoriesApi.getByShopId(shop.id).catch(() => ({ data: [] }))
        );
        const categoriesResponses = await Promise.all(categoriesPromises);
        
        const combinedCategories = categoriesResponses.reduce((acc: any[], response) => {
          return [...acc, ...response.data];
        }, []);
        
        // Загружаем товары
        const productsPromises = shops.map(shop => 
          productsApi.getByShopId(shop.id).catch(() => ({ data: [] }))
        );
        const productsResponses = await Promise.all(productsPromises);
        
        const combinedProducts = productsResponses.reduce((acc: any[], response) => {
          return [...acc, ...response.data];
        }, []);
        
        setAllCategories(combinedCategories);
        setAllProducts(combinedProducts);
      } catch (error) {
        console.error('Failed to load data:', error);
        setAllCategories([]);
        setAllProducts([]);
      }
    };

    if (shops.length > 0) {
      loadData();
    }
  }, [shops]);

  // Используем тот же подход что и на дашборде
  const stats = useMemo(() => {
    const totalProducts = shops.reduce((sum, shop) => {
      if ('products' in shop) {
        return sum + (shop as Shop).products.length;
      }
      return sum;
    }, 0) + products.length + allProducts.length;
    return {
      totalShops: shops.length,
      totalProducts,
      activeShops: shops.length,
    };
  }, [shops, products, allProducts]);

  // Данные для графиков на основе реальных магазинов
  const shopActivityData = useMemo(() => {
    return shops.slice(0, 7).map((shop) => {
      // Считаем товары для каждого магазина из API данных
      const shopProducts = allProducts.filter(product => product.shopId === shop.id);
      const localProducts = 'products' in shop ? (shop as Shop).products.length : 0;
      
      return {
        name: shop.name.length > 15 ? shop.name.substring(0, 15) + '...' : shop.name,
        products: shopProducts.length + localProducts,
      };
    });
  }, [shops, allProducts]);

  const categoryData = useMemo(() => {
    // Используем категории из всех магазинов
    if (allCategories.length > 0) {
      // Группируем категории по названию и считаем общее количество товаров
      const categoryMap = new Map<string, number>();
      
      allCategories.forEach(category => {
        const name = category.title || 'Без названия';
        const currentCount = categoryMap.get(name) || 0;
        categoryMap.set(name, currentCount + 1);
      });

      return Array.from(categoryMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'][index % 4]
      }));
    }

    // Если категорий из API нет, группируем товары из локальных магазинов
    const categoriesCount: { [key: string]: number } = {};
    
    shops.forEach(shop => {
      if ('products' in shop) {
        (shop as Shop).products.forEach((product: any) => {
          // Используем категории из магазина, если они есть
          if ('categories' in shop && (shop as Shop).categories.length > 0) {
            const category = (shop as Shop).categories[0]; // Берем первую категорию
            categoriesCount[category] = (categoriesCount[category] || 0) + 1;
          } else {
            // Если категорий нет, группируем по типам товаров
            const category = 'Одежда'; // Упрощенно
            categoriesCount[category] = (categoriesCount[category] || 0) + 1;
          }
        });
      }
    });

    // Если товаров нет, показываем базовые категории
    if (Object.keys(categoriesCount).length === 0) {
      return [
        { name: 'Одежда', value: 0, color: '#06b6d4' },
        { name: 'Обувь', value: 0, color: '#8b5cf6' },
        { name: 'Аксессуары', value: 0, color: '#f59e0b' },
      ];
    }

    return Object.entries(categoriesCount).map(([name, value], index) => ({
      name,
      value,
      color: ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'][index % 4]
    }));
  }, [shops, products, allCategories, allProducts]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Аналитика</h1>
        <p className="text-sm text-slate-400 mt-2">Статистика по магазинам и товарам</p>
      </div>

      {/* Реальные статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats.totalShops}</h3>
          <p className="text-sm text-slate-400">Всего магазинов</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats.totalProducts}</h3>
          <p className="text-sm text-slate-400">Всего товаров</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats.activeShops}</h3>
          <p className="text-sm text-slate-400">Активных магазинов</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {stats.totalShops > 0 ? Math.round(stats.totalProducts / stats.totalShops) : 0}
          </h3>
          <p className="text-sm text-slate-400">Среднее товаров на магазин</p>
        </div>
      </div>

      {/* Графики на основе реальных данных */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* График товаров по магазинам */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Товары по магазинам</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={shopActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Bar dataKey="products" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Распределение по категориям */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Распределение товаров</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Детальная статистика */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-6">Детальная статистика</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">Всего магазинов</h4>
            <p className="text-2xl font-bold text-white">{stats.totalShops}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">Активных магазинов</h4>
            <p className="text-2xl font-bold text-white">{stats.activeShops}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">Всего товаров</h4>
            <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">Среднее товаров на магазин</h4>
            <p className="text-2xl font-bold text-white">
              {stats.totalShops > 0 ? Math.round(stats.totalProducts / stats.totalShops) : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;