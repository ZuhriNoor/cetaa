import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { google } from "googleapis";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, "..", ".env") });

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

// Google Sheets client init
let sheets = null;
(async () => {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const authClient = await auth.getClient();
    sheets = google.sheets({ version: "v4", auth: authClient });

    console.log("✅ Google Sheets client initialized for reading");
  } catch (err) {
    console.error("❌ Failed to initialize Google Sheets for reading:", err);
  }
})();

// GET /sheets/:category - Get data from Google Sheets for a specific category
router.get("/:category", async (req, res) => {
  const { category } = req.params;
  
  if (!['golden-jubilee', 'silver-jubilee', 'executives', 'other-alumni'].includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }
  
  if (!sheets) {
    return res.status(500).json({ error: "Google Sheets not initialized" });
  }

  const sheetId = getSheetId(category);
  
  try {
    // Determine the range based on category
    let range = "Sheet1!A:I";
    if (category === 'executives') range = "Sheet1!A:E";
    if (category === 'other-alumni') range = "Sheet1!A:L";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    });

    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return res.json([]);
    }

    // Convert rows to objects based on category
    let data = [];
    if (category === 'executives') {
      // Format: Timestamp, ID, Name, Category, Marked
      data = rows.slice(1).map(row => ({
        timestamp: row[0] || '',
        id: row[1] || '',
        name: row[2] || '',
        category: row[3] || '',
        marked: row[4] || ''
      }));
    } else if (category === 'other-alumni') {
      // Format: Timestamp, ID, Name, Category, Branch, Year, Coupon Code, Payment Method, Receipt Number, Last Digit of Transaction, Number of Family Members, Amount
      data = rows.slice(1).map(row => ({
        timestamp: row[0] || '',
        id: row[1] || '',
        name: row[2] || '',
        category: row[3] || '',
        branch: row[4] || '',
        year: row[5] || '',
        couponCode: row[6] || '',
        paymentMethod: row[7] || '',
        receiptNumber: row[8] || '',
        transactionLastDigit: row[9] || '',
        numberOfFamilyMembers: row[10] || '',
        amount: row[11] || ''
      }));
    } else {
      // Format: Timestamp, ID, Name, Category, Branch, Seat No, Year, Coupon Code, Payment Method
      data = rows.slice(1).map(row => ({
        timestamp: row[0] || '',
        id: row[1] || '',
        name: row[2] || '',
        category: row[3] || '',
        branch: row[4] || '',
        seatNumber: row[5] || '',
        year: row[6] || '',
        couponCode: row[7] || '',
        paymentMethod: row[8] || ''
      }));
    }
    // Sort by id numerically
    data.sort((a, b) => Number(a.id) - Number(b.id));
    res.json(data);
  } catch (err) {
    console.error("❌ Google Sheets read failed:", err.message);
    res.status(500).json({ error: "Failed to read from Google Sheet" });
  }
});

// GET /sheets - Get data from all Google Sheets
router.get("/", async (req, res) => {
  if (!sheets) {
    return res.status(500).json({ error: "Google Sheets not initialized" });
  }

  try {
    const allData = {};
    
    for (const category of ['golden-jubilee', 'silver-jubilee', 'executives', 'other-alumni']) {
      const sheetId = getSheetId(category);
      let range = "Sheet1!A:I";
      if (category === 'executives') range = "Sheet1!A:E";
      if (category === 'other-alumni') range = "Sheet1!A:L";
      
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: range,
        });

        const rows = response.data.values || [];
        
        if (rows.length > 0) {
          if (category === 'executives') {
            allData[category] = rows.slice(1).map(row => ({
              timestamp: row[0] || '',
              id: row[1] || '',
              name: row[2] || '',
              category: row[3] || '',
              marked: row[4] || ''
            }));
          } else if (category === 'other-alumni') {
            allData[category] = rows.slice(1).map(row => ({
              timestamp: row[0] || '',
              id: row[1] || '',
              name: row[2] || '',
              category: row[3] || '',
              branch: row[4] || '',
              year: row[5] || '',
              couponCode: row[6] || '',
              paymentMethod: row[7] || '',
              receiptNumber: row[8] || '',
              transactionLastDigit: row[9] || '',
              numberOfFamilyMembers: row[10] || '',
              amount: row[11] || ''
            }));
          } else {
            allData[category] = rows.slice(1).map(row => ({
              timestamp: row[0] || '',
              id: row[1] || '',
              name: row[2] || '',
              category: row[3] || '',
              branch: row[4] || '',
              seatNumber: row[5] || '',
              year: row[6] || '',
              couponCode: row[7] || '',
              paymentMethod: row[8] || ''
            }));
          }
          // Sort by id numerically
          allData[category].sort((a, b) => Number(a.id) - Number(b.id));
        } else {
          allData[category] = [];
        }
      } catch (err) {
        console.error(`\u274c Failed to read ${category} sheet:`, err.message);
        allData[category] = [];
      }
    }
    
    res.json(allData);
  } catch (err) {
    console.error("\u274c Google Sheets read failed:", err.message);
    res.status(500).json({ error: "Failed to read from Google Sheets" });
  }
});

export default router;