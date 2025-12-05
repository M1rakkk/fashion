// src/pages/shops/create/components/ProgressHeader.tsx

import React from "react";

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)] px-10 py-6">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm text-[var(--muted-foreground)] mb-2">
          Шаг {currentStep} из {totalSteps} — Основная информация
        </p>
        <div className="w-full bg-[var(--border)] rounded-full h-2">
          <div
            className="bg-[var(--primary)] h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </header>
  );
};

export default ProgressHeader;