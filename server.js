import express from "express";
import bodyParser from "body-parser";
import { nanoid } from "nanoid";
import sqlite3 from "sqlite3";

const app = express();
const PORT = 3000;

// SQLite
const db = new sqlite3.Database("./urls.db");

db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    id TEXT PRIMARY KEY,
    original_url TEXT NOT NULL
  )
`);

app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/shorten", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });

  const shortId = nanoid(6);
  db.run("INSERT INTO urls (id, original_url) VALUES (?, ?)", [shortId, url], function (err) {
    if (err) return res.status(500).json({ error: "DB Error" });
    res.json({ shortUrl: `http://localhost:8888/${shortId}` });
  });
});

app.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT original_url FROM urls WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).send("DB Error");
    if (row) res.redirect(row.original_url);
    else res.status(404).send("URL not found");
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
