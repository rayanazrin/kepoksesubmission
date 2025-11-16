function exportLocalStorageToCSV() {
    const stored = localStorage.getItem('onestopcentre_reports');
    if (!stored) {
        alert('No data in localStorage');
        return;
    }

    const cases = JSON.parse(stored);

    if (!cases.length) {
        alert('No cases to export');
        return;
    }

    // CSV headers
    const headers = [
        'Case Number','Crime Type','Incident Date','Platform',
        'Description','Status','Priority','Submitted At',
        'Updated At','Resolved At','Assigned To',
        'Reporter Name','Reporter Email','Reporter Phone','Anonymous'
    ];

    // CSV rows
    const rows = cases.map(c => [
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

    // Create downloadable CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cases_export.csv';
    a.click();
    URL.revokeObjectURL(url);

    alert('CSV exported successfully!');
}

setInterval(exportLocalStorageToCSV, 60000); // every 60 seconds
