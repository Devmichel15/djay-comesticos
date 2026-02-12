import { Client, Users } from "node-appwrite";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configure dotenv to read from .env file in project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY); // You must add this key to your .env file

const users = new Users(client);

const targetEmail = "djaycosmetic@gmail.com";

async function setAdmin() {
  console.log(`Searching for user with email: ${targetEmail}...`);

  try {
    // List users to find the one with the target email
    const response = await users.list([
      `email=${targetEmail}`, // Deprecated query syntax in some versions, but standard list params usually work.
      // Better to use search or just list and filter if needed, but Query.equal is best if supported by node-appwrite version.
      // Let's try to just list and filter manually to be safe or use Query if available.
    ]);

    // In node-appwrite, we can often pass queries as arrays of strings if acceptable, or just list.
    // Let's simply list.

    const userList = await users.list();
    const user = userList.users.find((u) => u.email === targetEmail);

    if (!user) {
      console.error(`User ${targetEmail} not found! Please sign up first.`);
      return;
    }

    console.log(`User found: ${user.$id}. Assigning 'admin' label...`);

    // Check if already has label
    if (user.labels && user.labels.includes("admin")) {
      console.log("User is already an admin.");
      return;
    }

    // Update labels
    const currentLabels = user.labels || [];
    const updatedLabels = [...currentLabels, "admin"];

    await users.updateLabels(user.$id, updatedLabels);

    console.log(
      `✅ Success! User ${targetEmail} is now an admin (Label: admin).`,
    );
    console.log(
      "You can now use role:label:admin in your Appwrite permissions.",
    );
  } catch (error) {
    console.error("❌ Error assigning admin role:", error.message);
    console.error(
      'Ensure you have APPWRITE_API_KEY in your .env with "users.write" scope.',
    );
  }
}

setAdmin();
