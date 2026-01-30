import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { updateUserCart, subscribeToUserCart } from "../firebase/firestore";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Local state
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // User context
  const { user } = useAuth();
  
  // Track subscription
  const unsubscribeCart = useRef(null);

  // =========================================================================
  // SUBSCRIBE TO FIRESTORE CART (Real-time sync)
  // =========================================================================
  useEffect(() => {
    // Cleanup previous subscription
    if (unsubscribeCart.current) {
      unsubscribeCart.current();
      unsubscribeCart.current = null;
    }

    // Only subscribe if user is logged in
    if (!user?.uid) {
      setCartItems([]);
      return;
    }

    console.info("📡 Setting up cart subscription:", user.uid);
    setIsLoading(true);

    // Subscribe to user's cart
    unsubscribeCart.current = subscribeToUserCart(
      user.uid,
      (cartData) => {
        if (cartData && Array.isArray(cartData)) {
          console.info("✅ Cart loaded from Firestore:", cartData.length, "items");
          setCartItems(cartData);
        } else {
          console.warn("⚠️ Cart is empty or invalid");
          setCartItems([]);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("❌ Cart subscription error:", error.message, error.code);
        setIsLoading(false);
      }
    );

    return () => {
      if (unsubscribeCart.current) {
        unsubscribeCart.current();
        unsubscribeCart.current = null;
      }
    };
  }, [user?.uid]);

  // =========================================================================
  // ADD TO CART (Update Firestore + Local)
  // =========================================================================
  const addToCart = useCallback(
    async (product, quantity = 1) => {
      // ✅ Check if user is logged in
      if (!user?.uid) {
        console.warn("⚠️ User not logged in. Cart saved locally only.");
        // Still save to local state for logged-out users
        setCartItems((prevItems) => {
          const existingItem = prevItems.find(
            (item) => item.nome === product.nome && item.categoria === product.categoria
          );

          if (existingItem) {
            return prevItems.map((item) =>
              item.nome === product.nome && item.categoria === product.categoria
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          }

          return [
            ...prevItems,
            {
              ...product,
              id: `${product.categoria}-${product.nome}`,
              quantity,
            },
          ];
        });
        return;
      }

      // ✅ For logged-in users, update Firestore
      try {
        setCartItems((prevItems) => {
          const existingItem = prevItems.find(
            (item) => item.nome === product.nome && item.categoria === product.categoria
          );

          let updatedItems;

          if (existingItem) {
            // Update quantity if product exists
            updatedItems = prevItems.map((item) =>
              item.nome === product.nome && item.categoria === product.categoria
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            // Add new product
            updatedItems = [
              ...prevItems,
              {
                ...product,
                id: `${product.categoria}-${product.nome}`,
                quantity,
              },
            ];
          }

          // ✅ Update Firestore (non-blocking)
          updateUserCart(user.uid, updatedItems).catch((error) => {
            console.error("⚠️ Failed to save cart to Firestore:", error.message);
          });

          return updatedItems;
        });

        console.info("✅ Product added to cart:", product.nome);
      } catch (error) {
        console.error("❌ addToCart error:", error.message);
      }
    },
    [user?.uid]
  );

  // =========================================================================
  // REMOVE FROM CART (Update Firestore + Local)
  // =========================================================================
  const removeFromCart = useCallback(
    async (productId) => {
      setCartItems((prevItems) => {
        const updatedItems = prevItems.filter((item) => item.id !== productId);

        // ✅ Update Firestore if user is logged in
        if (user?.uid) {
          updateUserCart(user.uid, updatedItems).catch((error) => {
            console.error("⚠️ Failed to remove from Firestore:", error.message);
          });
        }

        return updatedItems;
      });

      console.info("✅ Product removed from cart:", productId);
    },
    [user?.uid]
  );

  // =========================================================================
  // UPDATE QUANTITY (Update Firestore + Local)
  // =========================================================================
  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      setCartItems((prevItems) => {
        const updatedItems = prevItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        );

        // ✅ Update Firestore if user is logged in
        if (user?.uid) {
          updateUserCart(user.uid, updatedItems).catch((error) => {
            console.error("⚠️ Failed to update quantity in Firestore:", error.message);
          });
        }

        return updatedItems;
      });

      console.info("✅ Quantity updated:", productId, "qty:", quantity);
    },
    [user?.uid, removeFromCart]
  );

  // =========================================================================
  // CLEAR CART (Update Firestore + Local)
  // =========================================================================
  const clearCart = useCallback(async () => {
    setCartItems([]);

    // ✅ Clear Firestore if user is logged in
    if (user?.uid) {
      updateUserCart(user.uid, []).catch((error) => {
        console.error("⚠️ Failed to clear cart in Firestore:", error.message);
      });
    }

    console.info("✅ Cart cleared");
  }, [user?.uid]);

  // =========================================================================
  // CALCULATE TOTALS
  // =========================================================================
  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.preco.replace(/[^\d]/g, ""));
      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // =========================================================================
  // CONTEXT VALUE
  // =========================================================================
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isCartOpen,
    setIsCartOpen,
    isLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return context;
};
