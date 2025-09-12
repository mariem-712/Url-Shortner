import express from "express";
import bodyParser from "body-parser";
import { nanoid } from "nanoid";
import sqlite3 from "sqlite3";

const app = express();
const PORT = 3000;

// استخدام متغير بيئة مع قيمة افتراضية
const BASE_URL = process.env.BASE_URL || 'http://localhost:8888';

// SQLite
const db = new sqlite3.Database("./db/urls.db", (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("Connected to the urls database.");
});

db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    id TEXT PRIMARY KEY,
    long_url TEXT NOT NULL
  )
`);

app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/shorten", (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    const id = nanoid(7);
    const shortUrl = `${BASE_URL}/${id}`;

    db.run("INSERT INTO urls (id, long_url) VALUES (?, ?)", [id, url], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ shortUrl });
    });
});

app.get("/:id", (req, res) => {
    const { id } = req.params;
    db.get("SELECT long_url FROM urls WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).send("DB Error");
        }
        if (row) {
            res.redirect(row.long_url);
        } else {
            res.status(404).send("URL not found");
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
