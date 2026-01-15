// src/utils/stockMonitor.ts

import React from "react";
import { AppDispatch } from "../app/store";
import { showOutOfStockNotification } from "./notifications";

// Симуляция мониторинга остатков товаров (без бэкенда)
export class StockMonitor {
  private static instance: StockMonitor;
  private dispatch: AppDispatch;
  private intervals: Map<string, number> = new Map();
  private productStocks: Map<string, { quantity: number; shopName: string }> = new Map();

  private constructor(dispatch: AppDispatch) {
    this.dispatch = dispatch;
  }

  static getInstance(dispatch: AppDispatch): StockMonitor {
    if (!StockMonitor.instance) {
      StockMonitor.instance = new StockMonitor(dispatch);
    }
    return StockMonitor.instance;
  }

  // Регистрация товара для мониторинга
  trackProduct(productId: string, productName: string, shopName: string, initialQuantity: number = 10) {
    this.productStocks.set(productId, { quantity: initialQuantity, shopName });
    
    // Симулируем уменьшение остатка каждые 30 секунд
    const interval = window.setInterval(() => {
      this.decreaseStock(productId, productName);
    }, 30000); // 30 секунд
    
    this.intervals.set(productId, interval);
  }

  // Уменьшение остатка товара
  private decreaseStock(productId: string, productName: string) {
    const stock = this.productStocks.get(productId);
    if (!stock) return;

    stock.quantity -= Math.floor(Math.random() * 3) + 1; // Уменьшаем на 1-3 единицы

    if (stock.quantity <= 0) {
      // Товар закончился
      showOutOfStockNotification(this.dispatch, productName, stock.shopName);
      this.stopTracking(productId);
    }
  }

  // Прекращение отслеживания товара
  stopTracking(productId: string) {
    const interval = this.intervals.get(productId);
    if (interval) {
      window.clearInterval(interval);
      this.intervals.delete(productId);
    }
    this.productStocks.delete(productId);
  }

  // Очистка всех интервалов
  cleanup() {
    this.intervals.forEach(interval => window.clearInterval(interval));
    this.intervals.clear();
    this.productStocks.clear();
  }
}

// Хук для использования в компонентах
export const useStockMonitor = (dispatch: AppDispatch) => {
  const monitor = StockMonitor.getInstance(dispatch);
  
  // Очистка при размонтировании
  React.useEffect(() => {
    return () => {
      monitor.cleanup();
    };
  }, []);

  return monitor;
};
