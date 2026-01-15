// src/utils/notifications.ts

import { AppDispatch } from "../app/store";
import { addNotification } from "../features/notifications/notificationsSlice";

export const showShopCreatedNotification = (dispatch: AppDispatch, shopName: string) => {
  dispatch(addNotification({
    title: 'Новый магазин',
    message: `Магазин "${shopName}" успешно создан`,
    type: 'success',
    icon: 'shopping-bag',
  }));
};

export const showProductAddedNotification = (dispatch: AppDispatch, productName: string, shopName: string) => {
  dispatch(addNotification({
    title: 'Товар в продаже',
    message: `Товар "${productName}" теперь в продаже в магазине "${shopName}"`,
    type: 'info',
    icon: 'package',
  }));
};

export const showLowStockNotification = (dispatch: AppDispatch, productName: string, quantity: number) => {
  dispatch(addNotification({
    title: 'Товары заканчиваются',
    message: `У товара "${productName}" осталось ${quantity} штук`,
    type: 'warning',
    icon: 'package',
  }));
};

export const showSalesGrowthNotification = (dispatch: AppDispatch, percentage: number) => {
  dispatch(addNotification({
    title: 'Рост продаж',
    message: `Продажи выросли на ${percentage}% за последнюю неделю`,
    type: 'info',
    icon: 'trending',
  }));
};
