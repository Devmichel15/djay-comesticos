import "dotenv/config";

const ENDPOINT =
  process.env.VITE_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID =
  process.env.VITE_APPWRITE_PROJECT_ID || "698b69a10008468221b4";
const DATABASE_ID =
  process.env.VITE_APPWRITE_ID_DATABASE || "698e0c0400114d2f5bbe";
const API_KEY = process.env.VITE_APPWRITE_API_KEY;

if (!API_KEY) {
  console.error(
    "Error: VITE_APPWRITE_API_KEY not found in environment variables.",
  );
  process.exit(1);
}

const HEADERS = {
  "Content-Type": "application/json",
  "X-Appwrite-Project": PROJECT_ID,
  "X-Appwrite-Key": API_KEY,
};

async function apiCall(method, path, body = null) {
  const options = {
    method,
    headers: HEADERS,
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${ENDPOINT}${path}`, options);
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw {
      code: response.status,
      message: json.message || response.statusText,
      ...json,
    };
  }
  return json;
}

async function fixPermissions() {
  console.log(`Fixing Permissions for Collection: products...`);

  try {
    // Update Products Collection Permissions
    // User requested: read(Role.any()), write(Role.users())
    // Note: 'write' usually maps to create/update/delete.
    // We will enable create/update/delete for "users" (authenticated).
    // Front-end protects the "Admin Panel" route.

    const productId = "products";

    const permissions = [
      'read("any")', // Public Read
      'create("users")', // Auth Users Create
      'update("users")', // Auth Users Update
      'delete("users")', // Auth Users Delete
    ];

    // Retrieve current collection to keep name/enabled status if needed,
    // but often we can just set what we want.
    const current = await apiCall(
      "GET",
      `/databases/${DATABASE_ID}/collections/${productId}`,
    );

    await apiCall("PUT", `/databases/${DATABASE_ID}/collections/${productId}`, {
      name: current.name,
      permissions: permissions,
      documentSecurity: current.documentSecurity, // Keep false usually for public products
      enabled: true,
    });

    console.log(`✅ Collection Permissions updated successfully.`);
    console.log(`New Permissions:`, permissions);
  } catch (e) {
    console.error(`❌ Error updating permissions:`, e.message);
  }
}

fixPermissions().catch(console.error);
