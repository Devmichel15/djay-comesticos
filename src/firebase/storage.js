// ============================================================================
// Firebase Storage Functions
// ============================================================================
// Upload, update and delete product images from Firebase Storage
// Images are stored at: /products/{productId}/image.png

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";

// ============================================================================
// UPLOAD PRODUCT IMAGE
// ============================================================================
/**
 * Upload a product image to Firebase Storage
 * Stores at: /products/{productId}/image.png
 * @param {File} file - Image file to upload
 * @param {string} productId - Product ID (used for organizing storage)
 * @returns {Promise<string>} Public download URL of the uploaded image
 */
export const uploadProductImage = async (file, productId) => {
  try {
    if (!file) {
      throw new Error("Nenhum arquivo fornecido");
    }

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      throw new Error("O arquivo deve ser uma imagem (JPG, PNG, etc)");
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("A imagem não pode ser maior que 5MB");
    }

    // Create storage reference
    const fileRef = ref(storage, `products/${productId}/image.png`);

    // Upload file
    await uploadBytes(fileRef, file);

    // Get and return public download URL
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error("Image upload error:", error.message);
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
    // Delete old image if it exists
    try {
      const oldFileRef = ref(storage, `products/${productId}/image.png`);
      await deleteObject(oldFileRef);
    } catch (err) {
      // File might not exist, which is okay
      console.warn("Old image not found or could not be deleted");
    }

    // Upload new image
    return await uploadProductImage(file, productId);
  } catch (error) {
    console.error("Image update error:", error.message);
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
    const fileRef = ref(storage, `products/${productId}/image.png`);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Image delete error:", error.message);
    throw new Error(`Erro ao deletar imagem: ${error.message}`);
  }
};

// ============================================================================
// GET IMAGE URL (if you need to fetch an existing URL)
// ============================================================================
/**
 * Get the public download URL of a product image
 * @param {string} productId - Product ID
 * @returns {Promise<string>} Public download URL
 */
export const getProductImageURL = async (productId) => {
  try {
    const fileRef = ref(storage, `products/${productId}/image.png`);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error("Get image URL error:", error.message);
    throw new Error("Imagem não encontrada");
  }
};
