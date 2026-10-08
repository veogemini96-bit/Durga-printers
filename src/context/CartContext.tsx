import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  cartKey: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  customization?: Record<string, string>;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'cartKey'>) => void;
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function makeCartKey(productId: string, customization?: Record<string, string>) {
  const custStr = customization && Object.keys(customization).length > 0
    ? JSON.stringify(customization)
    : '';
  return `${productId}${custStr ? `::${custStr}` : ''}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate old items that don't have cartKey
        const migrated = parsed.map((item: any) => ({
          ...item,
          cartKey: item.cartKey || makeCartKey(item.productId, item.customization),
        }));
        setItems(migrated);
      } catch {
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, 'cartKey'>) => {
    const cartKey = makeCartKey(item.productId, item.customization);
    setItems(prev => {
      const existing = prev.find(i => i.cartKey === cartKey);
      if (existing) {
        return prev.map(i =>
          i.cartKey === cartKey
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, { ...item, cartKey }];
    });
  };

  const removeFromCart = (cartKey: string) => {
    setItems(prev => prev.filter(i => i.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.cartKey === cartKey ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
