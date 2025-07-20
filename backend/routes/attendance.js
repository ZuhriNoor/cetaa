import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { google } from "googleapis";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Load env
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Add category-based attendance log path mapping
const getAttendanceLogPath = (category) => {
  const paths = {
    'golden-jubilee': path.join(__dirname, "..", "data", "golden-jubilee-attendance.json"),
    'silver-jubilee': path.join(__dirname, "..", "data", "silver-jubilee-attendance.json"),
    'executives': path.join(__dirname, "..", "data", "executives-attendance.json")
  };
  return paths[category] || paths['golden-jubilee']; // fallback
};

// Add category-based data path mapping
const getDataPath = (category) => {
  const paths = {
    'golden-jubilee': path.join(__dirname, "..", "data", "golden-jubilee.json"),
    'silver-jubilee': path.join(__dirname, "..", "data", "silver-jubilee.json"),
    'executives': path.join(__dirname, "..", "data", "executives.json")
  };
  return paths[category] || paths['golden-jubilee']; // fallback
};

// Add category-based sheet ID mapping
const getSheetId = (category) => {
  const sheetIds = {
    'golden-jubilee': process.env.GOOGLE_SHEETS_ID1,
    'silver-jubilee': process.env.GOOGLE_SHEETS_ID2,
    'executives': process.env.GOOGLE_SHEETS_ID3
  };
  return sheetIds[category] || process.env.GOOGLE_SHEETS_ID1;
};

const getAttendees = (category) => {
  const dataPath = getDataPath(category);
  const raw = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(raw);
};

function writeDataFile(data, category) {
  const dataPath = getDataPath(category);
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
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

  const { attendeeId, couponCode, paymentMethod, category } = req.body;

  if (!attendeeId || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Payment is optional for all categories
  const isPaymentRequired = false;


  const attendees = getAttendees(category);

  const attendee = attendees.find((a) => a.id === attendeeId);

  if (!attendee) {
    return res.status(404).json({ error: "Attendee not found" });
  }

  if (attendee.marked === true) {
    return res.status(404).json({ error: "Attendee already marked!!" });
  }

  attendee.marked = true;
  writeDataFile(attendees, category);

  // Create row based on category
  let row;
  if (category === 'executives') {
    // New format: Timestamp | ID | Name | Category | Marked
    row = [
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      attendee.id,
      attendee.name,
      attendee.category,
      "Yes"
    ];
  } else {
    
    // For golden-jubilee and silver-jubilee
    // New format: Timestamp | ID | Name | Category | Branch | Seat No | Year | Coupon code | Payment method
    row = [
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      attendee.id,
      attendee.name,
      attendee.category,
      attendee.branch,
      attendee.seatNumber,
      attendee.year,
      couponCode || "",
      paymentMethod || "No Payment"
    ];
  }

  // Append to category-specific attendance log file
  const attendanceLogPath = getAttendanceLogPath(category);
  let logs = [];
  if (fs.existsSync(attendanceLogPath)) {
    logs = JSON.parse(fs.readFileSync(attendanceLogPath, "utf-8"));
  }
  
  if (category === 'executives') {
    logs.push({
      timestamp: row[0],
      id: row[1],
      name: row[2],
      category: row[3],
      marked: row[4]
    });
  } else {
    logs.push({
      timestamp: row[0],
      id: row[1],
      name: row[2],
      category: row[3],
      branch: row[4],
      seatNumber: row[5],
      year: row[6],
      couponCode: row[7],
      paymentMethod: row[8],
    });
  }
  fs.writeFileSync(attendanceLogPath, JSON.stringify(logs, null, 2));

  // Also append to Google Sheet with category-specific ID
  if (!sheets) {
    return res.status(500).json({ error: "Google Sheets not initialized" });
  }

  const sheetId = getSheetId(category);

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: category === 'executives' ? "Sheet1!A:E" : "Sheet1!A:I",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Google Sheets append failed:", err.message);
    res.status(500).json({ error: "Failed to write to Google Sheet" });
  }
});

// POST /register - Register a new attendee and mark attendance
router.post("/register", async (req, res) => {
  const { name, branch, year, seatNumber, couponCode, paymentMethod, category } = req.body;

  if (!name || !branch || !year || !seatNumber || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!['golden-jubilee', 'silver-jubilee'].includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  // Load attendees
  const dataPath = getDataPath(category);
  let attendees = [];
  if (fs.existsSync(dataPath)) {
    attendees = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  }

  // Generate new ID
  const newId = attendees.length > 0 ? Math.max(...attendees.map(a => a.id || 0)) + 1 : 1;

  // Create new attendee
  const newAttendee = {
    id: newId,
    name,
    category,
    branch,
    year,
    seatNumber,
    marked: true
  };
  attendees.push(newAttendee);
  writeDataFile(attendees, category);

  // Prepare row for logs and sheet
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true });
  const row = [
    timestamp,
    newId,
    name,
    category,
    branch,
    seatNumber,
    year,
    couponCode || "",
    paymentMethod || "No Payment"
  ];

  // Append to attendance log JSON
  const attendanceLogPath = getAttendanceLogPath(category);
  let logs = [];
  if (fs.existsSync(attendanceLogPath)) {
    logs = JSON.parse(fs.readFileSync(attendanceLogPath, "utf-8"));
  }
  logs.push({
    timestamp: row[0],
    id: row[1],
    name: row[2],
    category: row[3],
    branch: row[4],
    seatNumber: row[5],
    year: row[6],
    couponCode: row[7],
    paymentMethod: row[8],
  });
  fs.writeFileSync(attendanceLogPath, JSON.stringify(logs, null, 2));

  // Append to Google Sheet
  if (!sheets) {
    return res.status(500).json({ error: "Google Sheets not initialized" });
  }
  const sheetId = getSheetId(category);
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A:I",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });
    res.json({ success: true, attendee: newAttendee });
  } catch (err) {
    console.error("❌ Google Sheets append failed (register):", err.message);
    res.status(500).json({ error: "Failed to write to Google Sheet" });
  }
});


// GET /attendance/:category - Get attendance log for a specific category
router.get("/:category", (req, res) => {
  const { category } = req.params;
  
  if (!['golden-jubilee', 'silver-jubilee', 'executives'].includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }
  
  const attendanceLogPath = getAttendanceLogPath(category);
  
  try {
    if (fs.existsSync(attendanceLogPath)) {
      const logs = JSON.parse(fs.readFileSync(attendanceLogPath, "utf-8"));
      res.json(logs);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error("Error reading attendance log:", err);
    res.status(500).json({ error: "Failed to read attendance log" });
  }
});

// GET /attendance - Get all attendance logs
router.get("/", (req, res) => {
  try {
    const allLogs = {};
    
    ['golden-jubilee', 'silver-jubilee', 'executives'].forEach(category => {
      const attendanceLogPath = getAttendanceLogPath(category);
      if (fs.existsSync(attendanceLogPath)) {
        allLogs[category] = JSON.parse(fs.readFileSync(attendanceLogPath, "utf-8"));
      } else {
        allLogs[category] = [];
      }
    });
    
    res.json(allLogs);
  } catch (err) {
    console.error("Error reading attendance logs:", err);
    res.status(500).json({ error: "Failed to read attendance logs" });
  }
});

export default router;
