// ============================================================================
// useAppwrite - Custom hook for Appwrite operations
// ============================================================================

import { useState } from "react";
import {
  uploadProductImage,
  deleteProductImage,
  getProductImageUrl,
} from "../appwrite/appwrite.storage";
import dataService from "../appwrite/appwrite.database";
import { useAuth } from "../context/AuthContext";

export const useAppwrite = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const { user } = useAuth();

  // ========================================================================
  // UPLOAD IMAGE
  // ========================================================================
  const uploadImage = async (file) => {
    try {
      setError(null);
      setLoading(true);
      const result = await uploadProductImage(file);
      return result; // Returns { fileId, url }
    } catch (err) {
      const errorMessage = err.message || "Erro ao fazer upload da imagem";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // DELETE IMAGE
  // ========================================================================
  const removeImage = async (fileId) => {
    try {
      setError(null);
      setLoading(true);
      await deleteProductImage(fileId);
    } catch (err) {
      console.warn("Error deleting image", err);
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

      const product = await dataService.createProduct({
        ...productData,
        userId: user?.$id || "admin",
      });
      return product;
    } catch (err) {
      const errorMessage = err.message || "Erro ao criar o produto";
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
      const response = await dataService.getProducts();

      const mapped = response.documents.map((doc) => ({
        ...doc,
        id: doc.$id,
        // Prefer saved imageUrl, fallback to generating from ID if missing
        imageUrl: doc.imageUrl || getProductImageUrl(doc.imageId),
      }));
      setProducts(mapped);
      return mapped;
    } catch (err) {
      const errorMessage = err.message || "Erro ao buscar produtos";
      setError(errorMessage);
      console.error(errorMessage);
      return [];
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
      await dataService.updateProduct(productId, updatedData);

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, ...updatedData } : p)),
      );
    } catch (err) {
      const errorMessage = err.message || "Erro ao atualizar o produto";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // DELETE PRODUCT
  // ========================================================================
  const removeProduct = async (productId, imageId) => {
    try {
      setError(null);
      setLoading(true);

      // Delete from DB
      await dataService.deleteProduct(productId);

      // Delete Image if ID exists
      if (imageId) {
        await removeImage(imageId);
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      const errorMessage = err.message || "Erro ao deletar o produto";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    products,
    loading,
    error,
    uploadImage,
    removeImage,
    createProduct,
    fetchAllProducts,
    updateProduct: updateProductData,
    removeProduct,
    clearError,
  };
};
