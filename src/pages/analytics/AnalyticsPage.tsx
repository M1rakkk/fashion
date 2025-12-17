import React from "react";
import { BarChart2, PieChart, TrendingUp } from "lucide-react";

const AnalyticsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Аналитика</h1>
        <p className="text-sm text-gray-400 mt-2">Статистика по продажам, посетителям и товарам</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Карточка с плейсхолдером для графика */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-cyan-500" />
            <h3 className="font-semibold">Продажи за месяц</h3>
          </div>
          <div className="h-40 flex items-center justify-center text-gray-500">
            {/* Здесь можно добавить реальный график, напр. из recharts */}
            График продаж (заготовка)
          </div>
          <p className="text-sm text-gray-400 mt-4">Всего: 0 руб.</p>
        </div>

        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-cyan-500" />
            <h3 className="font-semibold">Распределение товаров</h3>
          </div>
          <div className="h-40 flex items-center justify-center text-gray-500">
            Круговая диаграмма (заготовка)
          </div>
          <p className="text-sm text-gray-400 mt-4">Категорий: 0</p>
        </div>

        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cyan-500" />
            <h3 className="font-semibold">Посетители</h3>
          </div>
          <div className="h-40 flex items-center justify-center text-gray-500">
            Тренд посетителей (заготовка)
          </div>
          <p className="text-sm text-gray-400 mt-4">Уникальных: 0</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Детальная статистика</h2>
        <p className="text-gray-400">Здесь будет таблица или дополнительные метрики (TODO: интегрировать с бэкендом).</p>
      </div>
    </div>
  );
};

export default AnalyticsPage;