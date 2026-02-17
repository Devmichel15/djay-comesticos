import { ID } from "appwrite";
import {
  storage,
  APPWRITE_BUCKET_ID,
  APPWRITE_PROJECT_ID,
  APPWRITE_ENDPOINT,
} from "./config";

/**
 * Upload de imagem para o Appwrite Storage (Bucket: produtos)
 */
export const uploadProductImage = async (file) => {
  try {
    if (!file) throw new Error("Arquivo inválido");

    // Bucket ID: 698e0c34002249a22585
    const response = await storage.createFile(
      APPWRITE_BUCKET_ID,
      ID.unique(),
      file,
    );

    const fileId = response.$id;

    // Construct simplified public URL manually to verify avoiding mode=admin
    // Format: https://cloud.appwrite.io/v1/storage/buckets/[BUCKET_ID]/files/[FILE_ID]/view?project=[PROJECT_ID]
    // We remove mode=admin if it was being added by SDK
    const publicUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;

    return {
      fileId: fileId,
      url: publicUrl,
    };
  } catch (error) {
    console.error("❌ Appwrite Upload Error:", error);
    throw new Error(`Erro no upload Appwrite: ${error.message}`);
  }
};

export const deleteProductImage = async (fileId) => {
  try {
    await storage.deleteFile(APPWRITE_BUCKET_ID, fileId);
    return true;
  } catch (error) {
    console.error("❌ Appwrite Delete Error:", error);
    return false;
  }
};

export const getProductImageUrl = (fileId) => {
  if (!fileId) return "";
  // Manually construct mostly to be safe
  return `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
};
