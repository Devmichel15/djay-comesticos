import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import authService from "../appwrite/appwrite.auth";
import dataService from "../appwrite/appwrite.database";

// WhatsApp number
const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || "5511999999999";

// Context
export const AuthContext = createContext(null);

// ============================================================================
// AUTH PROVIDER - Appwrite Implementation
// ============================================================================
export function AuthProvider({ children }) {
  // Auth state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track if we've received first auth state
  const initialized = useRef(false);

  // ========================================================================
  // CHECK SESSION (runs once on mount)
  // ========================================================================
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          // Check if admin
          const isAdmin = await authService.isAdmin(currentUser);
          // Fetch detailed profile from database (if custom fields exist)
          // For now, allow mixing Auth user + flag
          setUser({ ...currentUser, role: isAdmin ? "admin" : "user" });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
        initialized.current = true;
      }
    };

    checkUser();
  }, []);

  // ========================================================================
  // SIGNUP HANDLER
  // ========================================================================
  const handleSignup = useCallback(async (email, password, displayName) => {
    setLoading(true);

    try {
      // 1. Create Login Account
      const userAccount = await authService.createAccount({
        email,
        password,
        name: displayName,
      });

      // 2. Auto Login after signup
      await authService.login({ email, password });

      // 3. Create User Profile in Database
      await dataService.createUserProfile({
        uid: userAccount.$id,
        email: userAccount.email,
        name: userAccount.name,
      });

      const sessionUser = await authService.getCurrentUser();
      const isAdmin = await authService.isAdmin(sessionUser);

      const fullUser = { ...sessionUser, role: isAdmin ? "admin" : "user" };
      setUser(fullUser);

      // Handle pending checkout (non-blocking)
      handlePendingCheckout(fullUser);

      return fullUser;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
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
      await authService.login({ email, password });
      const sessionUser = await authService.getCurrentUser();
      const isAdmin = await authService.isAdmin(sessionUser);

      const fullUser = { ...sessionUser, role: isAdmin ? "admin" : "user" };
      setUser(fullUser);

      // Handle pending checkout (non-blocking)
      handlePendingCheckout(fullUser);

      return fullUser;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
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
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
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

      if (pending && cart.length > 0 && userData?.$id) {
        // Save cart (non-blocking) - assuming Appwrite has updateUserCart
        // dataService.updateUserCart(userData.$id, cart).catch(() => {});

        // Build message
        const lines = [
          `Nome: ${userData.name || "-"}`,
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
