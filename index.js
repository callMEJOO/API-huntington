import express from "express";
import axios from "axios";

const app = express();

// مهم جدًا
app.use(express.json());

// Route اختبار
app.get("/", (req, res) => {
  res.send("API is running");
});

// Route اللوجين
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing username or password"
    });
  }

  try {
    const response = await axios.post(
      "https://digitallobby.huntington.com/pkmslogin.form",
      new URLSearchParams({
        username,
        password,
        "login-form-type": "pwd"
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const body = JSON.stringify(response.data);

    if (body.includes("login_success")) {
      return res.json({ success: true });
    }

    return res.json({ success: false });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Request failed"
    });
  }
});

// مهم جدًا لـ Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
