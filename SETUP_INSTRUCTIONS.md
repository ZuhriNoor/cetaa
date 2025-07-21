# CETAA Event Registration System - Setup Instructions

## Environment Variables Required

Add the following variables to your `backend/.env` file:

```env
# Google Sheets IDs for different categories
GOOGLE_SHEETS_ID1=your_golden_jubilee_sheet_id_here
GOOGLE_SHEET_ID2=your_silver_jubilee_sheet_id_here
GOOGLE_SHEET_ID3=your_executives_sheet_id_here

# Google Credentials (JSON string)
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"your-project-id",...}

# Server Configuration
PORT=5000
```

## Data Structure Changes

### Golden Jubilee & Silver Jubilee Members
- **File**: `backend/data/golden-jubilee.json` and `backend/data/silver-jubilee.json`
- **Fields**: id, name, category, branch, year, seatNumber, marked

### Executives & Volunteers
- **File**: `backend/data/executives.json`
- **Fields**: id, name, category, marked

### Attendance Logs (Separate by Category)
- **Golden Jubilee**: `backend/data/golden-jubilee-attendance.json`
- **Silver Jubilee**: `backend/data/silver-jubilee-attendance.json`
- **Executives**: `backend/data/executives-attendance.json`

## Google Sheets Structure

### Golden Jubilee & Silver Jubilee Sheets
Columns: Timestamp, ID, Name, Category, Branch, Seat No, Year, Coupon Code, Payment Method

### Executives Sheet
Columns: Timestamp, ID, Name, Category, Marked

## API Endpoints

### Attendance Endpoints
- `GET /attendance/:category` - Get attendance logs for a specific category
- `GET /attendance` - Get all attendance logs across all categories
- `POST /attendance` - Mark attendance for an attendee

### Google Sheets Endpoints
- `GET /sheets/:category` - Get data from Google Sheets for a specific category
- `GET /sheets` - Get data from all Google Sheets


## Running the Application

1. Set up your environment variables in `backend/.env`
2. Start the backend: `cd backend && npm start`
3. Start the frontend: `cd frontend && npm run dev`
4. Access the application at `http://localhost:5173`
