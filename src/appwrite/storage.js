import { ID } from "appwrite";
import { storage, APPWRITE_BUCKET_ID } from "./config";

/**
 * Upload de imagem para o Appwrite Storage
 * No Bucket: 698e0c34002249a22585 (produtos)
 */
export const uploadProductImage = async (file) => {
  try {
    if (!file) throw new Error("Arquivo inválido");

    const response = await storage.createFile(
      APPWRITE_BUCKET_ID,
      ID.unique(),
      file,
    );

    return {
      fileId: response.$id,
      url: storage.getFileView(APPWRITE_BUCKET_ID, response.$id).href,
    };
  } catch (error) {
    console.error("❌ Appwrite Upload Error:", error);
    throw new Error(`Erro no upload Appwrite: ${error.message}`);
  }
};

/**
 * Deletar imagem do storage
 */
export const deleteProductImage = async (fileId) => {
  try {
    await storage.deleteFile(APPWRITE_BUCKET_ID, fileId);
    return true;
  } catch (error) {
    console.error("❌ Appwrite Delete Error:", error);
    return false;
  }
};

/**
 * Obter URL de visualização por ID
 */
export const getProductImageUrl = (fileId) => {
  if (!fileId) return "";
  return storage.getFileView(APPWRITE_BUCKET_ID, fileId).href;
};
