import { ID, Query } from "appwrite";
import { client, databases, APPWRITE_DATABASE_ID } from "./config";

const PRODUCTS_COLLECTION_ID = "products";
const USERS_COLLECTION_ID = "users";
const CARTS_COLLECTION_ID = "carts";

export class DataService {
  // =========================================================================
  // PRODUCTS (Collection: products)
  // =========================================================================
  async createProduct({
    name,
    price,
    description,
    imageId,
    imageUrl,
    userId,
    category,
    stock,
  }) {
    try {
      return await databases.createDocument(
        APPWRITE_DATABASE_ID,
        PRODUCTS_COLLECTION_ID,
        ID.unique(),
        {
          name,
          category: category || "Geral",
          stock: Number(stock) || 0,
          description,
          price: Number(price),
          image_url: imageUrl, // Mapped to requested attribute name
          admin_id: userId,
          // createdAt/updatedAt are system attributes ($createdAt), do not send manually unless custom
          // Legacy/Optional fields if needed by UI
          imageId,
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
        // [Query.orderDesc("createdAt")], // Removed for now to avoid index error
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

  async updateProduct(
    productId,
    { name, price, description, imageId, imageUrl, category, stock },
  ) {
    try {
      const data = {};
      if (name) data.name = name;
      if (price !== undefined) data.price = Number(price);
      if (description) data.description = description;
      if (imageId) data.imageId = imageId;
      if (imageUrl) data.image_url = imageUrl;
      if (category) data.category = category;
      if (stock !== undefined) data.stock = Number(stock);

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

  // =========================================================================
  // CARTS (Collection: carts)
  // =========================================================================
  async getCart(userId) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        CARTS_COLLECTION_ID,
        [Query.equal("user_id", userId)],
      );
      if (response.documents.length > 0) {
        return response.documents[0];
      }
      return null;
    } catch (error) {
      console.error("Appwrite service :: getCart :: error", error);
      return null;
    }
  }

  async createCart(userId) {
    try {
      return await databases.createDocument(
        APPWRITE_DATABASE_ID,
        CARTS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: userId,
          items: JSON.stringify([]),
        },
      );
    } catch (error) {
      console.error("Appwrite service :: createCart :: error", error);
      throw error;
    }
  }

  async updateCart(cartId, items) {
    try {
      return await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        CARTS_COLLECTION_ID,
        cartId,
        {
          items: JSON.stringify(items),
        },
      );
    } catch (error) {
      console.error("Appwrite service :: updateCart :: error", error);
      throw error;
    }
  }

  // =========================================================================
  // REAL-TIME SUBSCRIPTION
  // =========================================================================
  subscribeToCart(cartId, callback) {
    try {
      return client.subscribe(
        `databases.${APPWRITE_DATABASE_ID}.collections.${CARTS_COLLECTION_ID}.documents.${cartId}`,
        (response) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.update",
            )
          ) {
            const cartDoc = response.payload;
            try {
              const cartItems = JSON.parse(cartDoc.items || "[]");
              callback(cartItems);
            } catch (e) {
              console.error("Error parsing cart in subscription", e);
            }
          }
        },
      );
    } catch (error) {
      console.error("Appwrite service :: subscribeToCart :: error", error);
      return () => {};
    }
  }

  // Deprecated/Legacy
  async updateUserCart(uid, cartItems) {
    // Forward compatibility mapping if needed, or remove.
    // For now, we'll try to find the cart and update it.
    // This is inefficient but keeps compatibility with context call signature if we don't change context.
    const cart = await this.getCart(uid);
    if (cart) {
      return this.updateCart(cart.$id, cartItems);
    } else {
      const newCart = await this.createCart(uid);
      return this.updateCart(newCart.$id, cartItems);
    }
  }
}

const dataService = new DataService();
export default dataService;
