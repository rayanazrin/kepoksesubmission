// ========================================
// ONE STOP CENTRE - Enhanced JavaScript
// ========================================

// Global state
let uploadedFiles = [];
let reports = [];

// ========================================
// NAVIGATION
// ========================================

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Remove active from all menu buttons
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active to clicked button
    event.target.classList.add('active');
    
    // Load section-specific data
    if (sectionId === 'news') {
        loadNews();
        loadStats();
        loadPredictions();
        loadKNIMECharts();
    }
}

// ========================================
// REPORT FORM HANDLING
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reportForm');
    const descriptionField = document.getElementById('description');
    const anonymousCheckbox = document.getElementById('anonymous');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('evidence');
    
    // Character counter
    if (descriptionField) {
        descriptionField.addEventListener('input', function() {
            const count = this.value.length;
            document.getElementById('charCount').textContent = count;
            
            // Auto-priority based on keywords
            updatePriority(this.value);
        });
    }
    
    // Anonymous checkbox handler
    if (anonymousCheckbox) {
        anonymousCheckbox.addEventListener('change', function() {
            const contactFields = ['reporterName', 'reporterEmail', 'reporterPhone'];
            contactFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.disabled = this.checked;
                    if (this.checked) field.value = '';
                }
            });
        });
    }
    
    // File upload handling
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--border-color)';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border-color)';
            handleFiles(e.dataTransfer.files);
        });
        
        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // FAQ toggles
    setupFAQ();
    
    // Initialize news filters
    initializeNewsFilters();
});

function updatePriority(text) {
    const urgentKeywords = ['hack', 'steal', 'money', 'bank', 'urgent', 'help', 'scam', 'fraud'];
    const priorityBox = document.getElementById('priorityBox');
    const priorityLevel = document.getElementById('priorityLevel');
    
    const lowerText = text.toLowerCase();
    const hasUrgent = urgentKeywords.some(keyword => lowerText.includes(keyword));
    
    if (hasUrgent) {
        priorityBox.style.display = 'block';
        priorityLevel.textContent = 'High';
        priorityLevel.style.color = '#ef4444';
    } else if (text.length > 100) {
        priorityBox.style.display = 'block';
        priorityLevel.textContent = 'Medium';
        priorityLevel.style.color = '#f59e0b';
    } else {
        priorityBox.style.display = 'none';
    }
}

async function handleFiles(files) {
    const fileList = document.getElementById('fileList');
    
    for (const file of Array.from(files)) {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            alert(`File ${file.name} is too large. Maximum size is 10MB.`);
            continue;
        }
        
        // Convert image to base64 for storage
        let fileData = {
            name: file.name,
            size: file.size,
            type: file.type
        };
        
        if (file.type.startsWith('image/')) {
            try {
                fileData.data = await fileToBase64(file);
                fileData.isImage = true;
            } catch (error) {
                console.error('Error converting image:', error);
            }
        }
        
        uploadedFiles.push({ file, data: fileData });
        
        // Create file item with preview for images
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        if (file.type.startsWith('image/')) {
            const escapedData = JSON.stringify(fileData.data);
            const escapedName = JSON.stringify(file.name);
            fileItem.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <img src="${fileData.data}" alt="${file.name}" class="file-preview-thumb" onclick="viewImage(${escapedData}, ${escapedName})" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-sm); cursor: pointer; border: 1px solid var(--border-color);">
                    <div style="flex: 1;">
                        <span class="file-item-name">🖼️ ${file.name} (${formatFileSize(file.size)})</span>
                        <small style="display: block; color: var(--text-muted); margin-top: 4px;">Click image to view</small>
                    </div>
                </div>
                <button type="button" class="file-item-remove" onclick="removeFile('${file.name}')">Remove</button>
            `;
        } else {
        fileItem.innerHTML = `
            <span class="file-item-name">📄 ${file.name} (${formatFileSize(file.size)})</span>
            <button type="button" class="file-item-remove" onclick="removeFile('${file.name}')">Remove</button>
        `;
        }
        
        fileList.appendChild(fileItem);
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function removeFile(fileName) {
    uploadedFiles = uploadedFiles.filter(f => f.file.name !== fileName);
    
    // Re-render file list
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    
    for (const fileObj of uploadedFiles) {
        const file = fileObj.file;
        const fileData = fileObj.data;
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        if (file.type.startsWith('image/') && fileData.data) {
            const escapedData = JSON.stringify(fileData.data);
            const escapedName = JSON.stringify(file.name);
            fileItem.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <img src="${fileData.data}" alt="${file.name}" class="file-preview-thumb" onclick="viewImage(${escapedData}, ${escapedName})" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-sm); cursor: pointer; border: 1px solid var(--border-color);">
                    <div style="flex: 1;">
                        <span class="file-item-name">🖼️ ${file.name} (${formatFileSize(file.size)})</span>
                        <small style="display: block; color: var(--text-muted); margin-top: 4px;">Click image to view</small>
                    </div>
                </div>
                <button type="button" class="file-item-remove" onclick="removeFile('${file.name}')">Remove</button>
            `;
        } else {
        fileItem.innerHTML = `
            <span class="file-item-name">📄 ${file.name} (${formatFileSize(file.size)})</span>
            <button type="button" class="file-item-remove" onclick="removeFile('${file.name}')">Remove</button>
        `;
        }
        
        fileList.appendChild(fileItem);
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Generate case number
    const caseNumber = generateCaseNumber();
    
    // Collect form data
    const reportData = {
        caseNumber: caseNumber,
        crimeType: document.getElementById('crimeType').value,
        incidentDate: document.getElementById('incidentDate').value,
        incidentTime: document.getElementById('incidentTime').value,
        platform: document.getElementById('platform').value,
        description: document.getElementById('description').value,
        reporterName: document.getElementById('reporterName').value,
        reporterEmail: document.getElementById('reporterEmail').value,
        reporterPhone: document.getElementById('reporterPhone').value,
        anonymous: document.getElementById('anonymous').checked,
        files: uploadedFiles.map(f => f.data),
        status: 'New',
        submittedAt: new Date().toISOString(),
        priority: determinePriority(document.getElementById('description').value)
    };
    
    // Store report (in real app, send to backend)
    reports.push(reportData);
    localStorage.setItem('onestopcentre_reports', JSON.stringify(reports));
    
    // Show success message
    document.getElementById('reportForm').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
    document.getElementById('caseNumber').textContent = caseNumber;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function generateCaseNumber() {
    const year = new Date().getFullYear();
    const number = String(reports.length + 1).padStart(4, '0');
    return `CR-${year}-${number}`;
}

function determinePriority(description) {
    const urgentKeywords = ['hack', 'steal', 'money', 'bank', 'urgent', 'help', 'scam', 'fraud'];
    const lowerText = description.toLowerCase();
    
    if (urgentKeywords.some(keyword => lowerText.includes(keyword))) {
        return 'High';
    } else if (description.length > 100) {
        return 'Medium';
    }
    return 'Low';
}

function resetForm() {
    document.getElementById('reportForm').reset();
    uploadedFiles = [];
    document.getElementById('fileList').innerHTML = '';
    document.getElementById('priorityBox').style.display = 'none';
    document.getElementById('charCount').textContent = '0';
}

function submitAnother() {
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('reportForm').style.display = 'block';
    resetForm();
}

// ========================================
// TRACK REPORT
// ========================================

function trackReport() {
    const trackingNumber = document.getElementById('trackingNumber').value.trim();
    
    if (!trackingNumber) {
        alert('Please enter a case number');
        return;
    }
    
    // Load reports from storage
    const storedReports = JSON.parse(localStorage.getItem('onestopcentre_reports') || '[]');
    const report = storedReports.find(r => r.caseNumber === trackingNumber);
    
    if (!report) {
        alert('Case not found. Please check your case number.');
        return;
    }
    
    // Display report details
    displayTrackingResult(report);
}

function displayTrackingResult(report) {
    const resultDiv = document.getElementById('trackingResult');
    
    // Update case details
    document.getElementById('trackCaseNumber').textContent = report.caseNumber;
    document.getElementById('trackCrimeType').textContent = formatCrimeType(report.crimeType);
    document.getElementById('trackDate').textContent = formatDate(report.submittedAt);
    document.getElementById('trackInvestigator').textContent = report.assignedTo || 'Not assigned yet';
    
    // Update status badge
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.textContent = report.status;
    statusBadge.className = 'status-badge ' + report.status.toLowerCase();
    
    // Update timeline
    document.getElementById('timeline1').textContent = formatDate(report.submittedAt);
    
    if (report.status === 'Investigating' || report.status === 'Resolved') {
        document.getElementById('timelineStep2').classList.add('active');
        document.getElementById('timeline2').textContent = formatDate(report.updatedAt || report.submittedAt);
    }
    
    if (report.status === 'Resolved') {
        document.getElementById('timelineStep3').classList.add('active');
        document.getElementById('timeline3').textContent = formatDate(report.resolvedAt || report.updatedAt || report.submittedAt);
    }
    
    // Add messages section if they exist or if case is assigned
    let messagesHTML = '';
    const isAssigned = report.assignedTo && (report.status === 'Investigating' || report.status === 'Resolved' || report.status === 'New');
    
    if (report.messages && report.messages.length > 0) {
        messagesHTML = `
            <div class="messages-section" style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-color);">
                <h4>💬 Messages from Investigator</h4>
                <div class="user-messages-container">
                    ${report.messages.map((msg, index) => `
                        <div class="message-item user-msg">
                            <div class="message-header">
                                <strong>${msg.investigatorId || 'Investigator'}</strong>
                                <small>${formatDate(msg.timestamp)}</small>
                            </div>
                            <div class="message-body">${msg.text}</div>
                            ${msg.files && msg.files.length > 0 ? `
                                <div class="message-files">
                                    ${msg.files.map((file, idx) => {
                                        const fileName = file.name || 'Unknown';
                                        const fileData = file.data || null;
                                        const isImage = file.type?.startsWith('image/') || file.isImage;
                                        
                                        if (isImage && fileData) {
                                            return `
                                                <div class="message-file-image" onclick="viewImage(${JSON.stringify(fileData)}, ${JSON.stringify(fileName)})" style="cursor: pointer;">
                                                    <img src="${fileData}" alt="${fileName}" style="width: 100px; height: 100px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                                                    <div style="margin-top: 4px; font-size: 11px; color: var(--text-muted);">🖼️ ${fileName}</div>
                                                </div>
                                            `;
                                        } else {
                                            return `
                                                <div class="message-file">
                                                    📎 ${fileName} ${file.size ? '(' + formatFileSize(file.size) + ')' : ''}
                                                </div>
                                            `;
                                        }
                                    }).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else if (isAssigned) {
        messagesHTML = `
            <div class="messages-section" style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-color);">
                <h4>💬 Messages from Investigator</h4>
                <p style="color: var(--text-muted); text-align: center; padding: 20px;">
                    No messages yet. Your investigator will contact you here with updates and solutions.
                </p>
            </div>
        `;
    }
    
    // Append messages to the case card
    const caseCard = resultDiv.querySelector('.case-card');
    if (caseCard && messagesHTML) {
        // Remove existing messages section if any
        const existingMessages = caseCard.querySelector('.messages-section');
        if (existingMessages) {
            existingMessages.remove();
        }
        caseCard.insertAdjacentHTML('beforeend', messagesHTML);
    }
    
    resultDiv.style.display = 'block';
}

function formatCrimeType(type) {
    const types = {
        'phishing': 'Phishing / Fake Emails',
        'hacking': 'Account Hacking',
        'scam': 'Online Scam / Fraud',
        'identity-theft': 'Identity Theft',
        'cyberbullying': 'Cyberbullying / Harassment',
        'malware': 'Malware / Ransomware',
        'financial-fraud': 'Financial Fraud',
        'data-breach': 'Data Breach',
        'other': 'Other'
    };
    return types[type] || type;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ========================================
// IMAGE VIEWER
// ========================================

function viewImage(imageSrc, imageName) {
    // Create image viewer modal
    const viewer = document.createElement('div');
    viewer.id = 'imageViewer';
    viewer.className = 'image-viewer-modal';
    viewer.innerHTML = `
        <div class="image-viewer-content">
            <div class="image-viewer-header">
                <h3>${imageName}</h3>
                <button class="image-viewer-close" onclick="closeImageViewer()">&times;</button>
            </div>
            <div class="image-viewer-body">
                <img src="${imageSrc}" alt="${imageName}" id="viewerImage">
            </div>
        </div>
    `;
    
    document.body.appendChild(viewer);
    
    // Close on background click
    viewer.addEventListener('click', function(e) {
        if (e.target === viewer) {
            closeImageViewer();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeImageViewer();
        }
    });
}

function closeImageViewer() {
    const viewer = document.getElementById('imageViewer');
    if (viewer) {
        viewer.remove();
    }
}

// ========================================
// CHATBOT
// ========================================

const GEMINI_API_KEY = 'AIzaSyCGnCeyAENq6E658OKgkAtuohT0OSzB3Tw';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function sendMessage() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    
    if (text === '') return;
    
    // Add user message
    addMessage(text, 'user');
    input.value = '';
    
    // Show loading indicator
    const loadingId = addMessage('Thinking...', 'bot');
    const loadingElement = document.getElementById(loadingId);
    
    try {
        // Generate bot response using Gemini API
        const response = await generateBotResponse(text);
        
        // Remove loading message and add actual response
        loadingElement.remove();
        addMessage(response, 'bot');
    } catch (error) {
        // Remove loading message and show error
        loadingElement.remove();
        addMessage('Sorry, I encountered an error. Please try again later.', 'bot');
        console.error('Chatbot error:', error);
    }
}

function quickQuestion(question) {
    document.getElementById('userInput').value = question;
    sendMessage();
}

function addMessage(text, sender) {
    const chatbox = document.getElementById('chatbox');
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    
    // Generate unique ID for loading messages
    const msgId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    msg.id = msgId;
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = text;
    
    msg.appendChild(content);
    chatbox.appendChild(msg);
    chatbox.scrollTop = chatbox.scrollHeight;
    
    return msgId;
}

async function generateBotResponse(userMessage) {
    // Create context-aware prompt for cybersecurity assistant
    const systemPrompt = `You are a helpful cybersecurity assistant for One Stop Centre, a cybercrime reporting platform. 
    Your role is to help users understand cybercrimes, provide guidance on reporting incidents, offer immediate safety steps, 
    and give general cybersecurity advice. Be concise, clear, and actionable. Format responses with HTML when appropriate (use <strong>, <ul>, <li>, <ol> tags).
    Always encourage users to report incidents through the platform if they've experienced a cybercrime.`;
    
    const fullPrompt = `${systemPrompt}\n\nUser question: ${userMessage}`;
    
    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: fullPrompt
                    }
                ]
            }
        ]
    };
    
    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    // Extract the response text from Gemini API response
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Unexpected API response format');
}

// ========================================
// NEWS & STATS
// ========================================

function loadStats() {
    // Load from localStorage
    const storedReports = JSON.parse(localStorage.getItem('onestopcentre_reports') || '[]');
    
    const total = storedReports.length;
    const active = storedReports.filter(r => r.status === 'New' || r.status === 'Investigating').length;
    const resolved = storedReports.filter(r => r.status === 'Resolved').length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    
    document.getElementById('totalReports').textContent = total;
    document.getElementById('activeReports').textContent = active;
    document.getElementById('resolvedReports').textContent = resolved;
    document.getElementById('resolutionRate').textContent = rate + '%';
}

function loadPredictions() {
    const predictionsContainer = document.getElementById('predictions-container');
    if (!predictionsContainer) return;
    
    // Load reports from localStorage
    const storedReports = JSON.parse(localStorage.getItem('onestopcentre_reports') || '[]');
    
    if (storedReports.length === 0) {
        predictionsContainer.innerHTML = `
            <div class="prediction-empty">
                <p>No data available for predictions yet. Submit reports to see insights.</p>
            </div>
        `;
        return;
    }
    
    // Generate predictions based on data patterns
    const predictions = generatePredictions(storedReports);
    
    // Display predictions
    predictionsContainer.innerHTML = '';
    predictions.forEach(prediction => {
        const predictionCard = document.createElement('div');
        predictionCard.className = 'prediction-card';
        predictionCard.innerHTML = `
            <div class="prediction-icon">${prediction.icon}</div>
            <div class="prediction-content">
                <h4>${prediction.title}</h4>
                <p class="prediction-value">${prediction.value}</p>
                <p class="prediction-description">${prediction.description}</p>
                ${prediction.trend ? `<div class="prediction-trend ${prediction.trend.type}">${prediction.trend.text}</div>` : ''}
            </div>
        `;
        predictionsContainer.appendChild(predictionCard);
    });
}

function generatePredictions(reports) {
    const predictions = [];
    
    // 1. Most Likely Crime Type Prediction
    const crimeTypeCounts = {};
    reports.forEach(r => {
        const type = r.crimeType || 'other';
        crimeTypeCounts[type] = (crimeTypeCounts[type] || 0) + 1;
    });
    const mostCommonCrime = Object.entries(crimeTypeCounts)
        .sort((a, b) => b[1] - a[1])[0];
    const crimeTypeNames = {
        'phishing': 'Phishing',
        'hacking': 'Account Hacking',
        'scam': 'Online Scam',
        'identity-theft': 'Identity Theft',
        'cyberbullying': 'Cyberbullying',
        'malware': 'Malware',
        'financial-fraud': 'Financial Fraud',
        'data-breach': 'Data Breach',
        'other': 'Other'
    };
    
    if (mostCommonCrime) {
        const percentage = Math.round((mostCommonCrime[1] / reports.length) * 100);
        predictions.push({
            icon: '🎯',
            title: 'Most Likely Crime Type',
            value: `${crimeTypeNames[mostCommonCrime[0]] || mostCommonCrime[0]}`,
            description: `${percentage}% of reported incidents are ${crimeTypeNames[mostCommonCrime[0]] || mostCommonCrime[0].toLowerCase()}. This trend is likely to continue.`,
            trend: {
                type: 'up',
                text: `↑ ${mostCommonCrime[1]} cases reported`
            }
        });
    }
    
    // 2. Peak Day Prediction
    const dayCounts = {};
    reports.forEach(r => {
        if (r.incidentDate) {
            const date = new Date(r.incidentDate);
            const dayOfWeek = date.getDay();
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[dayOfWeek];
            dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
        }
    });
    const peakDay = Object.entries(dayCounts)
        .sort((a, b) => b[1] - a[1])[0];
    
    if (peakDay) {
        predictions.push({
            icon: '📅',
            title: 'Peak Incident Day',
            value: peakDay[0],
            description: `Most cybercrimes are reported on ${peakDay[0]}s. Be extra vigilant on this day.`,
            trend: {
                type: 'neutral',
                text: `${peakDay[1]} incidents`
            }
        });
    }
    
    // 3. Platform Risk Prediction
    const platformCounts = {};
    reports.forEach(r => {
        if (r.platform) {
            const platform = r.platform.trim();
            if (platform) {
                platformCounts[platform] = (platformCounts[platform] || 0) + 1;
            }
        }
    });
    const topPlatform = Object.entries(platformCounts)
        .sort((a, b) => b[1] - a[1])[0];
    
    if (topPlatform && topPlatform[1] > 1) {
        predictions.push({
            icon: '⚠️',
            title: 'High-Risk Platform',
            value: topPlatform[0],
            description: `${topPlatform[0]} has the highest number of reported incidents. Exercise caution when using this platform.`,
            trend: {
                type: 'warning',
                text: `⚠️ ${topPlatform[1]} incidents`
            }
        });
    }
    
    // 4. Priority Trend Prediction
    const priorityCounts = { High: 0, Medium: 0, Low: 0 };
    reports.forEach(r => {
        const priority = r.priority || 'Medium';
        if (priorityCounts.hasOwnProperty(priority)) {
            priorityCounts[priority]++;
        }
    });
    const highPriorityRate = reports.length > 0 
        ? Math.round((priorityCounts.High / reports.length) * 100) 
        : 0;
    
    if (reports.length > 0) {
        let priorityTrend = 'stable';
        let trendText = 'Moderate risk level';
        if (highPriorityRate > 40) {
            priorityTrend = 'warning';
            trendText = 'High alert: Many urgent cases';
        } else if (highPriorityRate < 20) {
            priorityTrend = 'positive';
            trendText = 'Low risk: Most cases are manageable';
        }
        
        predictions.push({
            icon: '📊',
            title: 'Risk Level Assessment',
            value: `${highPriorityRate}% High Priority`,
            description: `Based on current data, ${highPriorityRate}% of cases are high priority. ${trendText}.`,
            trend: {
                type: priorityTrend,
                text: trendText
            }
        });
    }
    
    // 5. Resolution Time Prediction
    const resolvedReports = reports.filter(r => r.status === 'Resolved' && r.submittedAt && r.resolvedAt);
    if (resolvedReports.length > 0) {
        const resolutionTimes = resolvedReports.map(r => {
            const submitted = new Date(r.submittedAt);
            const resolved = new Date(r.resolvedAt || r.updatedAt || r.submittedAt);
            return Math.ceil((resolved - submitted) / (1000 * 60 * 60 * 24)); // days
        });
        const avgResolutionTime = Math.round(
            resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
        );
        
        predictions.push({
            icon: '⏱️',
            title: 'Expected Resolution Time',
            value: `${avgResolutionTime} days`,
            description: `Based on historical data, cases typically take ${avgResolutionTime} days to resolve.`,
            trend: {
                type: avgResolutionTime < 7 ? 'positive' : avgResolutionTime < 14 ? 'neutral' : 'warning',
                text: `Average: ${avgResolutionTime} days`
            }
        });
    }
    
    // 6. Growth Trend Prediction
    if (reports.length >= 3) {
        const sortedReports = [...reports].sort((a, b) => 
            new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0)
        );
        const recentCount = Math.ceil(reports.length / 3);
        const recentReports = sortedReports.slice(-recentCount);
        const olderReports = sortedReports.slice(0, reports.length - recentCount);
        
        const recentRate = recentReports.length / (recentCount || 1);
        const olderRate = olderReports.length / ((reports.length - recentCount) || 1);
        const growthRate = olderRate > 0 ? ((recentRate - olderRate) / olderRate * 100) : 0;
        
        if (Math.abs(growthRate) > 5) {
            predictions.push({
                icon: growthRate > 0 ? '📈' : '📉',
                title: 'Incident Trend',
                value: `${growthRate > 0 ? '+' : ''}${Math.round(growthRate)}%`,
                description: growthRate > 0 
                    ? `Cybercrime incidents are increasing. Recent reports show a ${Math.round(growthRate)}% increase compared to earlier period.`
                    : `Good news! Cybercrime reports have decreased by ${Math.round(Math.abs(growthRate))}% recently.`,
                trend: {
                    type: growthRate > 0 ? 'warning' : 'positive',
                    text: growthRate > 0 ? '↑ Increasing trend' : '↓ Decreasing trend'
                }
            });
        }
    }
    
    // 7. Anonymous Reporting Trend
    const anonymousCount = reports.filter(r => r.anonymous).length;
    const anonymousRate = reports.length > 0 
        ? Math.round((anonymousCount / reports.length) * 100) 
        : 0;
    
    if (reports.length > 0) {
        predictions.push({
            icon: '🔒',
            title: 'Reporting Behavior',
            value: `${anonymousRate}% Anonymous`,
            description: `${anonymousRate}% of users prefer anonymous reporting. This indicates ${anonymousRate > 50 ? 'high privacy concerns' : 'moderate privacy awareness'}.`,
            trend: {
                type: 'neutral',
                text: `${anonymousCount} anonymous reports`
            }
        });
    }
    
    return predictions;
}

async function loadKNIMECharts() {
    const chartsContainer = document.getElementById('charts-container');
    if (!chartsContainer) return;
    
    // Load reports from localStorage
    const storedReports = JSON.parse(localStorage.getItem('onestopcentre_reports') || '[]');
    
    if (storedReports.length === 0) {
        chartsContainer.innerHTML = `
            <div class="chart-empty">
                <p>No data available for charts. Submit reports or load sample data to see visualizations.</p>
            </div>
        `;
        return;
    }
    
    chartsContainer.innerHTML = '';
    
    // Create chart cards
    createChartCard(chartsContainer, 'Crime Type Distribution', 'crimeTypeChart', storedReports);
    createChartCard(chartsContainer, 'Case Status Distribution', 'statusChart', storedReports);
    createChartCard(chartsContainer, 'Priority Level Analysis', 'priorityChart', storedReports);
    createChartCard(chartsContainer, 'Platform Analysis', 'platformChart', storedReports);
    createChartCard(chartsContainer, 'Cases Over Time', 'timelineChart', storedReports);
    
    // Render charts after a brief delay to ensure DOM is ready
    setTimeout(() => {
        renderCrimeTypeChart(storedReports);
        renderStatusChart(storedReports);
        renderPriorityChart(storedReports);
        renderPlatformChart(storedReports);
        renderTimelineChart(storedReports);
    }, 100);
}

function createChartCard(container, title, chartId, data) {
    const chartCard = document.createElement('div');
    chartCard.className = 'chart-card';
    chartCard.innerHTML = `
        <div class="chart-header">
            <h4>${title}</h4>
        </div>
        <div class="chart-content">
            <canvas id="${chartId}"></canvas>
        </div>
    `;
    container.appendChild(chartCard);
}

function renderCrimeTypeChart(reports) {
    const ctx = document.getElementById('crimeTypeChart');
    if (!ctx) return;
    
    const crimeTypeCounts = {};
    reports.forEach(r => {
        const type = r.crimeType || 'other';
        crimeTypeCounts[type] = (crimeTypeCounts[type] || 0) + 1;
    });
    
    const crimeTypeNames = {
        'phishing': 'Phishing',
        'hacking': 'Account Hacking',
        'scam': 'Online Scam',
        'identity-theft': 'Identity Theft',
        'cyberbullying': 'Cyberbullying',
        'malware': 'Malware',
        'financial-fraud': 'Financial Fraud',
        'data-breach': 'Data Breach',
        'other': 'Other'
    };
    
    const labels = Object.keys(crimeTypeCounts).map(k => crimeTypeNames[k] || k);
    const data = Object.values(crimeTypeCounts);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Cases',
                data: data,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(14, 165, 233, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(107, 114, 128, 0.8)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(14, 165, 233, 1)',
                    'rgba(251, 146, 60, 1)',
                    'rgba(107, 114, 128, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function renderStatusChart(reports) {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    
    const statusCounts = {};
    reports.forEach(r => {
        const status = r.status || 'New';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(107, 114, 128, 0.8)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(107, 114, 128, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderPriorityChart(reports) {
    const ctx = document.getElementById('priorityChart');
    if (!ctx) return;
    
    const priorityCounts = { High: 0, Medium: 0, Low: 0 };
    reports.forEach(r => {
        const priority = r.priority || 'Medium';
        if (priorityCounts.hasOwnProperty(priority)) {
            priorityCounts[priority]++;
        }
    });
    
    const labels = Object.keys(priorityCounts);
    const data = Object.values(priorityCounts);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderColor: [
                    'rgba(239, 68, 68, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(16, 185, 129, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderPlatformChart(reports) {
    const ctx = document.getElementById('platformChart');
    if (!ctx) return;
    
    const platformCounts = {};
    reports.forEach(r => {
        if (r.platform && r.platform.trim()) {
            const platform = r.platform.trim();
            platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        }
    });
    
    // Get top 10 platforms
    const sorted = Object.entries(platformCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const labels = sorted.map(([platform]) => platform);
    const data = sorted.map(([, count]) => count);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Incidents',
                data: data,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function renderTimelineChart(reports) {
    const ctx = document.getElementById('timelineChart');
    if (!ctx) return;
    
    // Group by date
    const dateCounts = {};
    reports.forEach(r => {
        if (r.submittedAt) {
            const date = new Date(r.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dateCounts[date] = (dateCounts[date] || 0) + 1;
        }
    });
    
    // Sort by date
    const sortedDates = Object.keys(dateCounts).sort((a, b) => {
        return new Date(a) - new Date(b);
    });
    
    const labels = sortedDates;
    const data = sortedDates.map(date => dateCounts[date]);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cases Reported',
                data: data,
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}


// ========================================
// NEWS & STATS
// ========================================
let allArticles = [];
let displayedArticles = [];
let itemsToShow = 5;
const itemsPerLoad = 5;

// --- SKELETON LOADER FUNCTION ---
function renderSkeletons(count = 5) {
    const newsFeed = document.getElementById('news-feed');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    newsFeed.innerHTML = ''; // Clear existing
    if (loadMoreBtn) loadMoreBtn.style.display = 'none'; // Hide button while loading
    
    for (let i = 0; i < count; i++) {
        const li = document.createElement('li');
        li.className = 'news-card skeleton-card'; // Special class for styling
        li.innerHTML = `
            <div class="skeleton skeleton-image"></div>
            <div class="news-content" style="width: 100%;">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-meta"></div>
            </div>
        `;
        newsFeed.appendChild(li);
    }
}

// --- RENDER NEWS ---
function renderNews() {
    const newsFeed = document.getElementById('news-feed');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        newsFeed.innerHTML = '';
    if (displayedArticles.length === 0) {
        newsFeed.innerHTML = '<li style="padding:20px; color:var(--text-muted);">No news found.</li>';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }
    
    const visibleArticles = displayedArticles.slice(0, itemsToShow);
    visibleArticles.forEach(article => {
        let cleanDesc = article.description ? article.description.replace(/<[^>]*>?/gm, '') : "Click to read full story.";
        if (cleanDesc.length > 120) cleanDesc = cleanDesc.substring(0, 120) + "...";
        
        // Image Hunt Logic
        let imageUrl = article.thumbnail || article.enclosure?.link;
        if (!imageUrl && article.description) {
            const imgMatch = article.description.match(/src="([^"]+)"/);
            if (imgMatch) imageUrl = imgMatch[1];
        }
        
        // Fallbacks
        if (!imageUrl) {
            const placeHolders = [
                'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=150&q=80',
                'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=150&q=80',
                'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=150&q=80'
            ];
            imageUrl = placeHolders[Math.floor(Math.random() * placeHolders.length)];
        }
        
            const li = document.createElement('li');
        li.className = 'news-card';
            li.innerHTML = `
            <img src="${imageUrl}" 
                 alt="News Thumbnail" 
                 class="news-image" 
                 onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=150&q=80';">
            <div class="news-content">
                <h4>${article.title}</h4>
                <p>${cleanDesc}</p>
                <span class="news-meta">
                    SOURCE: ${article.author || "Security Web"} • ${new Date(article.pubDate).toLocaleDateString()}
                </span>
            </div>
        `;
        li.addEventListener('click', () => window.open(article.link, '_blank'));
            newsFeed.appendChild(li);
        });
    
    // Button Logic
    if (loadMoreBtn) {
        if (itemsToShow >= displayedArticles.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }
}

// --- FETCH LOGIC ---
async function fetchNews(category = 'all') {
    // 1. SHOW SKELETONS BEFORE FETCHING
    renderSkeletons(5);
    
    let rssUrls = [];
    if (category === 'all') {
        rssUrls = [
            'https://thehackernews.com/feeds/posts/default',
            'https://www.bleepingcomputer.com/feed/'
        ];
    } else {
        rssUrls = [`https://thehackernews.com/feeds/posts/default/-/${encodeURIComponent(category)}`];
    }
    
    try {
        allArticles = []; 
        
        const promises = rssUrls.map(url => 
            fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`)
                .then(res => res.json())
        );
        
        const results = await Promise.all(promises);
        results.forEach(data => {
            if (data.status === 'ok') {
                allArticles = [...allArticles, ...data.items];
            }
        });
        
        allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        displayedArticles = allArticles;
        itemsToShow = 5;
        
        // 2. RENDER REAL NEWS (Replaces Skeletons)
        renderNews();
    } catch (err) {
        console.error(err);
        const newsFeed = document.getElementById('news-feed');
        if (newsFeed) {
            newsFeed.innerHTML = '<li>Failed to load news.</li>';
        }
    }
}

// --- LOAD NEWS (called from navigation) ---
async function loadNews() {
    await fetchNews('all');
}

// --- INITIALIZE NEWS FILTERS (called on DOMContentLoaded) ---
function initializeNewsFilters() {
    const categoryFilter = document.getElementById('newsCategory');
    const searchInput = document.getElementById('newsSearchInput');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            fetchNews(e.target.value);
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            displayedArticles = allArticles.filter(a => 
                a.title.toLowerCase().includes(term) ||
                (a.description && a.description.toLowerCase().includes(term))
            );
            itemsToShow = 5;
            renderNews();
        });
    }
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            itemsToShow += itemsPerLoad;
            renderNews();
        });
    }
}

// ========================================
// FAQ
// ========================================

function setupFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(button => {
        button.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQs
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked FAQ if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

function sendLocalStorageToServer() {
    const stored = localStorage.getItem('onestopcentre_reports');
    if (!stored) return;

    const cases = JSON.parse(stored);

    fetch('http://localhost:5500/update-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cases)
    })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error('Failed to send cases to server', err));
}

// Optional: send every minute automatically
setInterval(sendLocalStorageToServer, 60000);

// ========================================
// INITIALIZATION
// ========================================

// ========================================
// SAMPLE DATA GENERATION
// ========================================

function generateSampleData() {
    const crimeTypes = ['phishing', 'hacking', 'scam', 'identity-theft', 'cyberbullying', 'malware', 'financial-fraud', 'data-breach'];
    const platforms = ['WhatsApp', 'Instagram', 'Email', 'Facebook', 'Bank Website', 'Telegram', 'Twitter', 'LinkedIn', 'Online Shopping', 'Mobile App'];
    const statuses = ['New', 'Investigating', 'Resolved'];
    const priorities = ['High', 'Medium', 'Low'];
    const names = ['John Doe', 'Jane Smith', 'Ahmed Hassan', 'Maria Garcia', 'David Lee', 'Sarah Johnson', 'Michael Chen', 'Emily Brown'];
    const emails = ['john@example.com', 'jane@example.com', 'ahmed@example.com', 'maria@example.com', 'david@example.com', 'sarah@example.com', 'michael@example.com', 'emily@example.com'];
    const phones = ['+60 12-345 6789', '+60 13-456 7890', '+60 14-567 8901', '+60 15-678 9012', '+60 16-789 0123', '+60 17-890 1234', '+60 18-901 2345', '+60 19-012 3456'];
    
    const descriptions = [
        'Received suspicious email asking for personal information and password reset. Email looked legitimate but had suspicious links.',
        'My account was accessed from an unknown location. I noticed unauthorized transactions and changed my password immediately.',
        'Received a message claiming I won a prize and needed to pay a processing fee. The message came from an unknown number.',
        'Someone created social media accounts using my name and photos. They are impersonating me online.',
        'Received threatening messages and harassment through social media. The person is spreading false information about me.',
        'My computer was infected with ransomware. Files are encrypted and I am being asked to pay Bitcoin to unlock them.',
        'Received a call from someone claiming to be from my bank asking for account details. Later found out it was a scam.',
        'Company database was breached and customer information was leaked. Multiple customers reported suspicious activity.'
    ];
    
    const sampleReports = [];
    const now = new Date();
    
    // Generate 25 sample reports with varied data
    for (let i = 0; i < 25; i++) {
        const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
        const incidentDate = new Date(now);
        incidentDate.setDate(incidentDate.getDate() - daysAgo);
        
        const submittedDate = new Date(incidentDate);
        submittedDate.setDate(submittedDate.getDate() + Math.floor(Math.random() * 3)); // Submitted 0-2 days after incident
        
        const crimeType = crimeTypes[Math.floor(Math.random() * crimeTypes.length)];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const isAnonymous = Math.random() > 0.6; // 40% anonymous
        
        const nameIndex = Math.floor(Math.random() * names.length);
        
        // Determine resolved date if status is Resolved
        let resolvedDate = null;
        if (status === 'Resolved') {
            resolvedDate = new Date(submittedDate);
            resolvedDate.setDate(resolvedDate.getDate() + Math.floor(Math.random() * 30) + 1); // 1-30 days to resolve
        }
        
        const caseNumber = `CR-${now.getFullYear()}-${String(i + 1).padStart(4, '0')}`;
        
        sampleReports.push({
            caseNumber: caseNumber,
            crimeType: crimeType,
            incidentDate: incidentDate.toISOString().split('T')[0],
            incidentTime: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
            platform: platform,
            description: descriptions[Math.floor(Math.random() * descriptions.length)],
            reporterName: isAnonymous ? '' : names[nameIndex],
            reporterEmail: isAnonymous ? '' : emails[nameIndex],
            reporterPhone: isAnonymous ? '' : phones[nameIndex],
            anonymous: isAnonymous,
            status: status,
            priority: priority,
            submittedAt: submittedDate.toISOString(),
            updatedAt: status !== 'New' ? (resolvedDate || submittedDate).toISOString() : submittedDate.toISOString(),
            resolvedAt: resolvedDate ? resolvedDate.toISOString() : null,
            assignedTo: status !== 'New' ? `Investigator ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}` : null,
            files: []
        });
    }
    
    // Store sample data
    localStorage.setItem('onestopcentre_reports', JSON.stringify(sampleReports));
    reports = sampleReports;
    
    // Send to server
    fetch('http://localhost:5500/update-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleReports)
    })
    .then(res => res.json())
    .then(data => {
        console.log('Sample data sent to server:', data);
        
        // Reload stats and predictions
        loadStats();
        loadPredictions();
        
        // Show success message
        alert(`✅ Sample data loaded successfully!\n\nGenerated ${sampleReports.length} sample reports with varied:\n• Crime types\n• Platforms\n• Statuses\n• Priorities\n• Dates (last 90 days)\n\nNavigate to "Track Report" to see case details.`);
    })
    .catch(err => {
        console.error('Failed to send sample data to server:', err);
        // Still update local display even if server fails
        loadStats();
        loadPredictions();
        alert(`✅ Sample data loaded locally!\n\nGenerated ${sampleReports.length} sample reports.\n\nNote: Server connection failed, but data is available in browser.`);
    });
}

// ========================================
// INITIALIZATION
// ========================================

// Load reports from localStorage on startup
document.addEventListener('DOMContentLoaded', function() {
    const stored = localStorage.getItem('onestopcentre_reports');
    if (stored) {
        reports = JSON.parse(stored);
    }
});
