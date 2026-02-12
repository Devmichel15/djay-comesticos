import { Client, Account, Databases, Storage } from "appwrite";

// Credenciais Reais
export const APPWRITE_ENDPOINT =
  import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
export const APPWRITE_PROJECT_ID =
  import.meta.env.VITE_APPWRITE_PROJECT_ID || "67ab2a2c00230f2c45ae";
export const APPWRITE_DATABASE_ID = "698e0c0400114d2f5bbe";
export const APPWRITE_BUCKET_ID = "698e0c34002249a22585";

// Admin Email (Regra Automática)
export const ADMIN_EMAIL = "djaycosmetic@gmail.com";

export const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
