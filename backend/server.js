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
    console.log(sheet, date, userName, score, operation)
    
   if (
  !sheet ||
  !date ||
  !userName ||
  score === undefined ||
  (operation !== 'update' && operation !== 'delete')
  ) {
    console.log('Missing required fields or invalid operation');
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: sheet, date, userName, score, or invalid operation',
    });
  }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    console.log('dateRegex outside', dateRegex)
    if (!dateRegex.test(date)) {
      console.log('dateRegex inside', dateRegex)
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    // Validate score is a number
    if (typeof score !== 'number' || score < 0) {
      console.log('failed score validation')
      return res.status(400).json({
        success: false,
        error: 'Score must be a non-negative number'
      });
    }
    
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
    
    if (rows.length > 3) {
      const nameRow = rows[3];
      
      const names = [];
      
      for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
        const name = rows[rowIndex][3];
        if (name && name !== ' ') {
          names.push(name);
        }
      }

      return names;
    }

    return;
};

// GET  all users that are on spreadsheet
app.get('/api/users/all/sheets/:sheetName', async (req, res) => {
  try {
    const { sheetName } = req.params;
    console.log(sheetName)
    
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

function getColumnLetter(index) {
  let letter = "";
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

// GET  specific user data for each sheet
app.get('/api/users/:userName', async (req, res) => {
  try {
    const sheetNames = ['Push', 'Pull', 'Run'];
    const { userName } = req.params;

    // Step 1: Get headers from all sheets (row 5)
    const headerRanges = sheetNames.map(sheet => `${sheet}!5:5`);
    const headerResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: headerRanges,
    });

    // Step 2: Find the start (D) and end column (userName) indexes for each sheet; prepare data ranges
    const dataRanges = [];

    headerResponse.data.valueRanges.forEach((vr, i) => {
      if (!vr.values || !vr.values[0]) return;
      const headers = vr.values[0];
      const dateColIndex = headers.indexOf('Date');
      const valueColIndex = headers.indexOf(userName);
      if (dateColIndex === -1 || valueColIndex === -1) return;

      // Column letters from D(4th col) to user's column for full coverage
      const startColLetter = 'D'; // Column D is index 3 (0-based)
      // Function to convert valueColIndex (0-based) to column letter:
      const getColumnLetter = (col) => {
        let letter = '';
        while (col >= 0) {
          letter = String.fromCharCode((col % 26) + 65) + letter;
          col = Math.floor(col / 26) - 1;
        }
        return letter;
      };
      const endColLetter = getColumnLetter(valueColIndex);
      dataRanges.push(`${sheetNames[i]}!${startColLetter}6:${endColLetter}`);
    });

    if (dataRanges.length === 0) {
      return res.status(404).json({ success: false, message: 'Columns not found in any sheet' });
    }

    // Step 3: Fetch data ranges based on above
    const dataResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: dataRanges,
      majorDimension: 'ROWS',
      valueRenderOption: 'FORMATTED_VALUE',
    });

    // Step 4: Process rows, padding each to full column length before extracting date and user value
    const results = [];

    dataResponse.data.valueRanges.forEach((rangeData, i) => {
      const rows = rangeData.values || [];
      const headers = headerResponse.data.valueRanges[i].values[0];
      const dateColIndex = headers.indexOf('Date');
      const valueColIndex = headers.indexOf(userName);
      const expectedLength = valueColIndex - 3 + 1; // 'D' is column 3 index, coverage length

      rows.forEach(row => {
        // Pad row to expected length for empty cells
        const paddedRow = [...row];
        while (paddedRow.length < expectedLength) {
          paddedRow.push('');
        }
        const date = paddedRow[0] || null; // Date is first in range D6...
        const value = paddedRow[expectedLength - 1] || 0; // User column is last

        results.push({
          sheet: rangeData.range.split('!')[0],
          date,
          value,
        });
      });
    });

    // Return JSON response with results including empty cells as empty strings
    res.json({
      success: true,
      data: results,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
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