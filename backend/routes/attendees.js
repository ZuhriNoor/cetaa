import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Fuse from "fuse.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add category-based data path mapping
const getDataPath = (category) => {
  const paths = {
    'golden-jubilee': path.join(__dirname, "..", "data", "golden-jubilee.json"),
    'silver-jubilee': path.join(__dirname, "..", "data", "silver-jubilee.json"),
    'executives': path.join(__dirname, "..", "data", "executives.json")
  };
  return paths[category] || paths['golden-jubilee']; // fallback
};

const getAttendees = (category) => {
  const dataPath = getDataPath(category);
  const raw = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(raw);
};

// GET /attendees?search=prefix&category=category
router.get("/", (req, res) => {
  const search = req.query.search?.toLowerCase() || "";
  const category = req.query.category || "golden-jubilee";
  const attendees = getAttendees(category);

  if (!search) return res.json([]);

  // Fuse.js fuzzy + prefix config
  const fuse = new Fuse(attendees, {
    keys: ["name"],
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 1,
  });

  const results = fuse.search(search).map(result => result.item);
  res.json(results.slice(0, 5));
});

// GET /attendees/:id?category=category
router.get("/:id", (req, res) => {
  const category = req.query.category || "golden-jubilee";
  const attendees = getAttendees(category);
  const id = parseInt(req.params.id, 10);
  const attendee = attendees.find((a) => a.id === id);
  if (!attendee) return res.status(404).json({ error: "Attendee not found" });
  res.json(attendee);
});

router.post("/", (req,res) => {
  const success = true; 

  if (success) {
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false, error: "Something went wrong" });
  }})


export default router;
