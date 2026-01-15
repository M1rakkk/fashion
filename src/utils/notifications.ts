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

export const showOutOfStockNotification = (dispatch: AppDispatch, productName: string, shopName: string) => {
  dispatch(addNotification({
    title: 'Товары закончились',
    message: `Товар "${productName}" закончился в магазине "${shopName}"`,
    type: 'warning',
    icon: 'package',
  }));
};
