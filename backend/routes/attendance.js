import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { google } from "googleapis";
import { log } from "console";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const DATA_PATH = path.join(__dirname, "..", "data", "data.json");
const ATTENDANCE_LOG = path.join(__dirname, "..", "data", "attendance_log.json");
const SHEET_ID = process.env.GOOGLE_SHEETS_ID;

const getAttendees = () => {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
};

function writeDataFile(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// Google Sheets client init
let sheets = null;
(async () => {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
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
  const { attendeeId, couponCode, paymentMethod } = req.body;
  console.log(attendeeId);
  
  if (!attendeeId || !paymentMethod) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const attendees = getAttendees();
  const attendee = attendees.find((a) => a.id === attendeeId);

  if (!attendee) {
    return res.status(404).json({ error: "Attendee not found" });
  }
  console.log(attendee.marked)
  if (attendee.marked === true){
    return res.status(404).json({error:"Attendee already marked!!"});
  }
  attendee.marked = true;
  writeDataFile(attendees);
  
  const row = [
    new Date().toLocaleString(),
    attendee.name,
    attendee.email,
    attendee.phone,
    couponCode || "",
    paymentMethod
  ];

  // Append to local file log
  let logs = [];
  if (fs.existsSync(ATTENDANCE_LOG)) {
    logs = JSON.parse(fs.readFileSync(ATTENDANCE_LOG, "utf-8"));
  }
  logs.push({
    timestamp: row[0],
    name: row[1],
    email: row[2],
    phone: row[3],
    couponCode: row[4],
    paymentMethod: row[5],
  });
  fs.writeFileSync(ATTENDANCE_LOG, JSON.stringify(logs, null, 2));

  // Also append to Google Sheet
  if (!sheets) {
    return res.status(500).json({ error: "Google Sheets not initialized" });
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Google Sheets append failed:", err.message);
    res.status(500).json({ error: "Failed to write to Google Sheet" });
  }
});

export default router;
