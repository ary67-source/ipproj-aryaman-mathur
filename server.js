const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8080;
const DATA_FILE = path.join(__dirname, "events.json");

app.use(express.json());
app.use(express.static("public"));

// Get all events
app.get("/events", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read file" });
    res.json(JSON.parse(data || "[]"));
  });
});

// Add event
app.post("/events", (req, res) => {
  const newEvent = req.body;
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    const events = data ? JSON.parse(data) : [];
    newEvent.id = Date.now();
    events.push(newEvent);
    fs.writeFile(DATA_FILE, JSON.stringify(events, null, 2), err => {
      if (err) return res.status(500).json({ error: "Failed to save" });
      res.json(newEvent);
    });
  });
});

// Edit event
app.put("/events/:id", (req, res) => {
  const id = Number(req.params.id);
  const updated = req.body;
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    const events = data ? JSON.parse(data) : [];
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).json({ error: "Event not found" });
    events[index] = { ...events[index], ...updated };
    fs.writeFile(DATA_FILE, JSON.stringify(events, null, 2), err => {
      if (err) return res.status(500).json({ error: "Failed to update" });
      res.json(events[index]);
    });
  });
});

// Delete event
app.delete("/events/:id", (req, res) => {
  const id = Number(req.params.id);
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    const events = data ? JSON.parse(data) : [];
    const filtered = events.filter(e => e.id !== id);
    fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2), err => {
      if (err) return res.status(500).json({ error: "Failed to delete" });
      res.json({ success: true });
    });
  });
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
