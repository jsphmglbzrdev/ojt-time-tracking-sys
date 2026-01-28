# Time Log Functions Reference

## Overview
Complete guide to all time log activities and functions in the OJT Tracking System.

---

## Frontend Functions

### 1. **handleTimeIn()** - Clock In
**Location:** `frontend/src/pages/Dashboard.jsx`

```javascript
const handleTimeIn = async (e) => {
  e.preventDefault();
  setIsProcessing(true);
  setApiError(null);
  try {
    await timeIn();  // Calls TimeLogContext function
    setModals({ ...modals, timeIn: false });
    await fetchLogs();
  } catch (err) {
    const errorMsg = err.response?.data?.message || 'Failed to clock in. Please try again.';
    setApiError(errorMsg);
  } finally {
    setIsProcessing(false);
  }
};
```

**What it does:**
- Calls the `timeIn()` function from TimeLogContext
- Shows loading state while processing
- Displays error if API call fails
- Automatically refreshes logs on success

**Triggered by:**
- User clicking "Time In" button on dashboard
- User confirming in the Time In modal

---

### 2. **handleTimeOut()** - Clock Out
**Location:** `frontend/src/pages/Dashboard.jsx`

```javascript
const handleTimeOut = async (e) => {
  e.preventDefault();
  if (!activeSession) {
    setApiError('No active time-in session found');
    return;
  }

  setIsProcessing(true);
  setApiError(null);
  try {
    await timeOut();  // Calls TimeLogContext function
    setModals({ ...modals, timeOut: false });
    await fetchLogs();
  } catch (err) {
    const errorMsg = err.response?.data?.message || 'Failed to clock out. Please try again.';
    setApiError(errorMsg);
  } finally {
    setIsProcessing(false);
  }
};
```

**What it does:**
- Validates that there's an active clock-in session
- Calls the `timeOut()` function from TimeLogContext
- Backend calculates hours worked automatically
- Shows loading state and error handling
- Refreshes logs on success

**Triggered by:**
- User clicking "Time Out" button on dashboard
- User confirming in the Time Out modal

---

### 3. **handleDelete()** - Open Delete Confirmation
**Location:** `frontend/src/pages/Dashboard.jsx`

```javascript
const handleDelete = (id) => {
  setLogToDelete(id);
  setApiError(null);
  setModals({ ...modals, delete: true });
};
```

**What it does:**
- Stores the log ID to delete
- Opens delete confirmation modal
- Clears any previous error messages

**Triggered by:**
- User clicking delete button (trash icon) on a log entry

---

### 4. **confirmDelete()** - Confirm Deletion
**Location:** `frontend/src/pages/Dashboard.jsx`

```javascript
const confirmDelete = async () => {
  setIsProcessing(true);
  setApiError(null);
  try {
    await deleteLog(logToDelete);  // Calls TimeLogContext function
    setModals({ ...modals, delete: false });
    setLogToDelete(null);
  } catch (err) {
    const errorMsg = err.response?.data?.message || 'Failed to delete log. Please try again.';
    setApiError(errorMsg);
  } finally {
    setIsProcessing(false);
  }
};
```

**What it does:**
- Calls the `deleteLog()` function from TimeLogContext with the log ID
- Shows loading state while processing
- Displays error if deletion fails
- Closes modal and clears selection on success
- Automatically refreshes logs

**Triggered by:**
- User clicking "Delete" button in confirmation modal

---

### 5. **checkActiveSession()** - Detect Active Clock-In
**Location:** `frontend/src/pages/Dashboard.jsx`

```javascript
const checkActiveSession = () => {
  const today = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(log => log.date === today && !log.timeOut);
  if (todayLog) {
    setActiveSession({ logId: todayLog._id, date: today });
  } else {
    setActiveSession(null);
  }
};

useEffect(() => {
  checkActiveSession();
}, [logs]);
```

**What it does:**
- Finds any log from today that doesn't have a `timeOut` value
- Sets `activeSession` if found, clears it if not
- Automatically runs whenever logs change

**Used by:**
- Dashboard to show "Clocked In" or "Inactive" status
- Time Out handler to validate an active session exists

---

## TimeLogContext Functions

### 1. **timeIn()** - Backend Clock In Call
**Location:** `frontend/src/context/TimeLogContext.jsx`

```javascript
const timeIn = async () => {
  try {
    await API.post("/timelog/time-in");
    await fetchLogs();
  } catch (err) {
    console.error(err);
    throw err;
  }
};
```

**What it does:**
- Makes POST request to backend
- Backend creates a new TimeLog entry
- Automatically fetches updated logs on success
- Throws error if API call fails (caught by handler)

**API Call:**
- Endpoint: `POST /timelog/time-in`
- Requires: Authentication token
- Returns: Created TimeLog object

---

### 2. **timeOut()** - Backend Clock Out Call
**Location:** `frontend/src/context/TimeLogContext.jsx`

```javascript
const timeOut = async () => {
  try {
    await API.post("/timelog/time-out");
    await fetchLogs();
  } catch (err) {
    console.error(err);
    throw err;
  }
};
```

**What it does:**
- Makes POST request to backend
- Backend records time out and calculates hours
- Automatically fetches updated logs on success
- Throws error if API call fails (caught by handler)

**API Call:**
- Endpoint: `POST /timelog/time-out`
- Requires: Authentication token
- Returns: Updated TimeLog object with totalHours

---

### 3. **deleteLog()** - Backend Delete Call
**Location:** `frontend/src/context/TimeLogContext.jsx`

```javascript
const deleteLog = async (logId) => {
  try {
    await API.delete(`/timelog/log/${logId}`);
    await fetchLogs();
  } catch (err) {
    console.error(err);
    throw err;
  }
};
```

**What it does:**
- Makes DELETE request to backend with log ID
- Backend verifies user ownership and deletes log
- Automatically fetches updated logs on success
- Throws error if API call fails (caught by handler)

**API Call:**
- Endpoint: `DELETE /timelog/log/:logId`
- Requires: Authentication token
- Parameters: `logId` - The ID of the log to delete
- Returns: Success message

---

### 4. **fetchLogs()** - Fetch All Logs
**Location:** `frontend/src/context/TimeLogContext.jsx`

```javascript
const fetchLogs = async () => {
  if (!token) return;
  setLoading(true);
  try {
    const resLogs = await API.get("/timelog/logs");
    setLogs(resLogs.data);

    const resRemaining = await API.get("/timelog/remaining");
    setRemainingHours(resRemaining.data.remainingHours);

    setLoading(false);
  } catch (err) {
    console.error(err);
    setLoading(false);
  }
};
```

**What it does:**
- Fetches all logs for current user
- Sets loading state while fetching
- Updates logs and remaining hours in context
- Called automatically on mount and after each time log action

---

## Backend Controller Functions

### 1. **timeIn()** - Create Time In Log
**Location:** `backend/src/controllers/timeLogController.js`

**What it does:**
- Gets current user ID from auth middleware
- Gets today's date in YYYY-MM-DD format
- Checks if user already clocked in today
- Creates new TimeLog with `timeIn: current timestamp`
- Returns `400 Bad Request` if already clocked in

**Request:**
```
POST /timelog/time-in
Headers: Authorization: Bearer <token>
```

**Response (Success - 201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user": "507f1f77bcf86cd799439012",
  "date": "2025-01-28",
  "timeIn": "2025-01-28T09:30:45.123Z",
  "totalHours": 0
}
```

**Response (Already Clocked In - 400):**
```json
{
  "message": "Already timed in today"
}
```

---

### 2. **timeOut()** - Record Time Out
**Location:** `backend/src/controllers/timeLogController.js`

**What it does:**
- Gets current user ID from auth middleware
- Gets today's date
- Finds today's log for the user
- Records `timeOut: current timestamp`
- Calculates `totalHours = (timeOut - timeIn) / 3600 seconds`
- Saves updated log
- Returns `400 Bad Request` if no active clock-in

**Request:**
```
POST /timelog/time-out
Headers: Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user": "507f1f77bcf86cd799439012",
  "date": "2025-01-28",
  "timeIn": "2025-01-28T09:30:45.123Z",
  "timeOut": "2025-01-28T17:45:30.456Z",
  "totalHours": 8.25
}
```

**Response (No Active Clock-In - 400):**
```json
{
  "message": "No active time-in"
}
```

---

### 3. **getLogs()** - Fetch User Logs
**Location:** `backend/src/controllers/timeLogController.js`

**What it does:**
- Gets current user ID from auth middleware
- Fetches all logs for that user
- Sorts by date in descending order (newest first)
- Returns array of log objects

**Request:**
```
GET /timelog/logs
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "user": "507f1f77bcf86cd799439012",
    "date": "2025-01-28",
    "timeIn": "2025-01-28T09:30:45.123Z",
    "timeOut": "2025-01-28T17:45:30.456Z",
    "totalHours": 8.25
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "user": "507f1f77bcf86cd799439012",
    "date": "2025-01-27",
    "timeIn": "2025-01-27T08:00:00.000Z",
    "timeOut": "2025-01-27T16:30:00.000Z",
    "totalHours": 8.5
  }
]
```

---

### 4. **deleteLog()** - Delete Time Log
**Location:** `backend/src/controllers/timeLogController.js`

**What it does:**
- Gets current user ID from auth middleware
- Gets log ID from request parameters
- Verifies user owns the log (security check)
- Deletes the log from database
- Returns `404 Not Found` if log doesn't exist or user doesn't own it

**Request:**
```
DELETE /timelog/log/507f1f77bcf86cd799439011
Headers: Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "message": "Log deleted successfully"
}
```

**Response (Not Found - 404):**
```json
{
  "message": "Log not found"
}
```

---

## Data Flow Diagram

```
User Action (Button Click)
        ↓
Handler Function (handleTimeIn, handleTimeOut, confirmDelete)
        ↓
TimeLogContext Function (timeIn, timeOut, deleteLog)
        ↓
API Call to Backend
        ↓
Backend Controller Function
        ↓
Database Operation (MongoDB)
        ↓
Response to Frontend
        ↓
fetchLogs() - Refresh logs
        ↓
Update Dashboard State
        ↓
UI Re-renders with New Data
```

---

## Error Handling Strategy

All functions follow this pattern:

```
1. User initiates action (button click)
2. Clear previous errors: setApiError(null)
3. Set processing state: setIsProcessing(true)
4. Try: Make API call
5. Catch: Capture error message
   - Extract: err.response?.data?.message
   - Fallback: Generic message
   - Display: setApiError(errorMsg)
   - Log: console.error(err)
6. Finally: Clear processing state
7. Show: Error message in modal to user
```

---

## State Dependencies

- **logs** → Used to detect active session, display in table
- **remainingHours** → Displayed in stat card
- **loading** → Shows spinner during fetch
- **activeSession** → Enables/disables Time Out button
- **apiError** → Displayed in modals
- **isProcessing** → Disables buttons during API calls
- **modals** → Controls modal visibility

---

## Testing Each Function

### Test handleTimeIn()
1. Click "Time In" button
2. Confirm in modal
3. Check: Modal closes, status changes to "Clocked In", new log appears

### Test handleTimeOut()
1. Click "Time Out" button (when clocked in)
2. Confirm in modal
3. Check: Modal closes, status changes to "Inactive", hours calculated

### Test handleDelete()
1. Hover over log entry
2. Click delete (trash) button
3. Check: Delete confirmation modal appears

### Test confirmDelete()
1. In delete confirmation modal
2. Click "Delete"
3. Check: Modal closes, log removed from table

### Test checkActiveSession()
1. Clock in
2. Refresh page
3. Check: Status still shows "Clocked In" (session auto-detected)

### Test Error Handling
1. Try to clock in twice
2. Check: Error message appears in modal
3. Check: Button not disabled, can retry

---

## Performance Notes

- **fetchLogs()** is called after every action to keep data fresh
- **checkActiveSession()** runs only when logs change (not on every render)
- **Loading state** prevents user from clicking buttons during API call
- **Error state** persists until modal closes or new action starts

---

## Security Notes

- All endpoints require authentication token
- Backend verifies user ownership before deletion
- User ID extracted from token (not from request body)
- Time calculations done on backend (prevents frontend manipulation)
- Date format standardized (YYYY-MM-DD) for consistency
