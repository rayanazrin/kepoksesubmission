// ========================================
// INVESTIGATOR PANEL - JavaScript
// ========================================

let allCases = [];
let filteredCases = [];

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    loadCases();
    updateDashboard();
    initializeThreatNewsFilters();
});

// ========================================
// AUTHENTICATION
// ========================================

function logout() {
    // Clear session
    sessionStorage.removeItem('investigator_logged_in');
    sessionStorage.removeItem('investigator_username');
    
    // Redirect to login page
    window.location.href = 'investigator-login.html';
}

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
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Load section-specific data
    if (sectionId === 'cases') {
        displayAllCases();
    } else if (sectionId === 'analytics') {
        loadAnalytics();
    } else if (sectionId === 'news') {
        loadThreatNews();
    }
}

// ========================================
// LOAD CASES
// ========================================

function loadCases() {
    // Load from localStorage
    const stored = localStorage.getItem('onestopcentre_reports');
    if (stored) {
        allCases = JSON.parse(stored);
        filteredCases = [...allCases];
    } else {
        // Sample data for demonstration
        allCases = generateSampleCases();
        filteredCases = [...allCases];
    }
}


function generateSampleCases() {
    return [
        {
            caseNumber: 'CR-2025-0001',
            crimeType: 'phishing',
            incidentDate: '2025-11-14',
            platform: 'Email',
            description: 'Received fake banking email requesting password reset',
            status: 'New',
            priority: 'High',
            submittedAt: new Date('2025-11-14T10:30:00').toISOString(),
            reporterEmail: 'user1@example.com',
            anonymous: false
        },
        {
            caseNumber: 'CR-2025-0002',
            crimeType: 'hacking',
            incidentDate: '2025-11-13',
            platform: 'Instagram',
            description: 'Social media account hacked, unauthorized posts made',
            status: 'Investigating',
            priority: 'High',
            submittedAt: new Date('2025-11-13T15:45:00').toISOString(),
            assignedTo: 'INV-001',
            reporterEmail: 'user2@example.com',
            anonymous: false
        },
        {
            caseNumber: 'CR-2025-0003',
            crimeType: 'scam',
            incidentDate: '2025-11-12',
            platform: 'WhatsApp',
            description: 'Received messages claiming lottery winnings, requesting payment',
            status: 'Resolved',
            priority: 'Medium',
            submittedAt: new Date('2025-11-12T09:15:00').toISOString(),
            resolvedAt: new Date('2025-11-14T16:00:00').toISOString(),
            reporterEmail: 'user3@example.com',
            anonymous: false
        }
    ];
}

// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {
    const newCases = allCases.filter(c => c.status === 'New').length;
    const activeCases = allCases.filter(c => c.status === 'Investigating').length;
    const resolvedCases = allCases.filter(c => c.status === 'Resolved').length;
    const highPriority = allCases.filter(c => c.priority === 'High').length;
    
    document.getElementById('newCases').textContent = newCases;
    document.getElementById('activeCases').textContent = activeCases;
    document.getElementById('resolvedCases').textContent = resolvedCases;
    document.getElementById('highPriority').textContent = highPriority;
    
    displayRecentCases();
    displayCrimeTypeChart();
}

function displayRecentCases() {
    const container = document.getElementById('recentCasesList');
    
    if (allCases.length === 0) {
        container.innerHTML = '<p class="no-data">No cases to display</p>';
        return;
    }
    
    // Get 5 most recent cases
    const recent = [...allCases]
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5);
    
    container.innerHTML = recent.map(caseData => `
        <div class="case-row" onclick="viewCaseDetail('${caseData.caseNumber}')">
            <div class="case-number">${caseData.caseNumber}</div>
            <div class="case-type">${formatCrimeType(caseData.crimeType)}</div>
            <div class="case-date">${formatDate(caseData.submittedAt)}</div>
            <div class="case-priority ${caseData.priority.toLowerCase()}">${caseData.priority}</div>
            <div class="case-status ${caseData.status.toLowerCase()}">${caseData.status}</div>
        </div>
    `).join('');
}

function displayCrimeTypeChart() {
    const chartContainer = document.getElementById('crimeTypeChart');
    const totalElement = document.getElementById('crimeTypeTotal');
    
    // Count crime types
    const typeCounts = {};
    allCases.forEach(c => {
        const type = c.crimeType || 'other';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    if (Object.keys(typeCounts).length === 0) {
        chartContainer.innerHTML = '<p class="no-data">No data to display</p>';
        if (totalElement) totalElement.textContent = 'Total: 0 cases';
        return;
    }
    
    // Update total count
    const totalCases = allCases.length;
    if (totalElement) {
        totalElement.textContent = `Total: ${totalCases} ${totalCases === 1 ? 'case' : 'cases'}`;
    }
    
    // Sort by count (descending) for better visualization
    const sortedEntries = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1]);
    
    // Prepare data for Chart.js
    const labels = sortedEntries.map(([type]) => formatCrimeType(type));
    const data = sortedEntries.map(([, count]) => count);
    
    // Color palette - modern, professional colors
    const colors = [
        'rgba(59, 130, 246, 0.9)',   // Blue - Phishing
        'rgba(239, 68, 68, 0.9)',   // Red - Hacking
        'rgba(245, 158, 11, 0.9)',   // Orange - Scam
        'rgba(139, 92, 246, 0.9)',   // Purple - Identity Theft
        'rgba(236, 72, 153, 0.9)',   // Pink - Cyberbullying
        'rgba(16, 185, 129, 0.9)',   // Green - Malware
        'rgba(14, 165, 233, 0.9)',   // Sky Blue - Financial Fraud
        'rgba(251, 146, 60, 0.9)',   // Amber - Data Breach
        'rgba(107, 114, 128, 0.9)'   // Gray - Other
    ];
    
    // Clear container and create canvas
    chartContainer.innerHTML = '<canvas id="crimeTypeChartCanvas"></canvas>';
    const canvas = document.getElementById('crimeTypeChartCanvas');
    
    if (!canvas) return;
    
    // Destroy existing chart if it exists
    if (window.crimeTypeChartInstance) {
        window.crimeTypeChartInstance.destroy();
    }
    
    // Create new Chart.js horizontal bar chart
    const ctx = canvas.getContext('2d');
    window.crimeTypeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Cases',
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: colors.slice(0, labels.length).map(c => c.replace('0.9', '1')),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bar chart
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.x;
                            const total = data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${value} case${value !== 1 ? 's' : ''} (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 12
                        },
                        stepSize: 1,
                        precision: 0
                    }
                },
                y: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                            size: 13,
                            weight: '500'
                        },
                        padding: 12
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// ========================================
// ALL CASES
// ========================================

function displayAllCases() {
    const container = document.getElementById('casesList');
    
    if (filteredCases.length === 0) {
        container.innerHTML = '<p class="no-data">No cases match your filters</p>';
        return;
    }
    
    container.innerHTML = filteredCases.map(caseData => `
        <div class="case-card" onclick="viewCaseDetail('${caseData.caseNumber}')">
            <div class="case-card-header">
                <h4>${caseData.caseNumber}</h4>
                <div class="case-status ${caseData.status.toLowerCase()}">${caseData.status}</div>
            </div>
            <div class="case-card-body">
                <p><strong>Type:</strong> ${formatCrimeType(caseData.crimeType)}</p>
                <p><strong>Platform:</strong> ${caseData.platform || 'Not specified'}</p>
                <p><strong>Date:</strong> ${caseData.incidentDate}</p>
                <p style="margin-top: 12px; color: var(--text-muted);">
                    ${caseData.description.substring(0, 100)}${caseData.description.length > 100 ? '...' : ''}
                </p>
            </div>
            <div class="case-card-footer">
                <div class="case-priority ${caseData.priority.toLowerCase()}">${caseData.priority} Priority</div>
                <small style="color: var(--text-muted);">${formatDate(caseData.submittedAt)}</small>
            </div>
        </div>
    `).join('');
}

// ========================================
// FILTERS
// ========================================

function filterCases() {
    const statusFilter = document.getElementById('filterStatus').value;
    const typeFilter = document.getElementById('filterCrimeType').value;
    const priorityFilter = document.getElementById('filterPriority').value;
    const searchQuery = document.getElementById('searchCase').value.toLowerCase();
    
    filteredCases = allCases.filter(caseData => {
        const matchesStatus = statusFilter === 'all' || caseData.status === statusFilter;
        const matchesType = typeFilter === 'all' || caseData.crimeType === typeFilter;
        const matchesPriority = priorityFilter === 'all' || caseData.priority === priorityFilter;
        const matchesSearch = searchQuery === '' || caseData.caseNumber.toLowerCase().includes(searchQuery);
        
        return matchesStatus && matchesType && matchesPriority && matchesSearch;
    });
    
    displayAllCases();
}

// ========================================
// CASE DETAIL MODAL
// ========================================

function viewCaseDetail(caseNumber) {
    const caseData = allCases.find(c => c.caseNumber === caseNumber);
    
    if (!caseData) {
        alert('Case not found');
        return;
    }
    
    const modal = document.getElementById('caseDetailModal');
    const content = document.getElementById('caseDetailContent');
    
    content.innerHTML = `
        <div class="detail-section">
            <h3>Case Information</h3>
            <div class="detail-grid">
                <div class="detail-label">Case Number:</div>
                <div class="detail-value"><strong>${caseData.caseNumber}</strong></div>
                
                <div class="detail-label">Status:</div>
                <div class="detail-value">
                    <span class="case-status ${caseData.status.toLowerCase()}">${caseData.status}</span>
                </div>
                
                <div class="detail-label">Priority:</div>
                <div class="detail-value">
                    <span class="case-priority ${caseData.priority.toLowerCase()}">${caseData.priority}</span>
                </div>
                
                <div class="detail-label">Crime Type:</div>
                <div class="detail-value">${formatCrimeType(caseData.crimeType)}</div>
                
                <div class="detail-label">Platform:</div>
                <div class="detail-value">${caseData.platform || 'Not specified'}</div>
                
                <div class="detail-label">Incident Date:</div>
                <div class="detail-value">${caseData.incidentDate} ${caseData.incidentTime || ''}</div>
                
                <div class="detail-label">Submitted:</div>
                <div class="detail-value">${formatDate(caseData.submittedAt)}</div>
                
                <div class="detail-label">Assigned To:</div>
                <div class="detail-value">${caseData.assignedTo || 'Not assigned'}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Description</h3>
            <p style="color: var(--text-secondary); line-height: 1.8;">${caseData.description}</p>
        </div>
        
        ${caseData.files && caseData.files.length > 0 ? `
            <div class="detail-section">
                <h3>Evidence Files</h3>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    ${caseData.files.map((file, index) => {
                        const fileName = typeof file === 'string' ? file : (file.name || 'Unknown');
                        const fileData = typeof file === 'object' && file.data ? file.data : null;
                        const isImage = typeof file === 'object' && (file.isImage || file.type?.startsWith('image/'));
                        
                        if (isImage && fileData) {
                            return `
                                <div style="position: relative;">
                                    <img src="${fileData}" alt="${fileName}" 
                                         onclick="viewImage(${JSON.stringify(fileData)}, ${JSON.stringify(fileName)})" 
                                         style="width: 120px; height: 120px; object-fit: cover; border-radius: var(--radius-sm); cursor: pointer; border: 2px solid var(--border-color); transition: all 0.3s ease;"
                                         onmouseover="this.style.borderColor='var(--primary-color)'; this.style.transform='scale(1.05)'"
                                         onmouseout="this.style.borderColor='var(--border-color)'; this.style.transform='scale(1)'"
                                         title="Click to view full size">
                                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; font-size: 11px; border-radius: 0 0 var(--radius-sm) var(--radius-sm); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                                        ${fileName}
                                    </div>
                                </div>
                            `;
                        } else {
                            return `
                        <div style="padding: 12px; background: var(--bg-dark); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                                    📄 ${fileName}
                        </div>
                            `;
                        }
                    }).join('')}
                </div>
            </div>
        ` : ''}
        
        ${!caseData.anonymous ? `
            <div class="detail-section">
                <h3>Reporter Information</h3>
                <div class="detail-grid">
                    <div class="detail-label">Name:</div>
                    <div class="detail-value">${caseData.reporterName || 'Not provided'}</div>
                    
                    <div class="detail-label">Email:</div>
                    <div class="detail-value">${caseData.reporterEmail || 'Not provided'}</div>
                    
                    <div class="detail-label">Phone:</div>
                    <div class="detail-value">${caseData.reporterPhone || 'Not provided'}</div>
                </div>
            </div>
        ` : '<p style="color: var(--text-muted); font-style: italic;">Anonymous report</p>'}
        
        ${(caseData.status === 'Investigating' || caseData.status === 'Resolved') && caseData.assignedTo ? `
            <div class="detail-section" style="border-top: 2px solid var(--primary-color); padding-top: 24px; margin-top: 24px;">
                <h3 style="color: var(--primary-light);">💬 Communication with Reporter</h3>
                <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 16px;">Send messages and solutions to the reporter. They will see these when tracking their case.</p>
                <div id="caseMessages" class="messages-container">
                    ${renderCaseMessages(caseData.messages || [])}
                </div>
                <div class="message-input-area">
                    <textarea id="caseMessageInput" placeholder="Type your message or solution here..." rows="5" style="width: 100%; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-dark); color: var(--text-primary); resize: vertical; font-family: inherit;"></textarea>
                    <div style="display: flex; gap: 12px; margin-top: 12px; align-items: flex-start;">
                        <div style="flex: 1;">
                            <input type="file" id="caseFileInput" multiple accept="image/*,.pdf,.doc,.docx" style="display: none;" onchange="handleCaseFileSelect('${caseData.caseNumber}')">
                            <button class="btn btn-secondary" onclick="document.getElementById('caseFileInput').click()" style="width: 100%;">
                                📎 Attach Files
                            </button>
                        </div>
                        <div id="caseFileList" style="flex: 1; font-size: 12px; color: var(--text-muted); min-height: 40px; padding: 8px; background: var(--bg-darker); border-radius: var(--radius-sm);"></div>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 12px;">
                        <button class="btn btn-primary" onclick="sendCaseMessage('${caseData.caseNumber}')" style="flex: 1;">
                            📤 Send Message
                        </button>
                        <button class="btn btn-success" onclick="sendSolutionAndResolve('${caseData.caseNumber}')" style="flex: 1;">
                            ✅ Send Solution & Resolve
                        </button>
                    </div>
                </div>
            </div>
        ` : caseData.assignedTo && caseData.status === 'New' ? `
            <div class="detail-section" style="background: rgba(245, 158, 11, 0.1); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--warning-color);">
                <p style="color: var(--text-secondary); margin: 0;">
                    <strong>Note:</strong> Case is assigned but status is still "New". Click "Start Investigation" above to enable messaging.
                </p>
            </div>
        ` : ''}
        
        <div class="action-buttons">
            ${caseData.status === 'New' ? `
                <button class="btn btn-primary" onclick="assignCase('${caseData.caseNumber}')">
                    Assign to Me
                </button>
                <button class="btn btn-primary" onclick="updateCaseStatus('${caseData.caseNumber}', 'Investigating')">
                    Start Investigation
                </button>
            ` : ''}
            
            ${caseData.status === 'Investigating' ? `
                <button class="btn btn-success" onclick="updateCaseStatus('${caseData.caseNumber}', 'Resolved')">
                    Mark as Resolved
                </button>
            ` : ''}
            
            ${caseData.status === 'Resolved' ? `
                <button class="btn btn-primary" onclick="updateCaseStatus('${caseData.caseNumber}', 'Closed')">
                    Close Case
                </button>
            ` : ''}
            
            <button class="btn btn-danger" onclick="updateCasePriority('${caseData.caseNumber}')">
                Change Priority
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('caseDetailModal').classList.remove('active');
}

// Close modal on background click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('caseDetailModal');
    if (e.target === modal) {
        closeModal();
    }
});

// ========================================
// CASE ACTIONS
// ========================================

function assignCase(caseNumber) {
    const caseData = allCases.find(c => c.caseNumber === caseNumber);
    if (caseData) {
        caseData.assignedTo = 'INV-001';
        if (caseData.status === 'New') {
            caseData.status = 'Investigating';
            caseData.updatedAt = new Date().toISOString();
        }
        saveCases();
        
        // Reload cases to ensure data is fresh
        loadCases();
        
        // Small delay to ensure data is loaded, then refresh modal
        setTimeout(() => {
            // Refresh the modal content to show messaging section - keep modal open
            viewCaseDetail(caseNumber);
            
            // Scroll to messaging section
            setTimeout(() => {
                const messagesSection = document.querySelector('.detail-section h3');
                if (messagesSection && messagesSection.textContent.includes('Communication')) {
                    messagesSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 200);
        }, 50);
        
        updateDashboard();
        displayAllCases();
    }
}

function updateCaseStatus(caseNumber, newStatus) {
    const caseData = allCases.find(c => c.caseNumber === caseNumber);
    if (caseData) {
        caseData.status = newStatus;
        caseData.updatedAt = new Date().toISOString();
        
        if (newStatus === 'Resolved') {
            caseData.resolvedAt = new Date().toISOString();
        }
        
        saveCases();
        alert(`Case status updated to: ${newStatus}`);
        closeModal();
        updateDashboard();
        displayAllCases();
    }
}

function updateCasePriority(caseNumber) {
    const caseData = allCases.find(c => c.caseNumber === caseNumber);
    if (caseData) {
        const priorities = ['Low', 'Medium', 'High'];
        const currentIndex = priorities.indexOf(caseData.priority);
        const newIndex = (currentIndex + 1) % priorities.length;
        
        caseData.priority = priorities[newIndex];
        saveCases();
        alert(`Priority changed to: ${caseData.priority}`);
        closeModal();
        updateDashboard();
        displayAllCases();
    }
}

function saveCases() {
    localStorage.setItem('onestopcentre_reports', JSON.stringify(allCases));
}

// ========================================
// CASE MESSAGING
// ========================================

let caseMessageFiles = [];

function renderCaseMessages(messages) {
    if (!messages || messages.length === 0) {
        return '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No messages yet. Send a message to communicate with the reporter.</p>';
    }
    
    return messages.map((msg, index) => `
        <div class="message-item investigator-msg">
            <div class="message-header">
                <strong>Investigator ${msg.investigatorId || 'INV-001'}</strong>
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
    `).join('');
}

async function handleCaseFileSelect(caseNumber) {
    const fileInput = document.getElementById('caseFileInput');
    const fileList = document.getElementById('caseFileList');
    
    caseMessageFiles = Array.from(fileInput.files);
    
    if (caseMessageFiles.length > 0) {
        let html = '';
        for (const f of caseMessageFiles) {
            if (f.type.startsWith('image/')) {
                try {
                    const base64 = await fileToBase64(f);
                    html += `
                        <div style="margin: 4px 0; display: flex; align-items: center; gap: 8px;">
                            <img src="${base64}" alt="${f.name}" 
                                 onclick="viewImage(${JSON.stringify(base64)}, ${JSON.stringify(f.name)})" 
                                 style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius-sm); cursor: pointer; border: 1px solid var(--border-color);">
                            <div style="flex: 1;">
                                <div style="font-size: 12px;">🖼️ ${f.name}</div>
                                <div style="font-size: 11px; color: var(--text-muted);">${formatFileSize(f.size)} - Click to view</div>
                            </div>
                        </div>
                    `;
                } catch (error) {
                    html += `<div style="margin: 4px 0;">📄 ${f.name} (${formatFileSize(f.size)})</div>`;
                }
            } else {
                html += `<div style="margin: 4px 0;">📄 ${f.name} (${formatFileSize(f.size)})</div>`;
            }
        }
        fileList.innerHTML = html;
    } else {
        fileList.innerHTML = '';
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

async function sendCaseMessage(caseNumber) {
    const messageInput = document.getElementById('caseMessageInput');
    if (!messageInput) {
        console.error('Message input not found');
        alert('Error: Message input not found. Please refresh the page.');
        return;
    }
    
    const messageText = messageInput.value.trim();
    
    if (!messageText && caseMessageFiles.length === 0) {
        alert('Please enter a message or attach files.');
        return;
    }
    
    // Reload cases to get fresh data
    loadCases();
    const caseData = allCases.find(c => c.caseNumber === caseNumber);
    if (!caseData) {
        alert('Case not found. Please refresh and try again.');
        return;
    }
    
    // Initialize messages array if it doesn't exist
    if (!caseData.messages) {
        caseData.messages = [];
    }
    
    // Create message object
    const message = {
        text: messageText || '(No message text)',
        timestamp: new Date().toISOString(),
        investigatorId: caseData.assignedTo || 'INV-001',
        files: await Promise.all(caseMessageFiles.map(async f => {
            const fileData = {
                name: f.name,
                size: f.size,
                type: f.type
            };
            
            if (f.type.startsWith('image/')) {
                try {
                    fileData.data = await fileToBase64(f);
                    fileData.isImage = true;
                } catch (error) {
                    console.error('Error converting image:', error);
                }
            }
            
            return fileData;
        }))
    };
    
    // Add message to case
    caseData.messages.push(message);
    caseData.updatedAt = new Date().toISOString();
    
    // Save and refresh
    saveCases();
    
    // Reload cases again to ensure sync
    loadCases();
    
    // Refresh modal
    setTimeout(() => {
        viewCaseDetail(caseNumber);
        
        // Scroll to bottom of messages
        setTimeout(() => {
            const messagesContainer = document.getElementById('caseMessages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }, 100);
    }, 50);
    
    // Clear inputs
    messageInput.value = '';
    caseMessageFiles = [];
    const fileInput = document.getElementById('caseFileInput');
    const fileList = document.getElementById('caseFileList');
    if (fileInput) fileInput.value = '';
    if (fileList) fileList.innerHTML = '';
    
    alert('Message sent successfully!');
}

function sendSolutionAndResolve(caseNumber) {
    const messageInput = document.getElementById('caseMessageInput');
    const messageText = messageInput.value.trim();
    
    if (!messageText) {
        if (!confirm('No message text provided. Do you want to mark as resolved without sending a message?')) {
            return;
        }
    }
    
    // Send message first if there's text or files
    if (messageText || caseMessageFiles.length > 0) {
        sendCaseMessage(caseNumber);
    }
    
    // Mark as resolved
    updateCaseStatus(caseNumber, 'Resolved');
    
    alert('Solution sent and case marked as resolved!');
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
// UTILITY FUNCTIONS
// ========================================

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
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// ========================================
// ANALYTICS & PREDICTIONS
// ========================================

function loadAnalytics() {
    loadAnalyticsStats();
    loadAnalyticsPredictions();
    loadAnalyticsCharts();
}

function loadAnalyticsStats() {
    // Load from localStorage
    const storedReports = JSON.parse(localStorage.getItem('onestopcentre_reports') || '[]');
    
    const total = storedReports.length;
    const active = storedReports.filter(r => r.status === 'New' || r.status === 'Investigating').length;
    const resolved = storedReports.filter(r => r.status === 'Resolved').length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    
    document.getElementById('analyticsTotalReports').textContent = total;
    document.getElementById('analyticsActiveReports').textContent = active;
    document.getElementById('analyticsResolvedReports').textContent = resolved;
    document.getElementById('analyticsResolutionRate').textContent = rate + '%';
}

function loadAnalyticsPredictions() {
    const predictionsContainer = document.getElementById('analytics-predictions-container');
    if (!predictionsContainer) return;
    
    // Load reports from localStorage
    const storedReports = JSON.parse(localStorage.getItem('onestopcentre_reports') || '[]');
    
    if (storedReports.length === 0) {
        predictionsContainer.innerHTML = `
            <div class="prediction-empty">
                <p>No data available for predictions yet. Cases will appear here as they are reported.</p>
            </div>
        `;
        return;
    }
    
    // Generate predictions based on data patterns
    const predictions = generateAnalyticsPredictions(storedReports);
    
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

function generateAnalyticsPredictions(reports) {
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
            title: 'Most Common Crime Type',
            value: `${crimeTypeNames[mostCommonCrime[0]] || mostCommonCrime[0]}`,
            description: `${percentage}% of cases involve ${crimeTypeNames[mostCommonCrime[0]] || mostCommonCrime[0].toLowerCase()}. Focus investigation resources accordingly.`,
            trend: {
                type: 'up',
                text: `↑ ${mostCommonCrime[1]} cases`
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
            description: `Most incidents occur on ${peakDay[0]}s. Consider allocating more resources on this day.`,
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
            description: `${topPlatform[0]} requires increased monitoring. ${topPlatform[1]} incidents reported.`,
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
        let trendText = 'Moderate workload';
        if (highPriorityRate > 40) {
            priorityTrend = 'warning';
            trendText = 'High alert: Urgent action needed';
        } else if (highPriorityRate < 20) {
            priorityTrend = 'positive';
            trendText = 'Manageable: Most cases are standard';
        }
        
        predictions.push({
            icon: '📊',
            title: 'Workload Assessment',
            value: `${highPriorityRate}% High Priority`,
            description: `${highPriorityRate}% of cases are high priority. ${trendText}.`,
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
            title: 'Average Resolution Time',
            value: `${avgResolutionTime} days`,
            description: `Cases typically take ${avgResolutionTime} days to resolve. Use this for case planning and resource allocation.`,
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
                title: 'Case Volume Trend',
                value: `${growthRate > 0 ? '+' : ''}${Math.round(growthRate)}%`,
                description: growthRate > 0 
                    ? `Case volume is increasing by ${Math.round(growthRate)}%. Consider scaling up investigation capacity.`
                    : `Case volume decreased by ${Math.round(Math.abs(growthRate))}%. Workload is stabilizing.`,
                trend: {
                    type: growthRate > 0 ? 'warning' : 'positive',
                    text: growthRate > 0 ? '↑ Increasing volume' : '↓ Decreasing volume'
                }
            });
        }
    }
    
    // 7. Investigator Workload
    const assignedCases = reports.filter(r => r.assignedTo);
    const unassignedCases = reports.filter(r => !r.assignedTo && r.status === 'New');
    
    if (reports.length > 0) {
        predictions.push({
            icon: '👥',
            title: 'Case Assignment Status',
            value: `${unassignedCases.length} Unassigned`,
            description: `${unassignedCases.length} new cases need assignment. ${assignedCases.length} cases are currently being investigated.`,
            trend: {
                type: unassignedCases.length > 5 ? 'warning' : 'neutral',
                text: `${assignedCases.length} assigned, ${unassignedCases.length} pending`
            }
        });
    }
    
    return predictions;
}

async function loadAnalyticsCharts() {
    const chartsContainer = document.getElementById('analytics-charts-container');
    if (!chartsContainer) return;
    
    // Load reports from localStorage
    const storedReports = JSON.parse(localStorage.getItem('onestopcentre_reports') || '[]');
    
    if (storedReports.length === 0) {
        chartsContainer.innerHTML = `
            <div class="chart-empty">
                <p>No data available for charts. Cases will appear here as they are reported.</p>
            </div>
        `;
        return;
    }
    
    chartsContainer.innerHTML = '';
    
    // Create chart cards
    createAnalyticsChartCard(chartsContainer, 'Crime Type Distribution', 'analyticsCrimeTypeChart', storedReports);
    createAnalyticsChartCard(chartsContainer, 'Case Status Overview', 'analyticsStatusChart', storedReports);
    createAnalyticsChartCard(chartsContainer, 'Priority Distribution', 'analyticsPriorityChart', storedReports);
    createAnalyticsChartCard(chartsContainer, 'Platform Risk Analysis', 'analyticsPlatformChart', storedReports);
    createAnalyticsChartCard(chartsContainer, 'Cases Timeline', 'analyticsTimelineChart', storedReports);
    createAnalyticsChartCard(chartsContainer, 'Resolution Time Analysis', 'analyticsResolutionChart', storedReports);
    
    // Render charts after a brief delay to ensure DOM is ready
    setTimeout(() => {
        renderAnalyticsCrimeTypeChart(storedReports);
        renderAnalyticsStatusChart(storedReports);
        renderAnalyticsPriorityChart(storedReports);
        renderAnalyticsPlatformChart(storedReports);
        renderAnalyticsTimelineChart(storedReports);
        renderAnalyticsResolutionChart(storedReports);
    }, 100);
}

function createAnalyticsChartCard(container, title, chartId, data) {
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

function renderAnalyticsCrimeTypeChart(reports) {
    const ctx = document.getElementById('analyticsCrimeTypeChart');
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
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
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

function renderAnalyticsStatusChart(reports) {
    const ctx = document.getElementById('analyticsStatusChart');
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

function renderAnalyticsPriorityChart(reports) {
    const ctx = document.getElementById('analyticsPriorityChart');
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

function renderAnalyticsPlatformChart(reports) {
    const ctx = document.getElementById('analyticsPlatformChart');
    if (!ctx) return;
    
    const platformCounts = {};
    reports.forEach(r => {
        if (r.platform && r.platform.trim()) {
            const platform = r.platform.trim();
            platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        }
    });
    
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

function renderAnalyticsTimelineChart(reports) {
    const ctx = document.getElementById('analyticsTimelineChart');
    if (!ctx) return;
    
    const dateCounts = {};
    reports.forEach(r => {
        if (r.submittedAt) {
            const date = new Date(r.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dateCounts[date] = (dateCounts[date] || 0) + 1;
        }
    });
    
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

function renderAnalyticsResolutionChart(reports) {
    const ctx = document.getElementById('analyticsResolutionChart');
    if (!ctx) return;
    
    const resolvedReports = reports.filter(r => r.status === 'Resolved' && r.submittedAt && r.resolvedAt);
    
    if (resolvedReports.length === 0) {
        ctx.parentElement.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;">No resolved cases yet</p>';
        return;
    }
    
    const resolutionTimes = resolvedReports.map(r => {
        const submitted = new Date(r.submittedAt);
        const resolved = new Date(r.resolvedAt || r.updatedAt || r.submittedAt);
        return Math.ceil((resolved - submitted) / (1000 * 60 * 60 * 24)); // days
    });
    
    // Group by resolution time ranges
    const ranges = {
        '0-3 days': 0,
        '4-7 days': 0,
        '8-14 days': 0,
        '15-30 days': 0,
        '30+ days': 0
    };
    
    resolutionTimes.forEach(days => {
        if (days <= 3) ranges['0-3 days']++;
        else if (days <= 7) ranges['4-7 days']++;
        else if (days <= 14) ranges['8-14 days']++;
        else if (days <= 30) ranges['15-30 days']++;
        else ranges['30+ days']++;
    });
    
    const labels = Object.keys(ranges);
    const data = Object.values(ranges);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Cases',
                data: data,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgba(16, 185, 129, 1)',
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
            files: [],
            messages: []
        });
    }
    
    // Store sample data
    localStorage.setItem('onestopcentre_reports', JSON.stringify(sampleReports));
    allCases = sampleReports;
    filteredCases = [...sampleReports];
    
    // Send to server
    fetch('http://localhost:5500/update-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleReports)
    })
    .then(res => res.json())
    .then(data => {
        console.log('Sample data sent to server:', data);
        
        // Reload all sections
        loadCases();
        updateDashboard();
        displayAllCases();
        loadAnalytics();
        
        // Show success message
        alert(`✅ Sample data loaded successfully!\n\nGenerated ${sampleReports.length} sample reports with varied:\n• Crime types\n• Platforms\n• Statuses\n• Priorities\n• Dates (last 90 days)\n\nAll sections have been refreshed.`);
    })
    .catch(err => {
        console.error('Failed to send sample data to server:', err);
        // Still update local display even if server fails
        loadCases();
        updateDashboard();
        displayAllCases();
        loadAnalytics();
        alert(`✅ Sample data loaded locally!\n\nGenerated ${sampleReports.length} sample reports.\n\nNote: Server connection failed, but data is available in browser.`);
    });
}

// ========================================
// CSV EXPORT
// ========================================

function exportToCSV() {
    // Load reports from localStorage
    const storedReports = JSON.parse(localStorage.getItem('onestopcentre_reports') || '[]');
    
    if (storedReports.length === 0) {
        alert('No data available to export. Please load sample data or submit reports first.');
        return;
    }
    
    // Define CSV headers
    const headers = [
        'Case Number',
        'Crime Type',
        'Incident Date',
        'Incident Time',
        'Platform',
        'Description',
        'Status',
        'Priority',
        'Submitted At',
        'Updated At',
        'Resolved At',
        'Assigned To',
        'Reporter Name',
        'Reporter Email',
        'Reporter Phone',
        'Anonymous',
        'Files'
    ];
    
    // Convert reports to CSV rows
    const rows = storedReports.map(report => {
        return [
            escapeCSV(report.caseNumber || ''),
            escapeCSV(report.crimeType || ''),
            escapeCSV(report.incidentDate || ''),
            escapeCSV(report.incidentTime || ''),
            escapeCSV(report.platform || ''),
            escapeCSV(report.description || ''),
            escapeCSV(report.status || ''),
            escapeCSV(report.priority || ''),
            escapeCSV(report.submittedAt || ''),
            escapeCSV(report.updatedAt || ''),
            escapeCSV(report.resolvedAt || ''),
            escapeCSV(report.assignedTo || ''),
            escapeCSV(report.reporterName || ''),
            escapeCSV(report.reporterEmail || ''),
            escapeCSV(report.reporterPhone || ''),
            escapeCSV(report.anonymous ? 'Yes' : 'No'),
            escapeCSV(Array.isArray(report.files) ? report.files.join('; ') : '')
        ];
    });
    
    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `onestopcentre_cases_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    alert(`✅ Successfully exported ${storedReports.length} cases to CSV file!`);
}

function escapeCSV(value) {
    if (value === null || value === undefined) {
        return '';
    }
    
    // Convert to string
    const stringValue = String(value);
    
    // If value contains comma, newline, or quote, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
}

// ========================================
// THREAT INTELLIGENCE & NEWS
// ========================================
let allThreatArticles = [];
let displayedThreatArticles = [];
let threatItemsToShow = 5;
const threatItemsPerLoad = 5;

// --- SKELETON LOADER FUNCTION ---
function renderThreatSkeletons(count = 5) {
    const newsFeed = document.getElementById('threatNewsFeed');
    const loadMoreBtn = document.getElementById('threatLoadMoreBtn');
    
    if (!newsFeed) return;
    
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

// --- RENDER THREAT NEWS ---
function renderThreatNews() {
    const newsFeed = document.getElementById('threatNewsFeed');
    const loadMoreBtn = document.getElementById('threatLoadMoreBtn');
    
    if (!newsFeed) return;
    
    newsFeed.innerHTML = '';
    if (displayedThreatArticles.length === 0) {
        newsFeed.innerHTML = '<li style="padding:20px; color:var(--text-muted);">No news found.</li>';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }
    
    const visibleArticles = displayedThreatArticles.slice(0, threatItemsToShow);
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
        if (threatItemsToShow >= displayedThreatArticles.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }
}

// --- FETCH THREAT NEWS LOGIC ---
async function fetchThreatNews(category = 'all') {
    // 1. SHOW SKELETONS BEFORE FETCHING
    renderThreatSkeletons(5);
    
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
        allThreatArticles = []; 
        
        const promises = rssUrls.map(url => 
            fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`)
                .then(res => res.json())
        );
        
        const results = await Promise.all(promises);
        results.forEach(data => {
            if (data.status === 'ok') {
                allThreatArticles = [...allThreatArticles, ...data.items];
            }
        });
        
        allThreatArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        displayedThreatArticles = allThreatArticles;
        threatItemsToShow = 5;
        
        // 2. RENDER REAL NEWS (Replaces Skeletons)
        renderThreatNews();
    } catch (err) {
        console.error(err);
        const newsFeed = document.getElementById('threatNewsFeed');
        if (newsFeed) {
            newsFeed.innerHTML = '<li>Failed to load news.</li>';
        }
    }
}

// --- LOAD THREAT NEWS (called from navigation) ---
async function loadThreatNews() {
    await fetchThreatNews('all');
    
    // Initialize filters if not already done
    initializeThreatNewsFilters();
}

// --- INITIALIZE THREAT NEWS FILTERS (called on DOMContentLoaded) ---
let threatFiltersInitialized = false;

function initializeThreatNewsFilters() {
    if (threatFiltersInitialized) return; // Prevent duplicate initialization
    
    const categoryFilter = document.getElementById('threatNewsCategory');
    const searchInput = document.getElementById('threatNewsSearchInput');
    const loadMoreBtn = document.getElementById('threatLoadMoreBtn');
    
    if (categoryFilter && !categoryFilter.hasAttribute('data-listener-attached')) {
        categoryFilter.setAttribute('data-listener-attached', 'true');
        categoryFilter.addEventListener('change', (e) => {
            fetchThreatNews(e.target.value);
        });
    }
    
    if (searchInput && !searchInput.hasAttribute('data-listener-attached')) {
        searchInput.setAttribute('data-listener-attached', 'true');
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            displayedThreatArticles = allThreatArticles.filter(a => 
                a.title.toLowerCase().includes(term) ||
                (a.description && a.description.toLowerCase().includes(term))
            );
            threatItemsToShow = 5;
            renderThreatNews();
        });
    }
    
    if (loadMoreBtn && !loadMoreBtn.hasAttribute('data-listener-attached')) {
        loadMoreBtn.setAttribute('data-listener-attached', 'true');
        loadMoreBtn.addEventListener('click', () => {
            threatItemsToShow += threatItemsPerLoad;
            renderThreatNews();
        });
    }
    
    threatFiltersInitialized = true;
}

