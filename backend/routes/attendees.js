import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Fuse from "fuse.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "..", "data", "data.json");

const getAttendees = () => {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
};

// GET /attendees?search=prefix
router.get("/", (req, res) => {
  const search = req.query.search?.toLowerCase() || "";
  const attendees = getAttendees();

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

// GET /attendees/:id
router.get("/:id", (req, res) => {
  const attendees = getAttendees();
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
