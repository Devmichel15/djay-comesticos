// ============================================================================
// Firebase Authentication - Non-Blocking Architecture
// ============================================================================
// REGRA: Auth primeiro, Firestore depois (sem bloquear)

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";
import { getOrCreateUser, saveUser } from "./firestore";

// Admin emails
const ADMIN_EMAILS = ["djaycosmeticos@gmail.com"];
const isAdmin = (email) => ADMIN_EMAILS.includes(email?.toLowerCase());

// ============================================================================
// SIGNUP - Non-Blocking
// ============================================================================
/**
 * FLUXO OBRIGATÓRIO:
 * 1. createUserWithEmailAndPassword → auth criado ✅
 * 2. updateProfile → displayName atualizado ✅
 * 3. saveUser → documento criado no Firestore ✅
 * 4. Retorna data imediatamente (Firestore synca em background)
 *
 * ⚠️ IMPORTANTE: Não aguardar saveUser em modo BLOCKING
 */
export const signup = async (email, password, displayName) => {
  // ✅ PASSO 1: Criar usuário no Firebase Auth
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  // ✅ PASSO 2: Atualizar profile no Auth
  await updateProfile(user, { displayName });

  // ✅ PASSO 3: Determinar role
  const role = isAdmin(email) ? "admin" : "user";

  // ✅ PASSO 4: Salvar no Firestore (NON-BLOCKING)
  // NÃO aguardar para não bloquear o signup
  saveUser(user.uid, {
    name: displayName,
    email,
    role,
    cart: [],
  }).catch((e) => {
    console.error("⚠️ Firestore save error (will retry):", e.message);
  });

  // ✅ PASSO 5: Retornar com dados básicos (Firestore vai sincronizar)
  return {
    uid: user.uid,
    email: user.email,
    displayName,
    role,
    cart: [],
  };
};

// ============================================================================
// LOGIN - Non-Blocking
// ============================================================================
/**
 * FLUXO:
 * 1. signInWithEmailAndPassword → autenticado ✅
 * 2. getOrCreateUser → obtém dados do Firestore (com cache) ✅
 * 3. Retorna user merged (Auth + Firestore)
 */
export const login = async (email, password) => {
  // ✅ PASSO 1: Autenticar
  const { user } = await signInWithEmailAndPassword(auth, email, password);

  // ✅ PASSO 2: Determinar role padrão
  const defaultRole = isAdmin(email) ? "admin" : "user";

  // ✅ PASSO 3: Obter ou criar documento do usuário
  // getOrCreateUser usa cache primeiro (rápido)
  const userData = await getOrCreateUser(
    user.uid,
    user.email,
    user.displayName,
    defaultRole,
  );

  // ✅ PASSO 4: Retornar merged data
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: userData?.role || defaultRole,
    cart: userData?.cart || [],
    name: userData?.name || user.displayName || "",
  };
};

// ============================================================================
// LOGOUT
// ============================================================================
export const logout = async () => {
  await signOut(auth);
};

// ============================================================================
// AUTH STATE OBSERVER - Non-Blocking
// ============================================================================
/**
 * Listen to auth state changes
 *
 * IMPORTANT: This callback should fire FAST
 * - First: Return basic auth data immediately
 * - Then: Firestore data loads in background via subscription
 */
export const onAuthStateChanged = (callback) => {
  return auth.onAuthStateChanged(async (user) => {
    if (!user) {
      callback(null);
      return;
    }

    // Determine default role
    const defaultRole = isAdmin(user.email) ? "admin" : "user";

    // Get user data from Firestore (uses cache, non-blocking)
    try {
      const userData = await getOrCreateUser(
        user.uid,
        user.email,
        user.displayName,
        defaultRole,
      );

      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: userData?.role || defaultRole,
        cart: userData?.cart || [],
        name: userData?.name || user.displayName || "",
      });
    } catch (error) {
      // On error, still return basic user data

      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: defaultRole,
        cart: [],
        name: user.displayName || "",
      });
    }
  });
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================
export function getAuthError(code) {
  const errors = {
    "auth/email-already-in-use": "Este email já está registrado",
    "auth/weak-password": "A senha deve ter pelo menos 6 caracteres",
    "auth/invalid-email": "Email inválido",
    "auth/user-not-found": "Usuário não encontrado",
    "auth/wrong-password": "Email ou senha incorretos",
    "auth/invalid-credential": "Email ou senha incorretos",
    "auth/too-many-requests": "Muitas tentativas. Aguarde.",
    "auth/network-request-failed": "Sem conexão com a internet",
  };
  return errors[code] || "Erro de autenticação";
}
