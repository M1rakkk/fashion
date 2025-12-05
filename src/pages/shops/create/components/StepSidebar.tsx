// src/pages/shops/create/components/StepSidebar.tsx

import React from "react";

const steps = [
  { number: 1, title: "Инфо", subtitle: "Основная информация" },
  { number: 2, title: "Дизайн", subtitle: "Внешний вид" },
  { number: 3, title: "Категории", subtitle: "Структура каталога" },
  { number: 4, title: "Бренды", subtitle: "Производители" },
  { number: 5, title: "Товары", subtitle: "Наполнение" },
  { number: 6, title: "Новости", subtitle: "Блог и акции" },
  { number: 7, title: "Готово", subtitle: "Запуск" },
];

interface StepSidebarProps {
  currentStep: number;
}

const StepSidebar: React.FC<StepSidebarProps> = ({ currentStep }) => {
  return (
    <aside className="w-80 bg-[var(--card)] border-r border-[var(--border)] p-8 hidden lg:block">
      <h2 className="text-xl font-bold mb-10">FashionConstruct</h2>

      <nav className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`flex items-center gap-4 p-4 rounded-lg transition-all cursor-pointer ${
              currentStep === step.number
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold"
                : currentStep > step.number
                ? "text-[var(--foreground)] opacity-70"
                : "text-[var(--muted-foreground)]"
            }`}
          >
            {/* Круг с номером */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                currentStep >= step.number
                  ? "bg-white text-[var(--primary)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              }`}
            >
              {step.number}
            </div>

            {/* Текст */}
            <div>
              <p className="font-medium">{step.title}</p>
              <p className="text-sm opacity-70">{step.subtitle}</p>
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default StepSidebar;