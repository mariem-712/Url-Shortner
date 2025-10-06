import express from "express";
import bodyParser from "body-parser";
import { nanoid } from "nanoid";
import sqlite3 from "sqlite3";
import client from "prom-client";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;
const BASE_URL = process.env.BASE_URL || "http://192.168.56.28:8888";

const db = new sqlite3.Database("./db/urls.db", (err) => {
  if (err) console.error(err.message);
  console.log("Connected to the urls database.");
});

db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    id TEXT PRIMARY KEY,
    long_url TEXT NOT NULL
  )
`);


// Metrics
const shortenedUrlCounter = new client.Counter({
  name: "shortened_urls_total",
  help: "Total number of shortened URLs created",
});

const redirectSuccessCounter = new client.Counter({
  name: "redirect_success_total",
  help: "Total number of successful redirects",
});

const redirectFailCounter = new client.Counter({
  name: "redirect_fail_total",
  help: "Total number of failed lookups (404 errors)",
});

const requestLatency = new client.Histogram({
  name: "request_latency_seconds",
  help: "Request latency in seconds",
  labelNames: ["operation"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

app.use(bodyParser.json());

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.use(express.static("public"));

app.post("/shorten", (req, res) => {
  const endTimer = requestLatency.startTimer({ operation: "shorten" });

  const { url } = req.body;
  if (!url) {
    endTimer();
    return res.status(400).json({ error: "URL is required" });
  }

  const id = nanoid(7);
  const shortUrl = `${BASE_URL}/${id}`;

  db.run("INSERT INTO urls (id, long_url) VALUES (?, ?)", [id, url], function (err) {
    endTimer();
    if (err) return res.status(500).json({ error: err.message });
    res.json({ shortUrl });
    shortenedUrlCounter.inc();
  });
});

app.get("/:id", async (req, res) => {
  const endTimer = requestLatency.startTimer({ operation: "redirect" });
  const { id } = req.params;

  db.get("SELECT long_url FROM urls WHERE id = ?", [id], async (err, row) => {
    if (err) {
      endTimer();
      return res.status(500).send("DB Error");
    }

    if (!row) {
      redirectFailCounter.inc();
      endTimer();
      return res.status(404).send("URL not found");
    }

    try {
      const response = await fetch(row.long_url, { method: "HEAD" });
      if (response.ok) {
        redirectSuccessCounter.inc();
        endTimer();
        res.redirect(row.long_url);
      } else {
        redirectFailCounter.inc();
        endTimer();
        res.status(404).send("Target URL not reachable");
      }
    } catch (e) {
      redirectFailCounter.inc();
      endTimer();
      res.status(404).send("Target URL not reachable");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

