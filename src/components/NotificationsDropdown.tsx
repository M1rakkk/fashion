// src/components/NotificationsDropdown.tsx

import React, { useState, useRef, useEffect } from "react";
import { Bell, X, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import { addNotification, markAsRead, markAllAsRead } from "../features/notifications/notificationsSlice";

const NotificationsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'package':
        return <Package className="w-4 h-4" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const getTypeStyles = (type: 'info' | 'success' | 'warning') => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 hover:bg-slate-800 rounded-xl transition-colors group"
      >
        <Bell className="w-5 h-5 text-slate-400 group-hover:text-slate-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Заголовок */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-white">Уведомления</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Отметить все как прочитанные
              </button>
            )}
          </div>

          {/* Список уведомлений */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Нет новых уведомлений</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-slate-750/50' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getTypeStyles(notification.type)}`}>
                      {getIcon(notification.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium truncate ${
                          !notification.read ? 'text-white' : 'text-slate-300'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-xs mb-2 line-clamp-2 ${
                        !notification.read ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Футер */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-700">
              <button className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Показать все уведомления
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
