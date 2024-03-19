const csvtojson = require('csvtojson');
const mysql = require("mysql");
const fs = require('fs');

// Database credentials
const hostname = "localhost";
const username = "root";
const password = "password";
const databsename = "financial_data_db";

// Establish connection to the database
const con = mysql.createConnection({
    host: hostname,
    user: username,
    password: password,
    database: databsename,
});

con.connect((err) => {
    if (err) {
        console.error('error: ' + err.message);
        return;
    }

    console.log('Connected to MySQL as id ' + con.threadId);

    // Query to create financial_data table
    const createStatement = `
        CREATE TABLE IF NOT EXISTS financial_data (
            ticker VARCHAR(10),
            date DATE,
            revenue DOUBLE,
            gp DOUBLE,
            fcf DOUBLE,
            capex DOUBLE
        )
    `;

    // Creating financial_data table
    con.query(createStatement, (err) => {
        if (err) {
            console.error("Error creating table: ", err);
            return;
        }

        console.log("Table 'financial_data' created successfully");

        // CSV file name
        const fileName = "/home/pickapeppa/Desktop/Business Quant/Sample-Data-Historic-dataChanged.csv";

        // Read CSV file and insert data into financial_data table
        fs.readFile(fileName, 'utf-8', (err, data) => {
            if (err) {
                console.error("Error reading CSV file:", err);
                return;
            }

            // Convert date format from "yyyy/mm/dd" to "yyyy-mm-dd"
            const transformedData = data.replace(/(\d{4})\/(\d{2})\/(\d{2})/g, '$1-$2-$3');

            // Parse CSV data to JSON
            csvtojson({
                noheader: true,
                output: "json",
            })
            .fromString(transformedData)
            .then((source) => {
                source.forEach(row => {
                    const { field1, field2, field3, field4, field5, field6 } = row;

                    // Convert string values to numbers or keep them as null if unable to convert
                    const revenue = !isNaN(field3) ? parseFloat(field3.replace(/,/g, '')) : null;
                    const gp = !isNaN(field4) ? parseFloat(field4.replace(/,/g, '')) : null;
                    const fcf = !isNaN(field5) ? parseFloat(field5.replace(/,/g, '')) : null;
                    const capex = !isNaN(field6) ? parseFloat(field6.replace(/,/g, '')) : null;

                    const insertStatement = `
                        INSERT INTO financial_data (ticker, date, revenue, gp, fcf, capex) VALUES (?, ?, ?, ?, ?, ?)
                    `;

                    const values = [field1, field2, revenue, gp, fcf, capex];

                    con.query(insertStatement, values, (err) => {
                        if (err) {
                            console.error("Unable to insert data:", err);
                            return;
                        }
                    });
                });

                console.log("All data stored into 'financial_data' table successfully");
            })
            .catch((err) => {
                console.error("Error parsing CSV:", err);
            });
        });
    });
});
