import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { CheckoutCartLine } from '../navigation/navigationTypes';

type AddCartItemInput = Omit<CheckoutCartLine, 'qty'> & { qty?: number };

type CartContextValue = {
  lines: CheckoutCartLine[];
  cartCount: number;
  addItem: (item: AddCartItemInput) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, delta: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CheckoutCartLine[]>([]);

  const addItem = useCallback((item: AddCartItemInput) => {
    setLines((prev) => {
      const existing = prev.find((x) => x.id === item.id);
      const qtyToAdd = Math.max(1, item.qty ?? 1);
      if (existing) {
        return prev.map((x) => (x.id === item.id ? { ...x, qty: x.qty + qtyToAdd } : x));
      }
      return [...prev, { ...item, qty: qtyToAdd }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setLines((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const setQty = useCallback((id: string, delta: number) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: Math.max(1, l.qty + delta) } : l))
    );
  }, []);

  const cartCount = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({ lines, cartCount, addItem, removeItem, setQty }),
    [lines, cartCount, addItem, removeItem, setQty]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
