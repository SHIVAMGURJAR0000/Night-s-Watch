require("dotenv").config();
const express = require("express");
const server = express();
// const PORT = "3000";
const auth = require("./modules/AuthModule/authRoutes");

server.use("/auth", auth);

server.get("/", (req, res) => {
  res.json({ msg: "server is working" });
});

server.get("/dashboard", (req, res) => {
  const { name, email } = req.query;
  res.send(`
    <h1>Welcome to your Dashboard</h1>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
  `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`server is working at http://localhost:${PORT}`);
});
