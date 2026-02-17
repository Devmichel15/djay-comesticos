import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Re-create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENDPOINT =
  process.env.VITE_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID =
  process.env.VITE_APPWRITE_PROJECT_ID || "698b69a10008468221b4";
const DATABASE_ID =
  process.env.VITE_APPWRITE_ID_DATABASE || "698e0c0400114d2f5bbe";
const BUCKET_ID = process.env.VITE_APPWRITE_ID_BUCKET || "698e0c34002249a22585";
const API_KEY = process.env.VITE_APPWRITE_API_KEY;

if (!API_KEY) {
  console.error(
    "Error: VITE_APPWRITE_API_KEY not found in environment variables.",
  );
  process.exit(1);
}

// Load JSON Data safely
const jsonPath = path.resolve(__dirname, "src/Produtos.json");
let productsData = [];
try {
  const raw = fs.readFileSync(jsonPath, "utf8");
  productsData = JSON.parse(raw);
} catch (e) {
  console.error("Failed to read Produits.json:", e.message);
  process.exit(1);
}

const HEADERS = {
  "X-Appwrite-Project": PROJECT_ID,
  "X-Appwrite-Key": API_KEY,
  // Content-Type varies (multipart for files, json for data)
};

async function apiCall(method, path, body = null, isFile = false) {
  const options = {
    method,
    headers: { ...HEADERS },
  };

  if (isFile) {
    // body is FormData
    options.body = body;
    // Do not set Content-Type, fetch sets it with boundary
  } else {
    options.headers["Content-Type"] = "application/json";
    if (body) options.body = JSON.stringify(body);
  }

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

// Helper to check if product exists
async function productExists(name) {
  try {
    const response = await apiCall(
      "GET",
      `/databases/${DATABASE_ID}/collections/products/documents?queries[0]=equal("name", ["${name}"])`,
    );
    return response.total > 0;
  } catch (e) {
    return false;
  }
}

async function uploadImage(imagePath) {
  try {
    // Image path in JSON is like "/public/product1.png"
    // We need to resolve it relative to CWD.
    // If script is in root, "public/product1.png" should work if folder is "public".
    // Remove leading slash if present
    const cleanPath = imagePath.startsWith("/")
      ? imagePath.slice(1)
      : imagePath;
    const fullPath = path.resolve(__dirname, cleanPath);

    if (!fs.existsSync(fullPath)) {
      console.error(`   ❌ Image not found: ${fullPath}`);
      return null;
    }

    const stats = fs.statSync(fullPath);
    const fileBuffer = fs.readFileSync(fullPath);

    // Appwrite Storage API expects multipart/form-data
    const formData = new FormData();
    formData.append("fileId", "unique()");

    const blob = new Blob([fileBuffer]);
    formData.append("file", blob, path.basename(fullPath));

    const response = await apiCall(
      "POST",
      `/storage/buckets/${BUCKET_ID}/files`,
      formData,
      true,
    );

    return response.$id;
  } catch (e) {
    console.error(`   ❌ Upload failed:`, e.message);
    return null;
  }
}

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  // Remove "kz", ".", ",", spaces
  const clean = String(priceStr)
    .replace(/kz/gi, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .trim();
  return parseFloat(clean) || 0;
}

// Global Set to track names processed in this run to avoid duplicates within json itself if any
const processedNames = new Set();

async function migrate() {
  console.log("Starting Product Migration...");

  for (const catGroup of productsData) {
    const categoryName = catGroup.categoria;
    console.log(`Processing Category: ${categoryName}`);

    for (const prod of catGroup.produtos) {
      const name = prod.nome;

      if (processedNames.has(name)) continue;
      processedNames.add(name);

      // 1. Check Duplicates in DB
      if (await productExists(name)) {
        console.log(`   ⏭️ Skipped (Already Exists): ${name}`);
        continue;
      }

      console.log(`   Processing: ${name}`);

      // 2. Upload Image
      let imageUrl = "";
      let imageId = "";

      if (prod.img) {
        const uploadedId = await uploadImage(prod.img);
        if (uploadedId) {
          imageId = uploadedId;
          // Generate Public URL (No mode=admin)
          imageUrl = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${uploadedId}/view?project=${PROJECT_ID}`;
        }
      }

      // 3. Prepare Data
      const price = parsePrice(prod.preco);
      const description = prod.copy || "";
      const stock = 10; // Default

      const docBody = {
        documentId: "unique()",
        data: {
          name: name,
          category: categoryName,
          price: price,
          stock: stock,
          description: description,
          image_url: imageUrl,
          admin_id: "migration_script",
          // Legacy attributes just in case
          imageId: imageId,
          imageUrl: imageUrl,
        },
        permissions: ['read("any")', 'update("users")', 'delete("users")'],
      };

      // 4. Create Document
      try {
        await apiCall(
          "POST",
          `/databases/${DATABASE_ID}/collections/products/documents`,
          docBody,
        );
        console.log(`   ✅ Created: ${name}`);
      } catch (e) {
        console.error(`   ❌ Failed to create document:`, e.message);
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  console.log("Migration Completed.");
}

migrate().catch(console.error);
