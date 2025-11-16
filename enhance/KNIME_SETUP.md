# KNIME Data Analysis Setup Guide

This guide explains how to set up KNIME to analyze cybercrime data and generate charts for the CyberShield dashboard.

## Prerequisites

1. **KNIME Analytics Platform** - Download from [https://www.knime.com/downloads](https://www.knime.com/downloads)
2. **Node.js Server** - Make sure `server.js` is running on `http://localhost:5500`

## KNIME Workflow Setup

### Step 1: Create a New Workflow

1. Open KNIME Analytics Platform
2. Create a new workflow: `File > New > New KNIME Workflow`
3. Name it: `CyberShield Data Analysis`

### Step 2: Read Data from CSV Endpoint

1. Add a **File Reader** node:
   - Right-click in workspace > `New Node` > `IO` > `Read` > `File Reader`
   - Configure the node:
     - **URL**: `http://localhost:5500/cases.csv`
     - **Read header**: Yes
     - **Column delimiter**: Comma
     - **Character encoding**: UTF-8

   **Alternative**: Use **CSV Reader** with HTTP URL support, or use **GET Request** node to fetch the CSV first.

### Step 3: Data Preprocessing (Optional)

Add nodes to clean and prepare data:
- **Column Filter**: Select relevant columns
- **Missing Value**: Handle missing data
- **String Manipulation**: Clean text fields
- **Date/Time**: Parse date columns

### Step 4: Create Analysis Charts

#### Chart 1: Crime Type Distribution (Bar Chart)

1. Add **GroupBy** node:
   - Group by: `Crime Type`
   - Aggregation: Count
2. Add **Bar Chart** node:
   - X-axis: `Crime Type`
   - Y-axis: Count
   - Configure colors and labels
3. Add **Image Writer** node:
   - Output file: `knime_output/crime_type_distribution.png`
   - Format: PNG
   - Width: 800px, Height: 600px

#### Chart 2: Status Over Time (Line Chart)

1. Add **GroupBy** node:
   - Group by: `Status` and `Submitted At` (monthly)
   - Aggregation: Count
2. Add **Line Chart** node:
   - X-axis: Date
   - Y-axis: Count
   - Series: Status
3. Add **Image Writer** node:
   - Output file: `knime_output/status_timeline.png`

#### Chart 3: Priority Analysis (Pie Chart)

1. Add **GroupBy** node:
   - Group by: `Priority`
   - Aggregation: Count
2. Add **Pie Chart** node:
   - Category: Priority
   - Value: Count
3. Add **Image Writer** node:
   - Output file: `knime_output/priority_distribution.png`

#### Chart 4: Platform Analysis (Bar Chart)

1. Add **GroupBy** node:
   - Group by: `Platform`
   - Aggregation: Count
   - Sort by: Count (descending)
   - Limit: Top 10
2. Add **Bar Chart** node:
   - X-axis: Platform
   - Y-axis: Count
3. Add **Image Writer** node:
   - Output file: `knime_output/platform_analysis.png`

#### Chart 5: Resolution Rate Trend (Line Chart)

1. Add **Math Formula** node to calculate resolution rate
2. Add **Line Chart** node for trend visualization
3. Add **Image Writer** node:
   - Output file: `knime_output/resolution_trend.png`

### Step 5: Output Directory Setup

1. Create output directory in your project folder:
   - Path: `knime_output/` (relative to your project root)
   - This should match the directory served by the Node.js server

2. Configure all **Image Writer** nodes to save to this directory

### Step 6: Execute Workflow

1. Right-click on the workflow > `Execute All`
2. Or execute nodes individually by right-clicking each node > `Execute`

### Step 7: Verify Output

1. Check that PNG files are created in `knime_output/` directory
2. Verify files are accessible at `http://localhost:5500/charts/[filename]`
3. Refresh the dashboard in the browser to see charts

## Workflow Structure Example

```
[File Reader] → [Column Filter] → [Missing Value]
                                          ↓
                    ┌─────────────────────┴─────────────────────┐
                    ↓                     ↓                     ↓
            [GroupBy: Crime Type]  [GroupBy: Status]  [GroupBy: Priority]
                    ↓                     ↓                     ↓
            [Bar Chart]            [Line Chart]         [Pie Chart]
                    ↓                     ↓                     ↓
            [Image Writer]         [Image Writer]      [Image Writer]
                    ↓                     ↓                     ↓
            crime_type_dist.png   status_timeline.png priority_dist.png
```

## Advanced: Interactive HTML Charts

For interactive charts, use **JavaScript View** or **Plotly** nodes:

1. Add **Plotly** node (requires Plotly extension)
2. Configure interactive chart
3. Use **HTML Writer** node:
   - Output file: `knime_output/interactive_chart.html`

## Automation: Scheduled Execution

To automatically update charts:

1. Use **Loop End** node for batch processing
2. Set up KNIME Server for scheduled execution
3. Or use KNIME's **Scheduler** extension

## Troubleshooting

### Charts not appearing in dashboard:
- Verify `knime_output/` directory exists in project root
- Check file permissions
- Verify server is running on port 5500
- Check browser console for errors

### CSV not loading:
- Ensure server.js is running
- Verify endpoint: `http://localhost:5500/cases.csv`
- Check CORS settings in server.js

### Image Writer errors:
- Ensure output directory exists
- Check file path is relative or absolute correctly
- Verify write permissions

## Recommended KNIME Extensions

Install these extensions for better charting:
- **KNIME JavaScript Views** - For interactive charts
- **Plotly** - Advanced visualizations
- **KNIME Image Processing** - Enhanced image export

## Example Node Configuration

### File Reader Configuration:
```
Location: http://localhost:5500/cases.csv
Read header: Yes
Column delimiter: Comma
```

### GroupBy Configuration (Crime Type):
```
Group column(s): Crime Type
Aggregation: Count (All columns)
```

### Bar Chart Configuration:
```
X-axis: Crime Type
Y-axis: Count
Title: "Crime Type Distribution"
X-axis label: "Type of Crime"
Y-axis label: "Number of Reports"
```

### Image Writer Configuration:
```
Output location: knime_output/crime_type_distribution.png
Image format: PNG
Width: 800
Height: 600
DPI: 150
```

## Next Steps

1. Run the workflow after data is available
2. Charts will automatically appear in the dashboard
3. Refresh the "Security News" section to see updated charts
4. Set up scheduled execution for regular updates

