// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import attendeesRoutes from "./routes/attendees.js";
import attendanceRoutes from "./routes/attendance.js";
import sheetsRoutes from "./routes/sheets.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const allowedOrigins = [
  "http://localhost:8080",
  "https://cetaa.vercel.app"
];

const app = express();
app.use(
  cors({
    origin: allowedOrigins
  })
);
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

app.use("/attendees", attendeesRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/sheets", sheetsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
