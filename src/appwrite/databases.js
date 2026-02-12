import { Client, Databases, Query, ID } from "appwrite";
import { client, APPWRITE_DATABASE_ID } from "./config";

const databases = new Databases(client);

const PRODUCTS_COLLECTION_ID = "products";
const USERS_COLLECTION_ID = "users";

export class DataService {
  // =========================================================================
  // PRODUCTS
  // =========================================================================
  async createProduct({ name, price, description, imageId, userId }) {
    try {
      return await databases.createDocument(
        APPWRITE_DATABASE_ID,
        PRODUCTS_COLLECTION_ID,
        ID.unique(),
        {
          name,
          description,
          price: Number(price),
          imageId,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      );
    } catch (error) {
      console.error("Appwrite service :: createProduct :: error", error);
      throw error;
    }
  }

  async getProducts() {
    try {
      return await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        PRODUCTS_COLLECTION_ID,
        [Query.orderDesc("createdAt")],
      );
    } catch (error) {
      console.error("Appwrite service :: getProducts :: error", error);
      throw error;
    }
  }

  async getProduct(productId) {
    try {
      return await databases.getDocument(
        APPWRITE_DATABASE_ID,
        PRODUCTS_COLLECTION_ID,
        productId,
      );
    } catch (error) {
      console.error("Appwrite service :: getProduct :: error", error);
      return false;
    }
  }

  async updateProduct(productId, { name, price, description, imageId }) {
    try {
      const data = { updatedAt: new Date().toISOString() };
      if (name) data.name = name;
      if (price !== undefined) data.price = Number(price);
      if (description) data.description = description;
      if (imageId) data.imageId = imageId;

      return await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        PRODUCTS_COLLECTION_ID,
        productId,
        data,
      );
    } catch (error) {
      console.error("Appwrite service :: updateProduct :: error", error);
      throw error;
    }
  }

  async deleteProduct(productId) {
    try {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        PRODUCTS_COLLECTION_ID,
        productId,
      );
      return true;
    } catch (error) {
      console.error("Appwrite service :: deleteProduct :: error", error);
      return false;
    }
  }

  async getProductsByCategory(category) {
    try {
      return await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        PRODUCTS_COLLECTION_ID,
        [Query.equal("category", category)],
      );
    } catch (error) {
      console.error(
        "Appwrite service :: getProductsByCategory :: error",
        error,
      );
      throw error;
    }
  }

  async searchProducts(term) {
    try {
      return await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        PRODUCTS_COLLECTION_ID,
        [Query.search("name", term)],
      );
    } catch (error) {
      console.error("Appwrite service :: searchProducts :: error", error);
      throw error;
    }
  }

  // =========================================================================
  // USERS & CART
  // =========================================================================
  async createUserProfile({ uid, email, name }) {
    try {
      return await databases.createDocument(
        APPWRITE_DATABASE_ID,
        USERS_COLLECTION_ID,
        uid,
        {
          uid,
          email,
          name,
          cart: JSON.stringify([]),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      );
    } catch (error) {
      // If already exists, just return profile or ignore
      console.warn("User profile might already exist");
      return null;
    }
  }

  async updateUserCart(uid, cartItems) {
    try {
      return await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        USERS_COLLECTION_ID,
        uid,
        {
          cart: JSON.stringify(cartItems),
          updatedAt: new Date().toISOString(),
        },
      );
    } catch (error) {
      console.error("Appwrite service :: updateUserCart :: error", error);
      throw error;
    }
  }

  subscribeToCart(uid, callback) {
    try {
      return client.subscribe(
        `databases.${APPWRITE_DATABASE_ID}.collections.${USERS_COLLECTION_ID}.documents.${uid}`,
        (response) => {
          if (response.payload && response.payload.cart) {
            try {
              const cart = JSON.parse(response.payload.cart);
              callback(cart);
            } catch (e) {
              console.error("Error parsing cart update", e);
            }
          }
        },
      );
    } catch (error) {
      console.error("Appwrite service :: subscribeToCart :: error", error);
      return () => {};
    }
  }
}

const dataService = new DataService();
export default dataService;
