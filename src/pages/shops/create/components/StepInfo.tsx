// src/pages/shops/create/components/StepInfo.tsx

import React from "react";
import { Upload } from "lucide-react";

interface StepInfoProps {
  formData: any;
  setFormData: (data: any) => void;
}

const StepInfo: React.FC<StepInfoProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-8">
      {/* Название и адрес */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Название и адрес</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Название магазина"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-5 py-4 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <div className="flex items-center bg-[var(--input)] border border-[var(--border)] rounded-xl overflow-hidden">
            <input
              type="text"
              placeholder="urban-threads"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              className="flex-1 px-5 py-4 bg-transparent outline-none"
            />
            <span className="px-5 text-[var(--muted-foreground)]">.fashionconstruct.ru</span>
          </div>
        </div>
      </div>

      {/* Описание */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Описание</h3>
        <textarea
          placeholder="Расскажите о вашем магазине одежды"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-5 py-4 bg-[var(--input)] border border-[var(--border)] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      {/* Обложка */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Обложка магазина</h3>
        <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-12 text-center hover:border-[var(--primary)] transition">
          <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <p className="text-[var(--muted-foreground)]">
            Загрузите файл или перетащите его сюда
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            PNG, JPG, GIF до 10MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepInfo;