const express = require('express');
const mysql = require('mysql');

// Create Express app
const app = express();

// MySQL database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'financial_data_db'
});

// Connect to MySQL database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database as id ' + connection.threadId);
});

// Calculate start date based on the period
function calculateStartDate(period) {
    // Get the current date
    const currentDate = new Date();

    // Calculate the start date based on the period
    if (period.endsWith('y')) { // Years
        const years = parseInt(period);
        return new Date(currentDate.getFullYear() - years, 0, 1); // January 1st of (current year - years)
    } else {
        throw new Error('Unsupported time unit');
    }
}


// API endpoint for fetching data
app.get('/api', (req, res) => {
    const { ticker, columns, period } = req.query;

    // Validate query parameters
    if (!ticker || !columns || !period) {
        return res.status(400).json({ error: 'Ticker, columns, and period are required parameters' });
    }

    // Construct SQL query based on parameters
    const columnList = columns.split(',');
    const startDate = calculateStartDate(period);
    const sqlQuery = `SELECT ${columnList.map(col => `CAST(${col} AS CHAR) AS ${col}`).join(',')} FROM financial_data WHERE ticker = ? AND date >= ?`;

    // Execute SQL query
    connection.query(sqlQuery, [ticker, startDate], (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Format response
        const responseData = results.map(row => {
            const formattedRow = { ticker }; // Include ticker value in the object
            columnList.forEach(column => {
                formattedRow[column] = row[column];
            });
            return formattedRow;
        });

        res.json(responseData);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
