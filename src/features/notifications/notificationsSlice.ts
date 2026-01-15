// src/features/notifications/notificationsSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  time: string;
  read: boolean;
  icon?: string;
}

interface NotificationsState {
  notifications: Notification[];
}

const initialState: NotificationsState = {
  notifications: [
    {
      id: '1',
      title: 'Товары заканчиваются',
      message: 'У товара "Футболка Classic" осталось 5 штук',
      type: 'warning',
      time: '1 час назад',
      read: false,
    },
    {
      id: '2',
      title: 'Рост продаж',
      message: 'Продажи выросли на 24% за последнюю неделю',
      type: 'info',
      time: '3 часа назад',
      read: true,
    },
  ],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'time' | 'read'>>) => {
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        time: 'Только что',
        read: false,
      };
      state.notifications.unshift(newNotification);

      // Ограничиваем количество уведомлений до 20
      if (state.notifications.length > 20) {
        state.notifications = state.notifications.slice(0, 20);
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead, removeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
