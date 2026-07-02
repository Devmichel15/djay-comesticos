import { Client, Account, Databases, Storage } from "appwrite";

export const APPWRITE_ENDPOINT =
  import.meta.env.VITE_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
export const APPWRITE_PROJECT_ID =
  import.meta.env.VITE_APPWRITE_PROJECT_ID || "698b69a10008468221b4";
export const APPWRITE_DATABASE_ID =
  import.meta.env.VITE_APPWRITE_ID_DATABASE || "698e0c0400114d2f5bbe";
export const APPWRITE_BUCKET_ID =
  import.meta.env.VITE_APPWRITE_ID_BUCKET || "698e0c34002249a22585";
export const APPWRITE_API_KEY = import.meta.env.VITE_APPWRITE_API_KEY;
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "djaycosmetics@gmail.com";

export const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;
