import express from "express";
import { google } from "googleapis";
import Attendee from "../models/Attendee.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const router = express.Router();

// ESM __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });


let sheets = null;

const SHEET_ID = process.env.GOOGLE_SHEETS_ID;

// ✅ One-time async init block
(async () => {
  try {


    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, "credentials.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const authClient = await auth.getClient();
    sheets = google.sheets({ version: "v4", auth: authClient });

    console.log("✅ Google Sheets client initialized");
  } catch (err) {
    console.error("❌ Failed to initialize Google Sheets:", err);
  }
})();

// POST /attendance
router.post("/", async (req, res) => {
  console.log("📩 Attendance POST hit");

  const { attendeeId, couponCode, paymentMethod } = req.body;
  console.log(attendeeId);
  
  if (!attendeeId || !paymentMethod) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!sheets) {
    return res.status(500).json({ error: "Google Sheets client not initialized" });
  }

  try {
    const attendee = await Attendee.findById(attendeeId);
    if (!attendee) {
      return res.status(404).json({ error: "Attendee not found" });
    }

    const row = [
      new Date().toLocaleString(),
      attendee.name,
      attendee.email,
      attendee.phone,
      couponCode || "",
      paymentMethod,
    ];
    console.log(SHEET_ID)

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error appending to Google Sheets:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

export default router;
