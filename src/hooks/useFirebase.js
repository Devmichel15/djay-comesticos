// ============================================================================
// useFirebase Custom Hook
// ============================================================================
// Centralized hook for all Firebase operations
// Makes it easy to use Firebase functions in React components

import { useState } from "react";
import {
  uploadProductImage,
  updateProductImage,
  deleteProductImage,
} from "../firebase/storage";
import {
  saveProduct,
  getAllProducts,
  getProduct,
  getProductsByCategory,
  updateProduct,
  updateProductImageURL,
  deleteProduct,
  searchProducts,
  getProductsInStock,
} from "../firebase/firestore";

// ============================================================================
// USE FIREBASE HOOK
// ============================================================================
/**
 * Custom hook for Firebase operations
 * Provides loading and error states automatically
 *
 * Usage in component:
 * const {
 *   products,
 *   loading,
 *   error,
 *   fetchAllProducts,
 *   createProduct,
 *   updateProduct,
 *   removeProduct,
 * } = useFirebase();
 */
export const useFirebase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  // ========================================================================
  // UPLOAD IMAGE
  // ========================================================================
  const uploadImage = async (file, productId) => {
    try {
      setError(null);
      setLoading(true);
      const imageUrl = await uploadProductImage(file, productId);
      return imageUrl;
    } catch (err) {
      const errorMessage =
        err.message || "Erro ao fazer upload da imagem";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // UPDATE IMAGE
  // ========================================================================
  const updateImage = async (productId, file) => {
    try {
      setError(null);
      setLoading(true);
      const imageUrl = await updateProductImage(productId, file);
      return imageUrl;
    } catch (err) {
      const errorMessage =
        err.message || "Erro ao atualizar a imagem";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // DELETE IMAGE
  // ========================================================================
  const removeImage = async (productId) => {
    try {
      setError(null);
      setLoading(true);
      await deleteProductImage(productId);
    } catch (err) {
      const errorMessage =
        err.message || "Erro ao deletar a imagem";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // CREATE PRODUCT
  // ========================================================================
  const createProduct = async (productData) => {
    try {
      setError(null);
      setLoading(true);
      const productId = await saveProduct(productData);
      return productId;
    } catch (err) {
      const errorMessage =
        err.message || "Erro ao criar o produto";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // FETCH ALL PRODUCTS
  // ========================================================================
  const fetchAllProducts = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
      return data;
    } catch (err) {
      const errorMessage =
        err.message || "Erro ao buscar produtos";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // FETCH SINGLE PRODUCT
  // ========================================================================
  const fetchProduct = async (productId) => {
    try {
      setError(null);
      setLoading(true);
      const product = await getProduct(productId);
      return product;
    } catch (err) {
      const errorMessage =
        err.message || "Erro ao buscar o produto";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // FETCH PRODUCTS BY CATEGORY
  // ========================================================================
  const fetchProductsByCategory = async (category) => {
    try {
      setError(null);
      setLoading(true);
      const data = await getProductsByCategory(category);
      return data;
    } catch (err) {
      const errorMessage =
        err.message || "Erro ao buscar produtos da categoria";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // UPDATE PRODUCT
  // ========================================================================
  const updateProductData = async (productId, updatedData) => {
    try {
      setError(null);
      setLoading(true);
      await updateProduct(productId, updatedData);
      
      // Update local products array
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, ...updatedData } : p
        )
      );
    } catch (err) {
      const errorMessage =
        err.message || "Erro ao atualizar o produto";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // UPDATE PRODUCT IMAGE (complete flow)
  // ========================================================================
  const updateProductWithImage = async (productId, file) => {
    try {
      setError(null);
      setLoading(true);
      
      // Upload new image
      const newImageUrl = await updateImage(productId, file);
      
      // Update Firestore with new image URL
      await updateProductImageURL(productId, newImageUrl);
      
      // Update local state
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, imageUrl: newImageUrl } : p
        )
      );
      
      return newImageUrl;
    } catch (err) {
      const errorMessage =
        err.message || "Erro ao atualizar a imagem do produto";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // DELETE PRODUCT
  // ========================================================================
  const removeProduct = async (productId) => {
    try {
      setError(null);
      setLoading(true);
      await deleteProduct(productId);
      
      // Remove from local products array
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      const errorMessage =
        err.message || "Erro ao deletar o produto";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // SEARCH PRODUCTS
  // ========================================================================
  const search = async (searchTerm) => {
    try {
      setError(null);
      setLoading(true);
      const results = await searchProducts(searchTerm);
      return results;
    } catch (err) {
      const errorMessage =
        err.message || "Erro ao buscar produtos";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // GET PRODUCTS IN STOCK
  // ========================================================================
  const fetchInStockProducts = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getProductsInStock();
      return data;
    } catch (err) {
      const errorMessage =
        err.message || "Erro ao buscar produtos em estoque";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // CLEAR ERROR
  // ========================================================================
  const clearError = () => {
    setError(null);
  };

  return {
    // State
    products,
    loading,
    error,

    // Image operations
    uploadImage,
    updateImage,
    removeImage,

    // Product operations
    createProduct,
    fetchAllProducts,
    fetchProduct,
    fetchProductsByCategory,
    updateProductData,
    updateProductWithImage,
    removeProduct,

    // Search and filters
    search,
    fetchInStockProducts,

    // Utilities
    clearError,
  };
};
