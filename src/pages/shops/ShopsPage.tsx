import React from "react";
import { useNavigate } from "react-router-dom";

type Shop = {
  id: string | number;
  name: string;
  description?: string;
  url?: string;
  coverImage?: string;
  itemsCount?: number;
  ordersCount?: number;
  isActive?: boolean;
};

const ShopCard: React.FC<{ shop: Shop }> = ({ shop }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden group shadow-sm hover:shadow-md transition flex flex-col">
      {/* Cover image */}
      <div className="relative h-48 overflow-hidden">
        <img src={shop.coverImage} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {shop.isActive && (
          <div className="absolute top-3 left-3">
            <span className="text-xs bg-green-500 text-black font-bold px-2 py-1 rounded-full">Active</span>
          </div>
      )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-2">
          <h3 className="text-xl font-bold leading-tight">{shop.name}</h3>
          <p className="text-sm text-[var(--muted-foreground)]">{shop.url}</p>
        </div>

        <div className="text-[var(--muted-foreground)] text-sm mb-4 flex-1">
          {shop.description || "Описание отсутствует"}
        </div>

        <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between gap-4">
          <div className="text-sm text-[var(--muted-foreground)] flex gap-4">
            <div><span className="font-bold text-[var(--card-foreground)]">{shop.itemsCount}</span> товаров</div>
            <div><span className="font-bold text-[var(--card-foreground)]">{shop.ordersCount}</span> заказов</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/stores/${shop.id}`)}
              className="py-2 px-4 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold"
            >
              Управлять
            </button>

            <button
              type="button"
              onClick={() => navigate(`/stores/${shop.id}?tab=settings`)}
              className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)]"
              aria-label="Settings"
            >
              {/* settings icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="1.2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
