import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import dataService from "../appwrite/appwrite.database";

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
  // SUBSCRIBE TO APPWRITE CART (Real-time sync)
  // =========================================================================
  useEffect(() => {
    let cancelled = false;

    const userId = user?.$id || user?.uid;

    if (!userId) return;

    const setupSubscription = async () => {
      const unsubscribe = await dataService.subscribeToCartByUserId(
        userId,
        (cartData) => {
          if (cancelled) return;
          if (cartData && Array.isArray(cartData)) {
            setCartItems(cartData);
          } else {
            setCartItems([]);
          }
          setIsLoading(false);
        },
      );

      if (!cancelled) {
        if (unsubscribeCart.current) {
          unsubscribeCart.current();
        }
        unsubscribeCart.current = unsubscribe;
      }
    };

    setupSubscription();

    return () => {
      cancelled = true;
      if (unsubscribeCart.current) {
        unsubscribeCart.current();
        unsubscribeCart.current = null;
      }
    };
  }, [user]);

  // =========================================================================
  // ADD TO CART (Update Appwrite + Local)
  // =========================================================================
  const addToCart = useCallback(
    async (product, quantity = 1) => {
      const userId = user?.$id || user?.uid;

      // ✅ Check if user is logged in
      if (!userId) {
        // Still save to local state for logged-out users
        setCartItems((prevItems) => {
          const existingItem = prevItems.find(
            (item) =>
              item.nome === product.nome &&
              item.categoria === product.categoria,
          );

          if (existingItem) {
            return prevItems.map((item) =>
              item.nome === product.nome && item.categoria === product.categoria
                ? { ...item, quantity: item.quantity + quantity }
                : item,
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

      // ✅ For logged-in users, update Appwrite
      try {
        // We need to calculate the NEW cart state to send to server
        // We can't use setCartItems functional update directly to get the result for async call easily without refactoring.
        // So we will calculate it first.

        let newCartItems = [];
        setCartItems((prevItems) => {
          const existingItem = prevItems.find(
            (item) =>
              item.nome === product.nome &&
              item.categoria === product.categoria,
          );

          if (existingItem) {
            newCartItems = prevItems.map((item) =>
              item.nome === product.nome && item.categoria === product.categoria
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            );
          } else {
            newCartItems = [
              ...prevItems,
              {
                ...product,
                id: product.id || `${product.categoria}-${product.nome}`,
                quantity,
              },
            ];
          }
          return newCartItems;
        });

        // Update Server
        // We use the calculated newCartItems.
        // Note: set state is async, but the calculation inside the callback is synchronous for the return,
        // but we can't extract it easily unless we construct it outside.
        // Let's construct it from 'cartItems' (dependency) but `addToCart` might change it.
        // Better to calculate it based on current `cartItems` state since `addToCart` is in `useCallback` with `[cartItems]` dependency?
        // Actually original code had `[user?.uid]` dependency, not `cartItems`.
        // This implies it used the functional update to get latest state.
        // And then mistakenly used the result of that logic?
        // Original code:
        /*
          setCartItems((prevItems) => {
             // ... calc updatedItems
             updateUserCart(user.uid, updatedItems).catch(() => {});
             return updatedItems;
          });
        */
        // That works because `updateUserCart` is called INSIDE the setState callback!
        // That is a bit of a pattern anti-pattern (side effect in render/state reducer) but effective here.
        // I will replicate it.

        // However, I need to allow `user` to be null in dependency, but we checked it above.

        setCartItems((prevItems) => {
          const existingItem = prevItems.find(
            (item) =>
              item.nome === product.nome &&
              item.categoria === product.categoria,
          );

          let updatedItems;
          if (existingItem) {
            updatedItems = prevItems.map((item) =>
              item.nome === product.nome && item.categoria === product.categoria
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            );
          } else {
            updatedItems = [
              ...prevItems,
              {
                ...product,
                id: `${product.categoria}-${product.nome}`,
                quantity,
              },
            ];
          }

          // Side effect: update server
          dataService.updateUserCart(userId, updatedItems).catch(console.error);

          return updatedItems;
        });
      } catch {
        // Silently handle
      }
    },
    [user],
  );

  // =========================================================================
  // REMOVE FROM CART (Update Appwrite + Local)
  // =========================================================================
  const removeFromCart = useCallback(
    async (productId) => {
      const userId = user?.$id || user?.uid;

      setCartItems((prevItems) => {
        const updatedItems = prevItems.filter((item) => item.id !== productId);

        // ✅ Update Appwrite if user is logged in
        if (userId) {
          dataService.updateUserCart(userId, updatedItems).catch(console.error);
        }

        return updatedItems;
      });
    },
    [user],
  );

  // =========================================================================
  // UPDATE QUANTITY (Update Appwrite + Local)
  // =========================================================================
  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      const userId = user?.$id || user?.uid;

      setCartItems((prevItems) => {
        const updatedItems = prevItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item,
        );

        // ✅ Update Appwrite if user is logged in
        if (userId) {
          dataService.updateUserCart(userId, updatedItems).catch(console.error);
        }

        return updatedItems;
      });
    },
    [user, removeFromCart],
  );

  // =========================================================================
  // CLEAR CART (Update Appwrite + Local)
  // =========================================================================
  const clearCart = useCallback(async () => {
    setCartItems([]);
    const userId = user?.$id || user?.uid;

    // ✅ Clear Appwrite if user is logged in
    if (userId) {
      dataService.updateUserCart(userId, []).catch(console.error);
    }
  }, [user]);

  // =========================================================================
  // CALCULATE TOTALS
  // =========================================================================
  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => {
      // Clean price string if needed (e.g. "1.000 kz")
      // Assuming item.price is string or number.
      // Existing code: parseFloat(item.preco.replace(/[^\d]/g, ""));
      // Appwrite products might have separate price field or we map it.
      // We should check what `product` object looks like.
      // If we use `useAppwrite`, `fetchAllProducts` calls `dataService.getProducts()`.
      // `dataService.createProduct` saves `price` as number (from form).
      // So `item.price` (or `item.preco` if we kept property names) should be number.
      // But `AdminPanel` passes `price` (number).
      // `BestSellersSection` used `preco` (string).
      // We need to standardize.
      // If `cartItems` come from `addToCart`, it depends on what is passed to `addToCart`.
      // `BestSellersSection` calls `addToCart` with `product`.
      // I need to ensure `product` object passed to `addToCart` has standard fields.

      // Let's keep the existing logic compatible if possible.
      // If `item.price` is number, replace will fail.
      const val = item.price || item.preco || 0;
      let numericPrice = 0;
      if (typeof val === "number") {
        numericPrice = val;
      } else if (typeof val === "string") {
        numericPrice = parseFloat(val.replace(/[^\d]/g, "") || 0);
      }

      return total + numericPrice * (item.quantity || 1);
    }, 0);
  }, [cartItems]);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  }, [cartItems]);

  // =========================================================================
  // CONTEXT VALUE
  // =========================================================================
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity: (id) => {
      const item = cartItems.find((i) => i.id === id);
      if (item) updateQuantity(id, item.quantity + 1);
    },
    decreaseQuantity: (id) => {
      const item = cartItems.find((i) => i.id === id);
      if (item) updateQuantity(id, item.quantity - 1);
    },
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
