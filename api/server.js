// See https://github.com/typicode/json-server#module
const jsonServer = require("json-server");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");

const server = jsonServer.create();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Uncomment to allow write operations
const fs = require("fs");
const path = require("path");
const filePath = path.join("db.json");
const data = fs.readFileSync(filePath, "utf-8");
const db = JSON.parse(data);
const router = jsonServer.router(db);

// Comment out to allow write operations
// const router = jsonServer.router("db.json");

const middlewares = jsonServer.defaults();

server.use(middlewares);

server.use(
  cors({
    origin: [
      "https://paint-kanban.vercel.app",
      "https://paint-kanban-frontend-a32c27d55ff1.herokuapp.com",
    ],
  })
);
// Add this before server.use(router)
server.use(
  jsonServer.rewriter({
    "/api/*": "/$1",
    "/blog/:resource/:id/show": "/:resource/:id",
  })
);

server.use(express.json());

server.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find((user) => user.username === username);
  if (!user) {
    return res.status(404).json({ error: "Username does not exist!" });
  }
  if (user.password !== password) {
    return res.status(401).json({ error: "Password is incorrect!" });
  }
  if (!user.isActive) {
    return res.status(403).json({ error: "User has been disabled!" });
  }
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      isActive: user.isActive,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return res.status(200).json({
    token,
  });
});

server.use("/api", authenticateToken);

server.use(router);
server.listen(process.env.PORT || 3001, () => {
  console.log(`JSON Server is running on port ${process.env.PORT || 3001}`);
});

// Export the Server API
module.exports = server;
