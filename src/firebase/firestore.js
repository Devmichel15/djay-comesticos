// ============================================================================
// Firestore Functions - OFFLINE-FIRST Architecture
// ============================================================================
// REGRA DE OURO: NUNCA bloquear UI esperando servidor

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

const USERS_COLLECTION = "users";
const PRODUCTS_COLLECTION = "produtos";

// ============================================================================
// USER: GET OR CREATE (Non-Blocking)
// ============================================================================
/**
 * Get or create user document - NEVER BLOCKS
 * 
 * Strategy:
 * 1. Try getDoc() - uses cache automatically, fetches from server if online
 * 2. If exists → return immediately
 * 3. If not exists → create with setDoc() (writes to cache, syncs later)
 * 4. ALWAYS returns user data, NEVER blocks
 * 
 * @param {string} uid - User ID from Firebase Auth
 * @param {string} email - User email
 * @param {string} displayName - User display name
 * @param {string} role - User role (default: "user")
 * @returns {Object} User data (from cache, server, or newly created)
 */
export const getOrCreateUser = async (uid, email, displayName = "", role = "user") => {
  if (!uid) {
    console.warn("⚠️ getOrCreateUser called without uid");
    return createFallbackUser(uid, email, displayName, role);
  }

  const userRef = doc(db, USERS_COLLECTION, uid);

  try {
    // Single getDoc() call - Firestore handles cache/server automatically
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      // Document exists - return data
      const data = snap.data();
      console.info("✅ User loaded:", uid, snap.metadata.fromCache ? "(cache)" : "(server)");
      return { id: snap.id, ...data };
    }

    // Document doesn't exist - create it
    console.info("📝 Creating user document:", uid);
    
    const newUser = {
      uid,
      email: email || "",
      name: displayName || "",
      role,
      cart: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // setDoc writes to cache immediately, syncs to server when online
    await setDoc(userRef, newUser);
    
    console.info("✅ User created:", uid);
    
    // Return with local timestamps (serverTimestamp resolves on sync)
    return {
      id: uid,
      ...newUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

  } catch (error) {
    // On ANY error, return fallback data so app doesn't break
    console.warn("⚠️ getOrCreateUser error:", error.message);
    return createFallbackUser(uid, email, displayName, role);
  }
};

/**
 * Create fallback user data (used when Firestore fails)
 */
function createFallbackUser(uid, email, displayName, role) {
  return {
    id: uid || "unknown",
    uid: uid || "unknown",
    email: email || "",
    name: displayName || "",
    role: role || "user",
    cart: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    _fallback: true,
  };
}

// ============================================================================
// USER: SAVE (Non-Blocking)
// ============================================================================
/**
 * Save user document - writes to cache, syncs when online
 * 
 * IMPORTANTE: Este método é chamado após createUserWithEmailAndPassword
 * Garante que:
 * 1. uid == auth.currentUser.uid (segurança de permissão)
 * 2. Dados são salvos com { merge: true } (não sobrescreve)
 * 3. Usa serverTimestamp() (sincroniza com servidor)
 * 
 * @param {string} uid - DEVE ser igual ao auth.currentUser.uid
 * @param {Object} userData - Dados do usuário
 * @returns {boolean} true se sucesso, false se erro
 */
export const saveUser = async (uid, userData) => {
  if (!uid) {
    console.warn("⚠️ saveUser called without uid");
    return false;
  }

  try {
    // ✅ Usar doc() com uid - isso garantir a regra de permissão
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    await setDoc(userRef, {
      uid,
      name: userData.name || "",
      email: userData.email || "",
      role: userData.role || "user",
      cart: userData.cart || [],
      createdAt: userData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    console.info("✅ User saved:", uid);
    return true;
  } catch (error) {
    console.error("❌ saveUser error:", error.message, error.code);
    return false;
  }
};

// ============================================================================
// USER: GET (Simple)
// ============================================================================
export const getUser = async (uid) => {
  if (!uid) return null;

  try {
    const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (error) {
    console.warn("⚠️ getUser error:", error.message);
    return null;
  }
};

// ============================================================================
// USER: UPDATE
// ============================================================================
export const updateUser = async (uid, data) => {
  if (!uid) return;
  
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// ============================================================================
// USER: REAL-TIME SUBSCRIPTION (Non-Blocking)
// ============================================================================
/**
 * Subscribe to user document changes - REAL-TIME LISTENER
 * 
 * IMPORTANTE:
 * 1. Requer permissão 'read' na rule do Firestore
 * 2. Listener dispara quando documento existe ou muda
 * 3. Returns unsubscribe function para cleanup
 * 
 * @param {string} uid - User ID (DEVE ser igual a auth.currentUser.uid)
 * @param {Function} onData - Callback quando dados chegam
 * @param {Function} onError - Callback em caso de erro
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUser = (uid, onData, onError = () => {}) => {
  if (!uid) {
    console.warn("⚠️ subscribeToUser called without uid");
    onData(null);
    return () => {};
  }

  console.info("📡 Setting up user subscription:", uid);

  return onSnapshot(
    doc(db, USERS_COLLECTION, uid),
    { includeMetadataChanges: false },
    (snap) => {
      if (snap.exists()) {
        console.info("✅ User data received:", uid, snap.data());
        onData({ id: snap.id, ...snap.data() });
      } else {
        console.warn("⚠️ User document does not exist:", uid);
        onData(null);
      }
    },
    (error) => {
      console.error("❌ User subscription error:", error.message, error.code);
      onError(error);
    }
  );
};

// ============================================================================
// PRODUCTS CRUD
// ============================================================================
export const saveProduct = async (product) => {
  if (!product.name || !product.price || !product.category || !product.imageUrl) {
    throw new Error("Campos obrigatórios: nome, preço, categoria e imagem");
  }

  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    name: product.name.trim(),
    price: product.price,
    category: product.category.trim(),
    description: product.description?.trim() || "",
    stock: product.stock || 0,
    imageUrl: product.imageUrl,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

export const getAllProducts = async () => {
  const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getProductsByCategory = async (category) => {
  const q = query(collection(db, PRODUCTS_COLLECTION), where("category", "==", category));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getProduct = async (productId) => {
  const snap = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));
  if (!snap.exists()) throw new Error("Produto não encontrado");
  return { id: snap.id, ...snap.data() };
};

export const updateProduct = async (productId, data) => {
  await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProduct = async (productId) => {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
};

export const searchProducts = async (term) => {
  const all = await getAllProducts();
  return all.filter((p) => p.name.toLowerCase().includes(term.toLowerCase()));
};

// ============================================================================
// PRODUCTS: GET IN STOCK
// ============================================================================
/**
 * Get all products that are in stock (stock > 0)
 * @returns {Promise<Array>} Array of products with stock
 */
export const getProductsInStock = async () => {
  try {
    const all = await getAllProducts();
    return all.filter((product) => product.stock > 0);
  } catch (error) {
    console.warn("⚠️ getProductsInStock error:", error.message);
    return [];
  }
};

// ============================================================================
// PRODUCTS: UPDATE IMAGE URL
// ============================================================================
/**
 * Update product image URL in Firestore
 * @param {string} productId - Product document ID
 * @param {string} imageUrl - New image URL from Firebase Storage
 */
export const updateProductImageURL = async (productId, imageUrl) => {
  if (!productId || !imageUrl) {
    throw new Error("productId e imageUrl são obrigatórios");
  }
  
  await updateProduct(productId, { imageUrl });
  console.info("✅ Product image URL updated:", productId);
};

// ============================================================================
// CART: UPDATE USER CART IN FIRESTORE
// ============================================================================
/**
 * Save/Update user's cart array in Firestore
 * 
 * IMPORTANTE:
 * - Sobrescreve o array inteiro do cart
 * - Usa { merge: true } para não deletar outros campos
 * - Atualiza timestamp automático
 * 
 * @param {string} uid - User ID
 * @param {Array} cartItems - Array de items no carrinho
 * @returns {Promise<void>}
 */
export const updateUserCart = async (uid, cartItems) => {
  if (!uid) {
    console.warn("⚠️ updateUserCart called without uid");
    return;
  }

  if (!Array.isArray(cartItems)) {
    console.warn("⚠️ updateUserCart cartItems must be an array");
    return;
  }

  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    await updateDoc(userRef, {
      cart: cartItems,
      updatedAt: serverTimestamp(),
    });

    console.info("✅ Cart updated in Firestore:", uid, cartItems.length, "items");
  } catch (error) {
    console.error("❌ updateUserCart error:", error.message, error.code);
    throw error;
  }
};

// ============================================================================
// CART: SUBSCRIBE TO USER CART (Real-time listener)
// ============================================================================
/**
 * Subscribe to user's cart changes in real-time
 * 
 * IMPORTANTE:
 * - Ouve mudanças ao vivo no array do cart
 * - Pode ser usado para sincronizar entre abas
 * - Retorna função para desinscrever
 * 
 * @param {string} uid - User ID
 * @param {Function} onData - Callback quando cart muda
 * @param {Function} onError - Callback em caso de erro
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUserCart = (uid, onData, onError = () => {}) => {
  if (!uid) {
    console.warn("⚠️ subscribeToUserCart called without uid");
    onData([]);
    return () => {};
  }

  console.info("📡 Setting up cart subscription:", uid);

  return onSnapshot(
    doc(db, USERS_COLLECTION, uid),
    { includeMetadataChanges: false },
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const cart = Array.isArray(data.cart) ? data.cart : [];
        console.info("✅ Cart data received:", uid, cart.length, "items");
        onData(cart);
      } else {
        console.warn("⚠️ User document does not exist:", uid);
        onData([]);
      }
    },
    (error) => {
      console.error("❌ Cart subscription error:", error.message, error.code);
      onError(error);
    }
  );
};
