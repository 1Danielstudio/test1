import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { ProductVariant } from "@/services/printful";

export interface CartItem {
  id: string;
  productId: string;
  variantId: number;
  type: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  customization?: {
    position: { x: number; y: number };
    rotation: number;
    zoom: number;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id" | "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateCustomization: (
    id: string,
    customization: CartItem["customization"],
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  checkoutStatus: "idle" | "processing" | "success" | "error";
  setCheckoutStatus: (
    status: "idle" | "processing" | "success" | "error",
  ) => void;
  lastOrderId: string | null;
  setLastOrderId: (orderId: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const savedCart = localStorage.getItem("designcraft-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("designcraft-cart", JSON.stringify(items));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addItem = (item: Omit<CartItem, "id" | "quantity">) => {
    // Generate a unique ID
    const id = `${item.productId}-${item.variantId}-${Date.now()}`;

    // Check if item already exists with same product, variant and customization
    const existingItemIndex = items.findIndex(
      (i) =>
        i.productId === item.productId &&
        i.variantId === item.variantId &&
        JSON.stringify(i.customization) === JSON.stringify(item.customization),
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += 1;
      setItems(updatedItems);
    } else {
      // Add new item
      setItems([...items, { ...item, id, quantity: 1 }]);
    }

    // Open cart when adding items
    setIsCartOpen(true);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems(
      items.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const updateCustomization = (
    id: string,
    customization: CartItem["customization"],
  ) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, customization } : item)),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateCustomization,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        checkoutStatus,
        setCheckoutStatus,
        lastOrderId,
        setLastOrderId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
