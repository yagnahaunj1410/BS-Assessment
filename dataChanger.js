const fs = require('fs');

const inputFile = '/home/pickapeppa/Desktop/Business Quant/Sample-Data-Historic.csv';
const outputFile = '/home/pickapeppa/Desktop/Business Quant/Sample-Data-Historic-dataChanged.csv';

// Function to convert date format from mm/dd/yyyy to yyyy/mm/dd
function formatDate(dateStr) {
    const [month, day, year] = dateStr.split('/');
    return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
}

// Read input CSV file, transform date format, and write to output CSV file
fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading input CSV file:', err);
        return;
    }

    // Split CSV data into lines
    const lines = data.trim().split('\n');

    // Process header line
    const headers = lines.shift().split(',');

    // Transform date format in each line
    const transformedLines = lines.map(line => {
        const values = line.split(',');
        const dateIndex = headers.indexOf('date');
        if (dateIndex !== -1) {
            values[dateIndex] = formatDate(values[dateIndex]);
        }
        return values.join(',');
    });

    // Write transformed data to output CSV file
    const outputData = [headers.join(','), ...transformedLines].join('\n');
    fs.writeFile(outputFile, outputData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing output CSV file:', err);
            return;
        }
        console.log('CSV file successfully converted.');
    });
});
