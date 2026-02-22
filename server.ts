import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data.json");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API routes
  app.get("/api/data/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const data = await fs.readFile(DATA_FILE, "utf-8").catch(() => "{}");
      const parsedData = JSON.parse(data);
      res.json(parsedData[userId] || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to load data" });
    }
  });

  app.post("/api/data/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const newData = req.body;
      
      const data = await fs.readFile(DATA_FILE, "utf-8").catch(() => "{}");
      const parsedData = JSON.parse(data);
      
      parsedData[userId] = newData;
      
      await fs.writeFile(DATA_FILE, JSON.stringify(parsedData, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
