import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CartItem } from "../types/Cart";

type AddToCartResult = {
  success: boolean;
  message: string;
};

type CartContextValue = {
  items: CartItem[];
  itemsCount: number;
  totalPrice: number;

  addItem: (item: CartItem) => AddToCartResult;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
};

const CART_STORAGE_KEY = "pandabook_cart";

const CartContext = createContext<CartContextValue | null>(null);

function loadCartFromStorage(): CartItem[] {
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);

  if (!savedCart) {
    return [];
  }

  try {
    return JSON.parse(savedCart) as CartItem[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const itemsCount = items.length;

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  function addItem(newItem: CartItem): AddToCartResult {
    const sameEditionItem = items.find((item) => item.id === newItem.id);

    if (sameEditionItem) {
      return {
        success: false,
        message: "Это издание уже находится в корзине.",
      };
    }

    setItems((currentItems) => [...currentItems, newItem]);

    return {
      success: true,
      message: "Товар добавлен в корзину.",
    };
  }

  function removeItem(itemId: string) {
    setItems((currentItems) => {
      return currentItems.filter((item) => item.id !== itemId);
    });
  }

  function clearCart() {
    setItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemsCount,
        totalPrice,
        addItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart должен использоваться внутри CartProvider");
  }

  return context;
}
