const route = require("express").Router();
const axios = require("axios");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

route.get("/Auth", (req, res) => {
  const data = {
    "CLIENT_ID ": CLIENT_ID,
    CLIENT_SECRET: CLIENT_SECRET,
    REDIRECT_URI: REDIRECT_URI,
  };
  res.json(data);
});

route.get("/google", (req, res) => {
  const scope = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ].join(" ");
  //   'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
  const redirectUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}` +
    `&response_type=code&scope=${scope}`;
  // https://accounts.google.com/o/oauth2/v2/auth?client_id=abc123.apps.googleusercontent.com&redirect_uri=http://localhost:3000/auth/google/callback&response_type=code&scope=https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email
  res.redirect(redirectUrl);
});

route.get("/google/callback", async (req, res) => {
  // redirect url
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: "no code returned from google" });
  }

  try {
    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, id_token } = tokenRes.data;

    // 2️⃣ Get user info from Google
    const userInfoRes = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    // 3️⃣ Send or store user info
    // res.json({
    //   tokens: { access_token, id_token },
    //   user: userInfoRes.data,
    // });

    const { name, email } = userInfoRes.data;
    res.redirect(
      `/dashboard?name=${encodeURIComponent(name)}&email=${encodeURIComponent(
        email
      )}`
    );
  } catch (error) {
    console.error("Error exchanging code:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to authenticate with Google" });
  }
});
module.exports = route;
