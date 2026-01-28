# Architecture & Code Structure

## Complete Overview of Time Log System

### Directory Structure
```
ojt-tracking-system/
├── frontend/
│   └── src/
│       ├── pages/
│       │   └── Dashboard.jsx          (Time log UI & handlers)
│       ├── context/
│       │   └── TimeLogContext.jsx     (API functions & state)
│       └── api/
│           └── axios.jsx              (API client)
│
└── backend/
    └── src/
        ├── controllers/
        │   └── timeLogController.js   (Business logic)
        ├── routes/
        │   └── timeLogRoutes.js       (API endpoints)
        ├── models/
        │   └── TimeLog.js             (Database schema)
        └── middleware/
            └── authMiddleware.js      (Auth protection)
```

---

## Component Hierarchy

```
App
└── Dashboard
    ├── Uses: TimeLogContext (logs, fetchLogs, timeIn, timeOut, deleteLog)
    ├── Uses: AuthContext (logout)
    │
    └── Renders:
        ├── Navigation Bar
        ├── Header with Status
        ├── Stats Cards
        │   ├── Total Hours
        │   ├── Remaining Hours
        │   └── Completion %
        ├── Logs Table
        │   └── Each row can be deleted
        ├── Calendar
        │
        └── Modals:
            ├── Time In Modal → handleTimeIn()
            ├── Time Out Modal → handleTimeOut()
            ├── Delete Confirmation → confirmDelete()
            └── Logout Confirmation → handleLogout()
```

---

## State Management Flow

### TimeLogContext (Central State)
```
TimeLogContext
├── logs (array)
│   └── [
│       {
│         _id: "507f...",
│         user: "507f...",
│         date: "2025-01-28",
│         timeIn: "2025-01-28T09:30:45.123Z",
│         timeOut: "2025-01-28T17:45:30.456Z",
│         totalHours: 8.25
│       },
│       ...more logs
│     ]
├── remainingHours (number)
├── loading (boolean)
│
└── Functions:
    ├── fetchLogs()      → GET /timelog/logs
    ├── timeIn()         → POST /timelog/time-in
    ├── timeOut()        → POST /timelog/time-out
    └── deleteLog(id)    → DELETE /timelog/log/:logId
```

### Dashboard Local State
```
Dashboard
├── modals (object)
│   ├── timeIn: boolean
│   ├── timeOut: boolean
│   ├── delete: boolean
│   └── logout: boolean
├── activeSession (object or null)
│   ├── logId: string
│   └── date: string
├── apiError (string or null)
├── isProcessing (boolean)
├── logToDelete (string or null)
├── showProfileMenu (boolean)
└── sessionForm (object)
    ├── date: string
    └── time: string
```

---

## API Request/Response Flow

### Request 1: Clock In
```
Frontend (Dashboard.jsx)
  │
  ├─ User clicks "Time In" button
  │
  ├─ openTimeInModal() sets modal state
  │
  ├─ User confirms in modal
  │
  └─ handleTimeIn() called
     │
     ├─ setIsProcessing(true)
     ├─ setApiError(null)
     │
     └─ await timeIn() [from TimeLogContext]
        │
        └─ API.post("/timelog/time-in")
           │
           └── Backend (timeLogController.js)
              │
              ├─ Get userId from authMiddleware
              ├─ Get today's date
              ├─ Check if already clocked in
              ├─ Create new TimeLog
              └─ Return created log
           │
           ← Response: Created TimeLog object
        │
        ├─ await fetchLogs() [from TimeLogContext]
        │  │
        │  ├─ API.get("/timelog/logs")
        │  │
        │  └── Backend returns all user's logs
        │     │
        │     └─ setLogs() updates context state
        │
        ├─ Close modal
        └─ UI re-renders with new log
```

### Request 2: Clock Out
```
Frontend (Dashboard.jsx)
  │
  ├─ User clicks "Time Out" button
  │
  ├─ openTimeOutModal() sets modal state
  │
  ├─ User confirms in modal
  │
  └─ handleTimeOut() called
     │
     ├─ checkActiveSession() validates clock-in exists
     │
     ├─ setIsProcessing(true)
     ├─ setApiError(null)
     │
     └─ await timeOut() [from TimeLogContext]
        │
        └─ API.post("/timelog/time-out")
           │
           └── Backend (timeLogController.js)
              │
              ├─ Get userId from authMiddleware
              ├─ Get today's date
              ├─ Find today's log for user
              ├─ Record timeOut = now
              ├─ Calculate totalHours
              ├─ Save to database
              └─ Return updated log
           │
           ← Response: Updated TimeLog with totalHours
        │
        ├─ await fetchLogs() [from TimeLogContext]
        │  │
        │  └─ Updates logs in context state
        │
        ├─ Close modal
        └─ UI re-renders with updated log
```

### Request 3: Delete Log
```
Frontend (Dashboard.jsx)
  │
  ├─ User clicks delete button on log row
  │
  ├─ handleDelete(logId) called
  │  │
  │  ├─ setLogToDelete(logId)
  │  └─ setModals({ delete: true })
  │
  ├─ User sees confirmation modal
  │
  ├─ User clicks "Delete" button
  │
  └─ confirmDelete() called
     │
     ├─ setIsProcessing(true)
     ├─ setApiError(null)
     │
     └─ await deleteLog(logToDelete) [from TimeLogContext]
        │
        └─ API.delete(`/timelog/log/${logId}`)
           │
           └── Backend (timeLogController.js)
              │
              ├─ Get userId from authMiddleware
              ├─ Get logId from route params
              ├─ Find log and verify user ownership
              ├─ Delete from database
              └─ Return success message
           │
           ← Response: { message: "Log deleted successfully" }
        │
        ├─ await fetchLogs() [from TimeLogContext]
        │  │
        │  └─ Updates logs in context state
        │
        ├─ Close modal
        ├─ Clear logToDelete
        └─ UI re-renders without deleted log
```

---

## Data Persistence

### Database (MongoDB)

**TimeLog Collection:**
```javascript
{
  _id: ObjectId,
  user: ObjectId(ref: User),
  date: String,           // "2025-01-28"
  timeIn: Date,          // Full timestamp
  timeOut: Date,         // Full timestamp or null
  totalHours: Number,    // null or calculated
  createdAt: Date,
  updatedAt: Date
}
```

**Index:**
```javascript
TimeLogSchema.index({ user: 1, date: 1 })
// Allows efficient queries like:
// db.timelogs.find({ user: userId, date: "2025-01-28" })
```

---

## Request/Response Examples

### Clock In - Success
```
REQUEST:
POST /api/timelog/time-in
Headers: {
  Authorization: "Bearer eyJhbGc...",
  Content-Type: "application/json"
}

RESPONSE (201 Created):
{
  "_id": "507f1f77bcf86cd799439011",
  "user": "507f1f77bcf86cd799439012",
  "date": "2025-01-28",
  "timeIn": "2025-01-28T09:30:45.123Z",
  "totalHours": 0,
  "createdAt": "2025-01-28T09:30:45.123Z",
  "updatedAt": "2025-01-28T09:30:45.123Z"
}
```

### Clock In - Already Clocked In
```
RESPONSE (400 Bad Request):
{
  "message": "Already timed in today"
}
```

### Clock Out - Success
```
REQUEST:
POST /api/timelog/time-out
Headers: { Authorization: "Bearer eyJhbGc..." }

RESPONSE (200 OK):
{
  "_id": "507f1f77bcf86cd799439011",
  "user": "507f1f77bcf86cd799439012",
  "date": "2025-01-28",
  "timeIn": "2025-01-28T09:30:45.123Z",
  "timeOut": "2025-01-28T17:45:30.456Z",
  "totalHours": 8.25,
  "updatedAt": "2025-01-28T17:45:30.456Z"
}
```

### Get Logs - Success
```
REQUEST:
GET /api/timelog/logs
Headers: { Authorization: "Bearer eyJhbGc..." }

RESPONSE (200 OK):
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "date": "2025-01-28",
    "timeIn": "2025-01-28T09:30:45.123Z",
    "timeOut": "2025-01-28T17:45:30.456Z",
    "totalHours": 8.25
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "date": "2025-01-27",
    "timeIn": "2025-01-27T08:00:00.000Z",
    "timeOut": "2025-01-27T16:30:00.000Z",
    "totalHours": 8.5
  }
]
```

### Delete Log - Success
```
REQUEST:
DELETE /api/timelog/log/507f1f77bcf86cd799439011
Headers: { Authorization: "Bearer eyJhbGc..." }

RESPONSE (200 OK):
{
  "message": "Log deleted successfully"
}
```

### Delete Log - Not Found
```
RESPONSE (404 Not Found):
{
  "message": "Log not found"
}
```

---

## Middleware Chain

```
Request
  │
  ├─ Express routing
  │   └─ Match: /api/timelog/:path
  │
  └─ authMiddleware
     │
     ├─ Check Authorization header
     ├─ Verify JWT token
     ├─ Extract userId
     ├─ Set req.user = { userId: "..." }
     │
     └─ ✓ Pass to controller
        │
        └─ Controller function
           │
           ├─ Access req.user.userId
           ├─ Query database
           ├─ Send response
           │
           └─ Response
              │
              ├─ JSON stringify
              ├─ Set status code
              └─ Send to client
```

---

## Error Handling Chain

```
User Action (e.g., Click "Delete")
  │
  ├─ Frontend: try-catch block
  │  │
  │  ├─ API call
  │  │
  │  └─ catch (error)
  │     │
  │     ├─ Extract: error.response?.data?.message
  │     ├─ Fallback: Generic message
  │     ├─ setApiError(message)
  │     └─ console.error(error)
  │
  └─ Display error in modal
     │
     └─ User can retry or cancel
```

---

## Time Calculation Logic

### On Time Out
```javascript
// Backend (timeLogController.js)
const diffMs = log.timeOut - log.timeIn;
// Converts: Date objects to milliseconds
// Example: 1704816330000 - 1704787200000 = 29130000 ms

log.totalHours = +(diffMs / (1000 * 60 * 60)).toFixed(2);
// Step 1: diffMs / 1000 = seconds
//         29130000 / 1000 = 29130 seconds
// Step 2: seconds / 60 = minutes
//         29130 / 60 = 485.5 minutes
// Step 3: minutes / 60 = hours
//         485.5 / 60 = 8.0916... hours
// Step 4: .toFixed(2) = round to 2 decimals
//         "8.09"
// Step 5: + = convert to number
//         8.09
```

### Display on Frontend
```javascript
// In logs table
log.totalHours.toFixed(2)  // "8.09"
// or
log.totalHours            // 8.09 (already rounded)

// In stat card
totalHours.toFixed(1)     // "18.4" (1 decimal)
```

---

## Authentication & Authorization

### Time In/Out
- ✓ Any authenticated user can clock in/out
- ✓ Only one active clock-in per day
- ✓ Can only clock out if clocked in

### View Logs
- ✓ Can only see own logs
- ✓ Backend filters by userId

### Delete Log
- ✓ Can only delete own logs
- ✓ Backend verifies ownership:
  ```javascript
  const log = await TimeLog.findOne({ _id: logId, user: userId });
  if (!log) return res.status(404).json({ message: "Log not found" });
  ```

---

## Performance Optimizations

1. **Batch API Calls**
   - After time in/out/delete, call fetchLogs() once
   - Don't make separate API calls for logs update

2. **Loading State**
   - Prevent button clicks during API call
   - Show spinner to user
   - Clear state after response

3. **Error State**
   - Only set error message on actual failure
   - Clear error when modal closes or new action starts
   - Don't re-fetch logs if deletion fails

4. **Active Session Detection**
   - Use useEffect to auto-detect from logs
   - Don't rely on separate API call
   - Efficient .find() on client-side array

5. **Database Indexing**
   - Index on { user: 1, date: 1 } for fast lookups
   - Sorting by date in getLogs()

---

## Testing Checklist

### Unit Testing Scenarios

#### Time In
- [ ] Successfully creates log
- [ ] Returns error if already clocked in
- [ ] Sets correct date (today's date)
- [ ] Stores full timestamp

#### Time Out
- [ ] Finds today's log
- [ ] Records timeOut timestamp
- [ ] Calculates totalHours correctly
- [ ] Returns error if no active clock-in
- [ ] Handles overnight shift edge case

#### Delete
- [ ] Verifies user ownership
- [ ] Actually deletes from database
- [ ] Returns 404 if log not found
- [ ] Returns 404 if user doesn't own log

#### Get Logs
- [ ] Returns only user's logs
- [ ] Sorts by date descending
- [ ] Handles no logs (empty array)

### Integration Testing Scenarios

- [ ] Clock in → see log in table
- [ ] Clock out → see updated hours
- [ ] Delete log → removed from table
- [ ] Refresh page → logs persist
- [ ] Multiple logs display correctly
- [ ] Error handling shows message to user
- [ ] Loading spinner appears during API call

### E2E Testing Scenarios

- [ ] Full flow: clock in → clock out → delete
- [ ] Active session detection on page refresh
- [ ] Profile menu still works
- [ ] Logout functionality
- [ ] Navigation to other pages and back
- [ ] Network error handling
- [ ] Session timeout handling

---

## Deployment Checklist

Frontend (.env):
```
VITE_API_URL=https://api.yourdomain.com
```

Backend (.env):
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ojt-db
JWT_SECRET=your-secret-key-here
PORT=5000
NODE_ENV=production
```

---

## Known Limitations & Future Improvements

### Current Limitations
1. Cannot edit time entries (only delete)
2. No bulk operations (delete multiple logs at once)
3. No overtime tracking
4. No break time tracking
5. Frontend time selection removed (uses server time)

### Future Improvements
1. Edit existing time entries
2. Manual time input (with admin approval)
3. Leave requests integration
4. Break time tracking
5. Shift scheduling
6. Export logs to CSV/PDF
7. Reporting dashboard with charts
8. Real-time notifications
9. Mobile app
10. Biometric clock in/out

---
