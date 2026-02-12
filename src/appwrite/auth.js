import { Account, ID } from "appwrite";
import { client } from "./config";

const account = new Account(client);

// Admin email for hardcoded check (as a fallback or immediate UI feedback)
const ADMIN_EMAIL = "djaycosmetic@gmail.com";

export class AuthService {
  async createAccount({ email, password, name }) {
    try {
      const userAccount = await account.create(
        ID.unique(),
        email,
        password,
        name,
      );
      return userAccount;
    } catch (error) {
      console.error("Appwrite service :: createAccount :: error", error);
      throw error;
    }
  }

  async login({ email, password }) {
    try {
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
      // It's normal to throw if no session is active, returning null handles this safely in consumers
      // console.log("Appwrite service :: getCurrentUser :: no active session");
      return null;
    }
  }

  async logout() {
    try {
      return await account.deleteSessions();
    } catch (error) {
      console.error("Appwrite service :: logout :: error", error);
      throw error;
    }
  }

  async isAdmin(user) {
    if (!user) return false;

    // Check 1: Email mismatch (hardcoded security layer 1)
    if (user.email === ADMIN_EMAIL) return true;

    // Check 2: Labels (requires server-side script to have run)
    if (user.labels && user.labels.includes("admin")) return true;

    // Check 3: Teams (if configured later)
    // const teams = await new Teams(client).list();
    // return teams.teams.some(t => t.name === 'Admins');

    return false;
  }
}

const authService = new AuthService();

export default authService;
