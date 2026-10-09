import express from "express";
import cors from "cors";
import catalog from "./catalog.json" with { type: "json" };

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api/titles", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const genre = String(req.query.genre || "").toLowerCase();
  const results = catalog.filter(item =>
    (!q || item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) &&
    (!genre || item.genre.toLowerCase() === genre)
  );
  res.json(results);
});
app.get("/api/genres", (_req, res) => res.json([...new Set(catalog.map(x => x.genre))]));
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log(`StreamFlix API listening on ${port}`));
