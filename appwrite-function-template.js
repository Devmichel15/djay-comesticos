// Logic for an Appwrite Function to be triggered on 'users.create' or session creation
// This is what the user referred to as "lógica server-side (Appwrite Function)"

export default async ({ req, res, log, error }) => {
  const ADMIN_EMAIL = "djaycosmetic@gmail.com";

  if (req.method === "POST") {
    const payload = JSON.parse(req.body);
    const userEmail = payload.email;
    const userId = payload.$id;

    if (userEmail === ADMIN_EMAIL) {
      log(`Admin email detected: ${userEmail}. Assigning label...`);
      // Here you would use the Appwrite SDK to update labels
      // Note: Functions have a server SDK pre-installed or available.
      // return res.json({ success: true, message: "Admin detected" });
    }
  }

  return res.json({ success: true });
};
