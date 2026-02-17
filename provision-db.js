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

const COLLECTIONS = [
  {
    id: "products",
    name: "Products",
    permissions: [
      'read("any")',
      'create("users")',
      'update("users")',
      'delete("users")',
    ],
    attributes: [
      { key: "name", type: "string", size: 255, required: true },
      { key: "category", type: "string", size: 100, required: true },
      { key: "stock", type: "integer", required: true },
      { key: "price", type: "double", required: true },
      { key: "image_url", type: "string", size: 2000, required: false },
      { key: "admin_id", type: "string", size: 50, required: false },
      { key: "description", type: "string", size: 1000, required: false },
      // Legacy/Backup
      { key: "imageId", type: "string", size: 50, required: false },
      { key: "imageUrl", type: "string", size: 2000, required: false },
      { key: "createdBy", type: "string", size: 50, required: false },
    ],
  },
  {
    id: "carts",
    name: "Shopping Carts",
    permissions: [
      'read("users")',
      'create("users")',
      'update("users")',
      'delete("users")',
    ],
    attributes: [
      { key: "user_id", type: "string", size: 50, required: true },
      { key: "items", type: "string", size: 100000, required: false },
    ],
  },
];

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

async function provision() {
  console.log("Starting Database Provisioning (Node.js REST API)...");

  for (const col of COLLECTIONS) {
    console.log(`Processing Collection: ${col.name} (${col.id})...`);

    // 1. Create Collection
    try {
      // Try getting it first to avoid 409 noise or just use create which fails if exists
      await apiCall("POST", `/databases/${DATABASE_ID}/collections`, {
        collectionId: col.id,
        name: col.name,
        permissions: col.permissions,
        enabled: true,
      });
      console.log(`✅ Collection ${col.name} created.`);
    } catch (e) {
      if (e.code === 409) {
        console.log(
          `ℹ️ Collection ${col.name} already exists. Updating permissions...`,
        );
        // Ensure permissions are sync'd
        try {
          const current = await apiCall(
            "GET",
            `/databases/${DATABASE_ID}/collections/${col.id}`,
          );
          await apiCall(
            "PUT",
            `/databases/${DATABASE_ID}/collections/${col.id}`,
            {
              name: col.name,
              permissions: col.permissions,
              enabled: true,
              documentSecurity: current.documentSecurity,
            },
          );
          console.log(`   Permissions updated.`);
        } catch (err) {
          console.error("Error updating permissions:", err.message);
        }
      } else {
        console.error(`❌ Error creating collection ${col.name}:`, e.message);
      }
    }

    // 2. Create Attributes
    for (const attr of col.attributes) {
      try {
        let path = `/databases/${DATABASE_ID}/collections/${col.id}/attributes`;
        const body = {
          key: attr.key,
          required: attr.required,
        };

        // Add type-specific fields
        if (attr.type === "string") {
          path += "/string";
          body.size = attr.size || 255;
        } else if (attr.type === "integer") {
          path += "/integer";
          body.min = -2147483648;
          body.max = 2147483647;
        } else if (attr.type === "double" || attr.type === "float") {
          path += "/float";
        } else if (attr.type === "boolean") {
          path += "/boolean";
        }

        await apiCall("POST", path, body);
        console.log(`   ✅ Attribute ${attr.key} created.`);
      } catch (e) {
        if (e.code === 409) {
          // console.log(`   ℹ️ Attribute ${attr.key} exists.`);
        } else {
          console.error(
            `   ❌ Error creating attribute ${attr.key}:`,
            e.message,
          );
        }
      }
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  console.log("\nProvisioning Job Completed.");
}

provision().catch(console.error);
