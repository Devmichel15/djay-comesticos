import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Key used in localStorage
const CART_KEY = "cart";
const PENDING_KEY = "pendingCheckout";

export const useCart = () => {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // use AuthContext directly and guard if provider is absent
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated || false;
  const user = authContext?.user || null;

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn("Could not persist cart to localStorage", e.message);
    }
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id || p.productId === product.id || p.id === product.productId);
      if (existing) {
        return prev.map((p) =>
          (p.id === existing.id || p.productId === existing.productId) ? { ...p, quantity: (p.quantity || 1) + quantity } : p
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((p) => p.id !== productId && p.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCart((prev) =>
      prev.map((p) => {
        if (p.id === productId || p.productId === productId) {
          return { ...p, quantity: quantity };
        }
        return p;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCart = () => cart;

  const getTotal = () => {
    return cart.reduce((sum, item) => {
      const price = Number(item.price) || Number(item.preco) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + price * qty;
    }, 0);
  };

  // checkout: if user is authenticated => return true so caller may continue (or handle redirection)
  // if not authenticated => set pending flag and return false to indicate caller should navigate to login
  const checkout = () => {
    if (!cart || cart.length === 0) {
      throw new Error("Carrinho vazio");
    }

    if (isAuthenticated && user) {
      // AuthContext will handle pendingCheckout if present; but here we can set the flag and let AuthContext post-login handle it
      localStorage.setItem(PENDING_KEY, "1");
      // AuthContext listens to login and will finalize
      return true;
    } else {
      // Mark pending and signal caller to navigate to login
      localStorage.setItem(PENDING_KEY, "1");
      return false;
    }
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getCart,
    getTotal,
    checkout,
  };
};
