import { ID } from "appwrite";
import { account, ADMIN_EMAIL } from "./config";

export class AuthService {
  async createAccount({ email, password, name }) {
    try {
      return await account.create(ID.unique(), email, password, name);
    } catch (error) {
      if (error.code === 409) {
        console.warn("User already exists, attempting fallback login...");
        return await this.login({ email, password });
      }
      console.error("Appwrite service :: createAccount :: error", error);
      throw error;
    }
  }

  async login({ email, password }) {
    try {
      // Check if session exists and delete it
      try {
        const session = await account.get();
        if (session) {
          await account.deleteSession("current");
        }
      } catch (e) {
        // No session exists, proceed
      }

      return await account.createEmailPasswordSession(email, password);
    } catch (error) {
      console.error("Appwrite service :: login :: error", error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  }

  async logout() {
    try {
      return await account.deleteSessions();
    } catch (error) {
      console.error("Appwrite service :: logout :: error", error);
    }
  }

  async isAdmin(user) {
    if (!user) return false;
    // Automatic admin rule for email
    if (user.email === ADMIN_EMAIL) return true;
    // Fallback to labels if set via Appwrite Console/Script
    if (user.labels && user.labels.includes("admin")) return true;
    return false;
  }
}

const authService = new AuthService();
export default authService;
