import { Client, Account, Databases, Storage } from "appwrite";

const required = (key, label) => {
  const val = import.meta.env[key];
  if (!val) {
    throw new Error(
      `Variável de ambiente ${key} (${label}) não definida. Configure o ficheiro .env baseado no .env.example`,
    );
  }
  return val;
};

export const APPWRITE_ENDPOINT = required(
  "VITE_APPWRITE_ENDPOINT",
  "Appwrite Endpoint",
);
export const APPWRITE_PROJECT_ID = required(
  "VITE_APPWRITE_PROJECT_ID",
  "Appwrite Project ID",
);
export const APPWRITE_DATABASE_ID = required(
  "VITE_APPWRITE_ID_DATABASE",
  "Appwrite Database ID",
);
export const APPWRITE_BUCKET_ID = required(
  "VITE_APPWRITE_ID_BUCKET",
  "Appwrite Bucket ID",
);
export const APPWRITE_API_KEY = import.meta.env.VITE_APPWRITE_API_KEY;
export const ADMIN_EMAIL = required("VITE_ADMIN_EMAIL", "Admin Email");

export const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;
