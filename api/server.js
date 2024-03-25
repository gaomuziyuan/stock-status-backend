// See https://github.com/typicode/json-server#module
const jsonServer = require("json-server");
const cors = require("cors");

const server = jsonServer.create();

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
server.use(router);
server.listen(process.env.PORT || 3001, () => {
  console.log(`JSON Server is running on port ${process.env.PORT || 3001}`);
});

// Export the Server API
module.exports = server;
