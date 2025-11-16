# CyberShield Prediction Methodology
## How AI Predictions Are Generated

---

## Overview
The prediction system uses **statistical analysis** and **pattern recognition** on historical cybercrime report data stored in local storage. All predictions are calculated in real-time based on actual case data.

---

## Prediction Algorithms

### 1. **Most Likely Crime Type Prediction** 🎯
- **Method**: Frequency analysis
- **Calculation**:
  - Counts occurrences of each crime type (phishing, hacking, scam, etc.)
  - Identifies the most frequently reported crime type
  - Calculates percentage: `(Most Common Type Count / Total Reports) × 100`
- **Output**: 
  - Most common crime type name
  - Percentage of total reports
  - Trend indicator showing number of cases

---

### 2. **Peak Incident Day Prediction** 📅
- **Method**: Day-of-week analysis
- **Calculation**:
  - Extracts day of week from each incident date
  - Counts incidents per day (Sunday through Saturday)
  - Identifies the day with highest incident count
- **Output**:
  - Day name (e.g., "Monday")
  - Number of incidents on that day
  - Recommendation for increased vigilance

---

### 3. **High-Risk Platform Prediction** ⚠️
- **Method**: Platform frequency analysis
- **Calculation**:
  - Counts incidents per platform (WhatsApp, Email, Instagram, etc.)
  - Identifies platform with highest incident count
  - Only shows if platform has more than 1 incident
- **Output**:
  - Platform name
  - Number of incidents on that platform
  - Warning indicator

---

### 4. **Risk Level Assessment** 📊
- **Method**: Priority distribution analysis
- **Calculation**:
  - Counts cases by priority level (High, Medium, Low)
  - Calculates high priority rate: `(High Priority Count / Total Reports) × 100`
  - Categorizes risk level:
    - **>40% High Priority** = High Alert
    - **20-40% High Priority** = Moderate Risk
    - **<20% High Priority** = Low Risk
- **Output**:
  - Percentage of high priority cases
  - Risk level category
  - Trend indicator

---

### 5. **Expected Resolution Time Prediction** ⏱️
- **Method**: Historical average calculation
- **Calculation**:
  - Filters only resolved cases with both submission and resolution dates
  - Calculates resolution time for each: `Resolution Date - Submission Date` (in days)
  - Computes average: `Sum of All Resolution Times / Number of Resolved Cases`
- **Output**:
  - Average resolution time in days
  - Trend indicator:
    - **<7 days** = Positive (fast resolution)
    - **7-14 days** = Neutral (moderate)
    - **>14 days** = Warning (slow resolution)

---

### 6. **Incident Trend Prediction** 📈📉
- **Method**: Time-series comparison
- **Calculation**:
  - Splits reports into two periods:
    - **Recent period**: Last 1/3 of reports (by date)
    - **Older period**: First 2/3 of reports
  - Calculates growth rate: `((Recent Rate - Older Rate) / Older Rate) × 100`
  - Only shows if change is >5% (significant)
- **Output**:
  - Growth percentage (positive or negative)
  - Trend direction (increasing/decreasing)
  - Interpretation of trend

---

### 7. **Reporting Behavior Analysis** 🔒
- **Method**: Anonymous reporting ratio
- **Calculation**:
  - Counts anonymous reports vs. non-anonymous reports
  - Calculates anonymous rate: `(Anonymous Count / Total Reports) × 100`
- **Output**:
  - Percentage of anonymous reports
  - Privacy concern level:
    - **>50%** = High privacy concerns
    - **≤50%** = Moderate privacy awareness

---

### 8. **Case Assignment Status** 👥 (Investigator Panel Only)
- **Method**: Assignment status analysis
- **Calculation**:
  - Counts assigned cases (has `assignedTo` field)
  - Counts unassigned cases (status = 'New' and no `assignedTo`)
- **Output**:
  - Number of unassigned cases
  - Number of assigned cases
  - Workload indicator

---

## Technical Implementation

### Data Source
- **Storage**: Browser localStorage (`cybershield_reports`)
- **Format**: JSON array of report objects
- **Update Frequency**: Real-time (calculated on-demand)

### Data Requirements
- **Minimum data**: At least 1 report for basic predictions
- **Optimal data**: 10+ reports for accurate trends
- **Time-based predictions**: Require date fields (`incidentDate`, `submittedAt`, `resolvedAt`)

### Calculation Flow
1. Load reports from localStorage
2. Filter and validate data
3. Apply statistical algorithms
4. Generate prediction objects with:
   - Icon
   - Title
   - Value
   - Description
   - Trend indicator
5. Display in UI cards

---

## Key Features

✅ **Real-time Analysis**: Predictions update automatically when data changes  
✅ **No External APIs**: All calculations done client-side  
✅ **Pattern Recognition**: Identifies trends and anomalies  
✅ **Actionable Insights**: Provides recommendations based on data  
✅ **Visual Indicators**: Color-coded trends (positive/warning/neutral)  

---

## Limitations

⚠️ **Sample Size**: Predictions are more accurate with larger datasets  
⚠️ **Historical Data Only**: Based on past patterns, not future guarantees  
⚠️ **Local Storage**: Data is browser-specific (not shared across devices)  
⚠️ **No Machine Learning**: Uses statistical methods, not AI/ML models  

---

## Future Enhancements

🔮 **Machine Learning Integration**: Train models on larger datasets  
🔮 **Predictive Modeling**: Forecast future incident rates  
🔮 **Anomaly Detection**: Identify unusual patterns automatically  
🔮 **Cross-Platform Sync**: Share data across devices  
🔮 **Advanced Analytics**: Correlation analysis, clustering, etc.  

---

## Presentation Points Summary

• **7-8 Prediction Types**: Crime type, peak day, platform risk, priority, resolution time, growth trend, reporting behavior, assignment status

• **Statistical Methods**: Frequency analysis, time-series comparison, average calculation, ratio analysis

• **Real-time Processing**: All calculations performed client-side in JavaScript

• **Data-Driven**: Based on actual historical case data from localStorage

• **Actionable Insights**: Each prediction includes recommendations for users/investigators

• **Visual Feedback**: Color-coded trend indicators (green/yellow/red) for quick understanding

• **No External Dependencies**: Works entirely offline with local data

• **Scalable**: Handles datasets from 1 to 1000+ reports efficiently

