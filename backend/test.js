// import mongoose from "mongoose";
// import Attendee from "./models/Attendee.js";

// // 👇 Connect to the 'cetaa' database
// const mongoURI = process.env.MONGODB_URI

// // Define a basic schema for the collection (adjust fields as needed)

// mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log("✅ Connected to MongoDB (database: cetaa)");

//     // Fetch all documents from the 'Attendee' collection
//     Attendee.find({})
//       .then((attendees) => {
//         console.log("📋 Attendees:", attendees);
//       })
//       .catch((err) => {
//         console.error("❌ Query error:", err);
//       });
//   })
//   .catch((err) => {
//     console.error("❌ Connection error:", err);
//   });

import express from "express"
const router = express.Router();
import {google} from "googleapis"
import dotenv from "dotenv";
dotenv.config();


const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

// const row = [
//       new Date().toLocaleString(),
//       "Deepak",
//       "what is this",
//       "no"
//   ];

    
// const auth = new google.auth.JWT(
//   SERVICE_ACCOUNT_EMAIL,
//   null,
//   PRIVATE_KEY,
//   ['https://www.googleapis.com/auth/spreadsheets']
// );
//   const sheets = google.sheets({ version: 'v4', auth });
  
// try {
//   await sheets.spreadsheets.values.append({
//       spreadsheetId: SHEET_ID,
//       range: 'Sheet1!A:F',
//       valueInputOption: 'USER_ENTERED',
//       requestBody: { values: [row] }
//     });
// } catch (error) {
//   console.log(error)
// }
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json', // Path to your downloaded JSON
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function appendRow() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = SHEET_ID; // Replace with your real sheet ID
  const range = 'Sheet1!A1'; // Change to your actual sheet name and range

  const resource = {
    values: [['Deepak', '1234567786', 'deepak@gmail.com']], // Replace with your data
  };

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource,
    });

    console.log('Row added:', response.data.updates);
  } catch (err) {
    console.error('Error appending row:', err);
  }
}

appendRow();
