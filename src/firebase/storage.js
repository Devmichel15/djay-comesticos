// ============================================================================
// Firebase Storage Functions - CORRECT FLOW
// ============================================================================
// Upload product images AFTER creating the product document
// Images are stored at: /produtos/{productId}/image.png

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage, auth } from "./firebase";

// ============================================================================
// UPLOAD PRODUCT IMAGE (AFTER PRODUCT CREATION)
// ============================================================================
/**
 * Upload a product image to Firebase Storage
 * ⚠️ IMPORTANT: Only call this AFTER creating the product in Firestore
 * Stores at: /produtos/{productId}/image.png
 * @param {File} file - Image file to upload
 * @param {string} productId - Product ID from Firestore
 * @returns {Promise<string>} Public download URL of the uploaded image
 */
export const uploadProductImage = async (file, productId) => {
  try {
    // ✅ CRITICAL: Verify authentication first
    if (!auth.currentUser) {
      throw new Error("Você precisa estar autenticado para fazer upload");
    }

    if (!file) {
      throw new Error("Nenhum arquivo fornecido");
    }

    if (!productId) {
      throw new Error("productId é obrigatório para upload");
    }

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      throw new Error("O arquivo deve ser uma imagem (JPG, PNG, etc)");
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("A imagem não pode ser maior que 5MB");
    }

    // ✅ CORRECT PATH: Uses "produtos" to match Firestore collection
    const fileRef = ref(storage, `produtos/${productId}/image.png`);

    // Upload file
    await uploadBytes(fileRef, file);

    // Get and return public download URL
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    throw new Error(`Erro ao fazer upload: ${error.message}`);
  }
};

// ============================================================================
// UPDATE PRODUCT IMAGE
// ============================================================================
/**
 * Update an existing product image (deletes old and uploads new)
 * @param {string} productId - Product ID
 * @param {File} file - New image file
 * @returns {Promise<string>} New public download URL
 */
export const updateProductImage = async (productId, file) => {
  try {
    // Verify authentication
    if (!auth.currentUser) {
      throw new Error("Você precisa estar autenticado");
    }

    // Delete old image if it exists
    try {
      const oldFileRef = ref(storage, `produtos/${productId}/image.png`);
      await deleteObject(oldFileRef);
    } catch (err) {
      // File might not exist, which is okay
    }

    // Upload new image
    return await uploadProductImage(file, productId);
  } catch (error) {
    throw new Error(`Erro ao atualizar imagem: ${error.message}`);
  }
};

// ============================================================================
// DELETE PRODUCT IMAGE
// ============================================================================
/**
 * Delete a product image from Firebase Storage
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
export const deleteProductImage = async (productId) => {
  try {
    if (!auth.currentUser) {
      throw new Error("Você precisa estar autenticado");
    }

    const fileRef = ref(storage, `produtos/${productId}/image.png`);
    await deleteObject(fileRef);
  } catch (error) {
    throw new Error(`Erro ao deletar imagem: ${error.message}`);
  }
};

// ============================================================================
// GET IMAGE URL
// ============================================================================
/**
 * Get the public download URL of a product image
 * @param {string} productId - Product ID
 * @returns {Promise<string>} Public download URL
 */
export const getProductImageURL = async (productId) => {
  try {
    const fileRef = ref(storage, `produtos/${productId}/image.png`);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    throw new Error("Imagem não encontrada");
  }
};
