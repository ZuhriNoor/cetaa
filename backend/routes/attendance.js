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
    'executives': path.join(__dirname, "..", "data", "executives-attendance.json"),
    'other-alumni': path.join(__dirname, "..", "data", "other-alumni-attendance.json")
  };
  return paths[category] || paths['golden-jubilee']; // fallback
};

// Add category-based data path mapping
const getDataPath = (category) => {
  const paths = {
    'golden-jubilee': path.join(__dirname, "..", "data", "golden-jubilee.json"),
    'silver-jubilee': path.join(__dirname, "..", "data", "silver-jubilee.json"),
    'executives': path.join(__dirname, "..", "data", "executives.json"),
    'other-alumni': path.join(__dirname, "..", "data", "other-alumni.json")
  };
  return paths[category] || paths['golden-jubilee']; // fallback
};

// Add category-based sheet ID mapping
const getSheetId = (category) => {
  const sheetIds = {
    'golden-jubilee': process.env.GOOGLE_SHEETS_ID1,
    'silver-jubilee': process.env.GOOGLE_SHEETS_ID2,
    'executives': process.env.GOOGLE_SHEETS_ID3,
    'other-alumni': process.env.GOOGLE_SHEETS_ID4
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

const queueFilePath = path.join(__dirname, "..", "data", "sheets-queue.json");

// Helper to load queue from file
function loadSheetsQueue() {
  try {
    if (fs.existsSync(queueFilePath)) {
      const raw = fs.readFileSync(queueFilePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to load sheets queue from file:", err);
  }
  return [];
}
// Helper to save queue to file
function saveSheetsQueue(queue) {
  try {
    fs.writeFileSync(queueFilePath, JSON.stringify(queue, null, 2));
  } catch (err) {
    console.error("Failed to save sheets queue to file:", err);
  }
}

// --- Google Sheets File-Based Write Queue Implementation ---
let sheetsWriteQueue = loadSheetsQueue();
let isProcessingQueue = false;

// Helper to process the queue in batches
async function processSheetsQueue() {
  if (isProcessingQueue || sheetsWriteQueue.length === 0 || !sheets) return;
  isProcessingQueue = true;
  const batch = sheetsWriteQueue.slice(); // copy all

  // Group by category and sheetId
  const grouped = {};
  for (const item of batch) {
    const { category, row } = item;
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(row);
  }

  let processedIndices = [];
  for (const category of Object.keys(grouped)) {
    const sheetId = getSheetId(category);
    let range;
    if (category === 'golden-jubilee') {
      range = "Sheet1!A:L"; // 12 columns: Timestamp, ID, Name, Category, Branch, Seat No, Year, Coupon code, Payment method, Last Digit of Transaction, Number of Family Members, Image
    } else if (category === 'executives') {
      range = "Sheet1!A:G";
    } else if (category === 'other-alumni') {
      range = "Sheet1!A:L";
    } else {
      range = "Sheet1!A:L";
    }
    let retries = 0;
    let success = false;
    const rows = grouped[category];
    // Find indices in the queue for these rows
    const indices = batch
      .map((item, idx) => (item.category === category && rows.includes(item.row) ? idx : -1))
      .filter(idx => idx !== -1);
    while (!success && retries < 5) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: rows },
        });
        success = true;
      } catch (err) {
        if (err.code === 429 || err.code === 403 || err.code === 503) {
          // Rate limit or quota error, exponential backoff
          const wait = Math.pow(2, retries) * 1000 + Math.random() * 1000;
          await new Promise(res => setTimeout(res, wait));
          retries++;
        } else {
          console.error(`Google Sheets batch append failed for ${category}:`, err.message);
          break;
        }
      }
    }
    if (success) {
      processedIndices = processedIndices.concat(indices);
    }
    // If not successful, keep those items in the queue for next time
  }
  // Remove processed items from the queue
  if (processedIndices.length > 0) {
    sheetsWriteQueue = sheetsWriteQueue.filter((_, idx) => !processedIndices.includes(idx));
    saveSheetsQueue(sheetsWriteQueue);
  }
  isProcessingQueue = false;
}
// Run the queue processor every 10 seconds
setInterval(processSheetsQueue, 10000);
// --- End Google Sheets File-Based Write Queue Implementation ---

// POST /attendance
router.post("/", async (req, res) => {

  const { attendeeId, couponCode, paymentMethod, category, receiptNumber, transactionLastDigit, numberOfFamilyMembers, amount } = req.body;

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

  // Add new fields if provided
  if (receiptNumber !== undefined) attendee.receiptNumber = receiptNumber;
  if (transactionLastDigit !== undefined) attendee.transactionLastDigit = transactionLastDigit;
  if (category === 'silver-jubilee' || category === 'executives' || category === 'other-alumni') {
    if (numberOfFamilyMembers !== undefined) attendee.numberOfFamilyMembers = numberOfFamilyMembers;
    if (amount !== undefined) attendee.amount = amount;
  }

  attendee.marked = true;
  writeDataFile(attendees, category);

  // Create row based on category
  let row;
  if (category === 'golden-jubilee') {
    row = [
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      attendee.id,
      attendee.name,
      attendee.category,
      attendee.branch,
      attendee.seatNumber,
      attendee.year,
      couponCode || "",
      paymentMethod || "No Payment",
      transactionLastDigit || "",
      numberOfFamilyMembers || "",
      `=IMAGE("https://raw.githubusercontent.com/zuhrinoor/cetaa/main/backend/data/images_golden/${attendee.id}.0.jpeg")`
    ];
  } else if (category === 'executives') {
    // New format: Timestamp | ID | Name | Category | Marked | Number of Family Members | Amount
    row = [
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      attendee.id,
      attendee.name,
      attendee.category,
      "Yes",
      numberOfFamilyMembers || "",
      amount || ""
    ];
  } else if (category === 'other-alumni') {
    // Format: Timestamp | ID | Name | Category | Branch | Year | Coupon code | Payment method | Receipt Number | Last Digit of Transaction | Number of Family Members | Amount
    row = [
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      attendee.id,
      attendee.name,
      attendee.category,
      attendee.branch,
      attendee.year,
      couponCode || "",
      paymentMethod || "No Payment",
      receiptNumber || "",
      transactionLastDigit || "",
      numberOfFamilyMembers || "",
      amount || ""
    ];
  } else {
    // For golden-jubilee and silver-jubilee
    // New format: Timestamp | ID | Name | Category | Branch | Seat No | Year | Coupon code | Payment method | Receipt Number | Last Digit of Transaction | Number of Family Members | Amount
    row = [
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      attendee.id,
      attendee.name,
      attendee.category,
      attendee.branch,
      attendee.seatNumber,
      attendee.year,
      couponCode || "",
      paymentMethod || "No Payment",
      receiptNumber || "",
      transactionLastDigit || "",
      numberOfFamilyMembers || "",
      amount || ""
    ];
  }

  // Append to category-specific attendance log file
  const attendanceLogPath = getAttendanceLogPath(category);
  let logs = [];
  if (fs.existsSync(attendanceLogPath)) {
    logs = JSON.parse(fs.readFileSync(attendanceLogPath, "utf-8"));
  }

  if (category === 'golden-jubilee') {
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
      transactionLastDigit: row[9],
      numberOfFamilyMembers: row[10]
    });
  } else if (category === 'executives') {
    logs.push({
      timestamp: row[0],
      id: row[1],
      name: row[2],
      category: row[3],
      marked: row[4],
      numberOfFamilyMembers: row[5],
      amount: row[6]
    });
  } else if (category === 'other-alumni') {
    logs.push({
      timestamp: row[0],
      id: row[1],
      name: row[2],
      category: row[3],
      branch: row[4],
      year: row[5],
      couponCode: row[6],
      paymentMethod: row[7],
      receiptNumber: row[8],
      transactionLastDigit: row[9],
      numberOfFamilyMembers: row[10],
      amount: row[11]
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
      receiptNumber: row[9],
      transactionLastDigit: row[10],
      numberOfFamilyMembers: row[11],
      amount: row[12]
    });
  }
  fs.writeFileSync(attendanceLogPath, JSON.stringify(logs, null, 2));

  // Instead of writing to Google Sheets immediately, queue the row
  if (category === 'executives' || category === 'golden-jubilee' || category === 'silver-jubilee' || category === 'other-alumni') {
    sheetsWriteQueue.push({ category, row });
    saveSheetsQueue(sheetsWriteQueue);
  }
  // Respond to user immediately
  res.json({ success: true });
});

// POST /register - Register a new attendee and mark attendance
router.post("/register", async (req, res) => {
  const { name, branch, year, seatNumber, couponCode, paymentMethod, category, receiptNumber, transactionLastDigit, numberOfFamilyMembers, amount } = req.body;

  if (!name || !branch || !year || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!['golden-jubilee', 'silver-jubilee', 'executives', 'other-alumni'].includes(category)) {
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
    seatNumber: seatNumber || "",
    marked: true,
    receiptNumber: receiptNumber || "",
    transactionLastDigit: transactionLastDigit || "",
    numberOfFamilyMembers: (category === 'golden-jubilee' || category === 'silver-jubilee' || category === 'executives' || category === 'other-alumni') ? (numberOfFamilyMembers || "") : "",
    amount: (category === 'silver-jubilee' || category === 'executives' || category === 'other-alumni') ? (amount || "") : ""
  };
  attendees.push(newAttendee);
  writeDataFile(attendees, category);

  // Prepare row for logs and sheet
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true });
  let row;
  if (category === 'golden-jubilee') {
    row = [
      timestamp,
      newId,
      name,
      category,
      branch,
      seatNumber || "",
      year,
      couponCode || "",
      paymentMethod || "No Payment",
      transactionLastDigit || "",
      numberOfFamilyMembers || "",
      `=IMAGE("https://raw.githubusercontent.com/zuhrinoor/cetaa/main/backend/data/images_golden/${newId}.0.jpeg")`
    ];
  } else if (category === 'executives') {
    row = [
      timestamp,
      newId,
      name,
      category,
      "Yes",
      numberOfFamilyMembers || "",
      amount || ""
    ];
  } else if (category === 'other-alumni') {
    row = [
      timestamp,
      newId,
      name,
      category,
      branch,
      year,
      couponCode || "",
      paymentMethod || "No Payment",
      receiptNumber || "",
      transactionLastDigit || "",
      numberOfFamilyMembers || "",
      amount || ""
    ];
  } else {
    row = [
      timestamp,
      newId,
      name,
      category,
      branch,
      seatNumber || "",
      year,
      couponCode || "",
      paymentMethod || "No Payment",
      receiptNumber || "",
      transactionLastDigit || "",
      (category === 'silver-jubilee' || category === 'golden-jubilee') ? (numberOfFamilyMembers || "") : "",
      category === 'silver-jubilee' ? (amount || "") : ""
    ];
  }

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
    marked: row[4],
    numberOfFamilyMembers: row[5],
    amount: row[6]
  });
  fs.writeFileSync(attendanceLogPath, JSON.stringify(logs, null, 2));

  // Instead of writing to Google Sheets immediately, queue the row
  if (category === 'golden-jubilee' || category === 'silver-jubilee' || category === 'executives' || category === 'other-alumni') {
    sheetsWriteQueue.push({ category, row });
    saveSheetsQueue(sheetsWriteQueue);
  }
  // Respond to user immediately
  res.json({ success: true, attendee: newAttendee });
});


// GET /attendance/:category - Get attendance log for a specific category
router.get("/:category", (req, res) => {
  const { category } = req.params;
  
  if (!['golden-jubilee', 'silver-jubilee', 'executives', 'other-alumni'].includes(category)) {
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
    
    ['golden-jubilee', 'silver-jubilee', 'executives', 'other-alumni'].forEach(category => {
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
