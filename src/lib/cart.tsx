import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface ObraCarrinho {
  id: string;
  titulo: string;
  tecnica: string;
  dimensoes: string;
  preco: number;
  imagem_url: string;
}

interface CartContextType {
  items: ObraCarrinho[];
  addItem: (obra: ObraCarrinho) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "ana_alexandre_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ObraCarrinho[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (obra: ObraCarrinho) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === obra.id)) {
        return prev;
      }
      return [...prev, obra];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.length;
  const totalPrice = items.reduce((sum, item) => sum + item.preco, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
