import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { onAuthStateChanged, signup, login, logout, getAuthError } from "../firebase/auth";
import { subscribeToUser, updateUserCart } from "../firebase/firestore";

// WhatsApp number
const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || "5511999999999";

// Context
export const AuthContext = createContext(null);

// ============================================================================
// AUTH PROVIDER - Clean Architecture
// ============================================================================
export function AuthProvider({ children }) {
  // Auth state (from Firebase Auth)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Track if we've received first auth state
  const initialized = useRef(false);
  
  // User data subscription cleanup
  const userUnsubscribe = useRef(null);

  // ========================================================================
  // AUTH STATE LISTENER (runs once on mount)
  // ========================================================================
  useEffect(() => {
    console.info("🔄 Auth listener setup");

    const unsubscribe = onAuthStateChanged((authUser) => {
      console.info("📡 Auth state:", authUser ? authUser.uid : "null");
      
      setUser(authUser);
      setLoading(false);
      initialized.current = true;
    });

    return () => {
      console.info("🔄 Auth listener cleanup");
      unsubscribe();
    };
  }, []);

  // ========================================================================
  // FIRESTORE USER SUBSCRIPTION (real-time sync, non-blocking)
  // ========================================================================
  useEffect(() => {
    // Cleanup previous subscription
    if (userUnsubscribe.current) {
      userUnsubscribe.current();
      userUnsubscribe.current = null;
    }

    if (!user?.uid) return;

    console.info("📡 User subscription:", user.uid);

    // Subscribe to user document changes
    userUnsubscribe.current = subscribeToUser(
      user.uid,
      (userData) => {
        if (userData) {
          // Merge Firestore data with Auth data
          setUser((prev) => ({
            ...prev,
            ...userData,
            uid: prev?.uid,
            email: prev?.email,
            displayName: prev?.displayName,
          }));
        }
      },
      (error) => {
        console.warn("User subscription error:", error.message);
      }
    );

    return () => {
      if (userUnsubscribe.current) {
        userUnsubscribe.current();
        userUnsubscribe.current = null;
      }
    };
  }, [user?.uid]);

  // ========================================================================
  // SIGNUP HANDLER
  // ========================================================================
  const handleSignup = useCallback(async (email, password, displayName) => {
    setLoading(true);
    
    try {
      const userData = await signup(email, password, displayName);
      setUser(userData);
      
      // Handle pending checkout (non-blocking)
      handlePendingCheckout(userData);
      
      return userData;
    } catch (error) {
      const message = getAuthError(error.code) || error.message;
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================================================
  // LOGIN HANDLER
  // ========================================================================
  const handleLogin = useCallback(async (email, password) => {
    setLoading(true);
    
    try {
      const userData = await login(email, password);
      setUser(userData);
      
      // Handle pending checkout (non-blocking)
      handlePendingCheckout(userData);
      
      return userData;
    } catch (error) {
      const message = getAuthError(error.code) || error.message;
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================================================
  // LOGOUT HANDLER
  // ========================================================================
  const handleLogout = useCallback(async () => {
    setLoading(true);
    
    try {
      await logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================================================
  // PENDING CHECKOUT (non-blocking)
  // ========================================================================
  const handlePendingCheckout = (userData) => {
    try {
      const pending = localStorage.getItem("pendingCheckout");
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      if (pending && cart.length > 0 && userData?.uid) {
        // Save cart (non-blocking)
        updateUserCart(userData.uid, cart).catch(() => {});

        // Build message
        const lines = [
          `Nome: ${userData.displayName || userData.name || "-"}`,
          `Email: ${userData.email}`,
          "",
          "Produtos:",
          ...cart.map((i) => `- ${i.name} x${i.quantity || 1} (${i.price})`),
          "",
          `Total: ${cart.reduce((t, i) => t + (Number(i.price) || 0) * (i.quantity || 1), 0)}`,
        ];

        // Redirect
        window.location.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
        localStorage.removeItem("pendingCheckout");
      }
    } catch (e) {
      console.warn("Checkout error:", e.message);
    }
  };

  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================
  const value = {
    // State
    user,
    loading,
    initialized: initialized.current,

    // Computed
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",

    // Actions
    signup: handleSignup,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// USE AUTH HOOK
// ============================================================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default AuthProvider;
