import "dotenv/config";

const ENDPOINT =
  process.env.VITE_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID =
  process.env.VITE_APPWRITE_PROJECT_ID || "698b69a10008468221b4";
const BUCKET_ID = process.env.VITE_APPWRITE_ID_BUCKET || "698e0c34002249a22585";
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

async function provisionStorage() {
  console.log(`Configuring Storage Bucket: products (${BUCKET_ID})...`);

  try {
    // 1. Get existing bucket to check
    let current = {};
    try {
      console.log("Fetching current bucket config...");
      current = await apiCall("GET", `/storage/buckets/${BUCKET_ID}`);
      console.log("Current bucket config fetched.");
    } catch (e) {
      console.log(
        "Bucket get failed or not found. Will attempt update with defaults.",
      );
    }

    // 2. Update Bucket Permissions
    const permissions = [
      'read("any")', // Public read
      'create("users")', // Auth users can upload
      'update("users")', // Auth users can update
      'delete("users")', // Auth users can delete
    ];

    console.log("Updating permissions...");

    // Use current values or defaults if fetch failed
    await apiCall("PUT", `/storage/buckets/${BUCKET_ID}`, {
      name: current.name || "Products",
      permissions: permissions,
      fileSecurity:
        current.fileSecurity !== undefined ? current.fileSecurity : false,
      enabled: true,
      maximumFileSize: current.maximumFileSize || 30000000,
      allowedFileExtensions: current.allowedFileExtensions || [],
      compression: current.compression || "none",
      encryption: current.encryption || true,
      antivirus: current.antivirus || false,
    });

    console.log(`✅ Bucket permissions updated successfully.`);
  } catch (e) {
    console.error(`❌ Error configuring bucket:`, e.message);
    if (e.code === 404) {
      console.error("Bucket not found. Please create it first or check ID.");
    }
  }
}

provisionStorage().catch(console.error);
