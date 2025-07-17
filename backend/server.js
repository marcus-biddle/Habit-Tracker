import express, { json } from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(json());

// Configuration
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const FIRST_USER_COLUMN = 'E';

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

// Helper function to get user columns
const getUserColumns = (users) => {
  return Object.keys(users).reduce((acc, userName, index) => {
    const columnIndex = FIRST_USER_COLUMN.charCodeAt(0) + index;
    acc[userName] = String.fromCharCode(columnIndex);
    return acc;
  }, {});
};

/**
 * Format date to match the format in sheet (M/D/YY)
 */
function formatDateForSheet(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
}

/**
 * Find existing date row or create a new one
 */
async function findOrCreateDateRow(selectedSheet, targetDate) {
  try {
    // Get all data from the sheet
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${selectedSheet}?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const rows = data.values || [];
    
    // Look for existing row with this date
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row[3] && row[3] === targetDate) { // Column D contains the date
        return {rowIndex: i + 1, users: getUsers(data)}; // Convert to 1-based index
      }
    }
    
    // If not found, create a new row
    return {rowIndex: await createNewDateRow(selectedSheet, targetDate), users: getUsers(data)};
    
  } catch (error) {
    console.error('Error finding/creating date row', error);
    throw error;
  }
}

/**
 * Create a new row for a date
 */
async function createNewDateRow(selectedSheet, targetDate) {
  try {
    const targetDateObj = new Date(targetDate);
    const year = targetDateObj.getFullYear();
    const quarter = Math.floor(targetDateObj.getMonth() / 3) + 1;
    const month = targetDateObj.toLocaleString('default', { month: 'short' });
    const formattedDate = formatDateForSheet(targetDateObj);
    
    // Get current data to find the next row
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${selectedSheet}!A:A?key=${API_KEY}`
    );
    
    const data = await response.json();
    const nextRow = (data.values?.length || 0) + 1;
    
    // Prepare the new row data
    const newRowData = [
      [year, `Q${quarter} ${year}`, `${month} ${year}`, formattedDate]
    ];
    
    // Insert the new row
    // const updateResponse = await fetch(
    //   `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${selectedSheet}!A${nextRow}:D${nextRow}?valueInputOption=USER_ENTERED&key=${API_KEY}`,
    //   {
    //     method: 'PUT',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       values: newRowData
    //     })
    //   }
    // );
    
    // if (!updateResponse.ok) {
    //   throw new Error(`Failed to create new row: ${updateResponse.status}`);
    // }
    
    return nextRow;
    
  } catch (error) {
    console.error('Error creating new date row', error);
    throw error;
  }
}

/**
 * Update a specific cell in the sheet
 */
async function updateCell(selectedSheet, range, value) {
  console.log(selectedSheet, range, value);
  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${selectedSheet}!${range}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[value]],
      },
    });

    // Google API returns response data directly (no .ok, no .json())
    // You can check response.status if you want, but usually errors throw automatically.

    console.log('Update response:', response.data || response);
    return response.data || response;

  } catch (error) {
    console.error('Error updating cell', error);
    throw error;
  }
}


/**
 * Main function to add/update a score in Google Sheets
 */
async function updatePushUpScore(sheet, date, userName, score, operation = 'update') {
  try {
    // Convert target date to match the format in sheet
    const targetDateObj = new Date();
    const targetDate = formatDateForSheet(targetDateObj);

    // First, find or create the row for the given date
    const {rowIndex, users} = await findOrCreateDateRow(sheet, targetDate);
    
    // Get the column for the user
    const USER_COLUMNS = getUserColumns(users);
    const userColumn = USER_COLUMNS[userName];
    if (!userColumn) {
      throw new Error(`Invalid user ID: ${userName}`);
    }

    console.log(USER_COLUMNS, userColumn)

    const existingScore = users[userName].find(x => x.date === targetDate)
    const totalScore = existingScore !== undefined ? score + existingScore.score : score;
    console.log('EXISRI', targetDate, existingScore, users[userName].slice(-10))
    
    // // Update the specific cell
    const range = `${userColumn}${rowIndex}`;
    const value = operation === 'delete' ? 0 : totalScore;
    
    await updateCell(sheet, range, value);
    
    console.log(`Successfully ${operation}d score for ${userName} on ${date}`);
    return { success: true, rowIndex, range, value };
    
  } catch (error) {
    console.error('Error updating push-up score', error);
    throw error;
  }
}

// API Routes

/**
 * GET /api/sheets/:sheetName
 * Get all data from a specific sheet
 */
app.get('/api/sheets/:sheetName', async (req, res) => {
  try {
    const { sheetName } = req.params;
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    res.json({
      success: true,
      data: data.values || [],
      sheet: sheetName
    });
    
  } catch (error) {
    console.error('Error fetching sheet data', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/scores/update
 * Update or add a push-up score
 */
app.post('/api/scores/update', async (req, res) => {
  try {
    const { sheet, date, userName, score, operation } = req.body;
    
    // Validate required fields
    if (!sheet || !date || !userName || score === undefined || operation === 'update' | 'delete') {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sheet, date, userName, score, userData'
      });
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    // Validate score is a number
    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({
        success: false,
        error: 'Score must be a non-negative number'
      });
    }

    console.log(sheet, date, userName, score)
    
    const result = await updatePushUpScore(sheet, date, userName, score, operation);
    
    res.json({
      success: true,
      message: `Score updated successfully for ${userName} on ${date}`,
      data: result
    });
    
  } catch (error) {
    console.error('Error updating score', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/scores/delete
 * Delete a push-up score (set to empty)
 */
app.delete('/api/scores/delete', async (req, res) => {
  try {
    const { sheet, date, userName, userData } = req.body;
    
    // Validate required fields
    if (!sheet || !date || !userName || !userData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sheet, date, userName, userData'
      });
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    const result = await updatePushUpScore(sheet, date, userName, 0, 'delete');
    
    res.json({
      success: true,
      message: `Score deleted successfully for ${userName} on ${date}`,
      data: result
    });
    
  } catch (error) {
    console.error('Error deleting score', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/:sheetName
 * Get user configuration from sheet headers
 */

const getUsers = (data) => {
    const rows = data.values || [];
    
    // Parse the data structure
    const users = {};
    
    if (rows.length > 4) {
      // Row 5 (index 4) contains the names
      const nameRow = rows[4];
      
      // Find name columns (skip first 4 columns: Yr, Qtr Yr, Mo Yr, Date)
      const nameColumns = {};
      
      for (let colIndex = 4; colIndex < nameRow.length; colIndex++) {
        const name = nameRow[colIndex];
        if (name && name.trim()) {
          nameColumns[colIndex] = name.trim();
          users[name.trim()] = [];
        }
      }
      
      // Process data rows (starting from row 6, index 5)
      for (let rowIndex = 5; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        if (row.length > 3) {
          const date = row[3]; // Column D contains dates
          
          if (date && date.trim()) {
            
            const parsedDate = new Date(date.trim());
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Strip time to compare only the date
            parsedDate.setHours(0, 0, 0, 0);

            if (parsedDate > today) continue;

            // For each person column, check if there's a score
            Object.entries(nameColumns).forEach(([colIndex, personName]) => {
              const rawScore = row[parseInt(colIndex)];
              const score = rawScore ? Number(rawScore.replace(/,/g, '')) : 0;
              if (score && !isNaN(Number(score))) {
                users[personName].push({
                  name: personName,
                  date: date.trim(),
                  score: score 
                });
              }
            });
          }
        }
      }
    }
    return users;
};

app.get('/api/users/:sheetName', async (req, res) => {
  try {
    const { sheetName } = req.params;
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const users = getUsers(data);
    
    res.json({
      success: true,
      users,
      totalUsers: Object.keys(users).length
    });
    
  } catch (error) {
    console.error('Error fetching users', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// /**
//  * GET /api/health
//  * Health check endpoint
//  */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Push-up Tracker API is running',
    timestamp: new Date().toISOString(),
    spreadsheetId: SPREADSHEET_ID ? 'configured' : 'not configured',
    apiKey: API_KEY ? 'configured' : 'not configured'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Push-up Tracker API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});