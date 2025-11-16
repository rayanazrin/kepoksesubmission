const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());

let allCases = []; // initial empty data

// Create charts directory if it doesn't exist
const chartsDir = path.join(__dirname, 'knime_output');
if (!fs.existsSync(chartsDir)) {
    fs.mkdirSync(chartsDir, { recursive: true });
}

// Serve static files from knime_output directory
app.use('/charts', express.static(chartsDir));

// GET CSV for KNIME
app.get('/cases.csv', (req, res) => {
    if (!allCases.length) {
        return res.send('Case Number,Crime Type,...\n'); // empty CSV header
    }

    const headers = [
        'Case Number','Crime Type','Incident Date','Platform',
        'Description','Status','Priority','Submitted At',
        'Updated At','Resolved At','Assigned To',
        'Reporter Name','Reporter Email','Reporter Phone','Anonymous'
    ];

    const rows = allCases.map(c => [
        c.caseNumber || '',
        c.crimeType || '',
        c.incidentDate || '',
        c.platform || '',
        (c.description || '').replace(/[\r\n]+/g,' '),
        c.status || '',
        c.priority || '',
        c.submittedAt || '',
        c.updatedAt || '',
        c.resolvedAt || '',
        c.assignedTo || '',
        c.reporterName || '',
        c.reporterEmail || '',
        c.reporterPhone || '',
        c.anonymous ? 'Yes' : 'No'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(f => `"${f}"`).join(','))].join('\n');

    res.setHeader('Content-Type','text/csv');
    res.send(csvContent);
});

// POST endpoint to update cases from browser
app.post('/update-cases', (req, res) => {
    allCases = req.body; // replace with browser data
    res.json({ message: 'Cases updated successfully', count: allCases.length });
});

// GET endpoint to list available charts
app.get('/charts/list', (req, res) => {
    try {
        const files = fs.readdirSync(chartsDir);
        const chartFiles = files.filter(f => 
            f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.svg') || f.endsWith('.html')
        );
        res.json({ charts: chartFiles });
    } catch (error) {
        res.json({ charts: [] });
    }
});

app.listen(5500, () => console.log('Server running on http://localhost:5500'));

