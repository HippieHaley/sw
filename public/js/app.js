// Application State
const state = {
    token: localStorage.getItem('auth_token'),
    user: null,
    currentView: 'content',
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear()
};

// API Base URL
const API_URL = '/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

// Show/hide screens
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Show notification
function showNotification(message, type = 'info') {
    alert(message); // Simple alert, could be replaced with a better notification system
}

// Authentication
function initAuth() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const emergencyDeleteBtn = document.getElementById('emergency-delete-btn');

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            document.getElementById(`${tab}-form`).classList.add('active');
        });
    });

    loginBtn.addEventListener('click', async () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const data = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            state.token = data.token;
            state.user = data.user;
            localStorage.setItem('auth_token', data.token);

            document.getElementById('username-display').textContent = data.user.username;
            showScreen('dashboard-screen');
            loadDashboard();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    registerBtn.addEventListener('click', async () => {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        try {
            const data = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            state.token = data.token;
            state.user = data.user;
            localStorage.setItem('auth_token', data.token);

            document.getElementById('username-display').textContent = data.user.username;
            showScreen('dashboard-screen');
            loadDashboard();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    logoutBtn.addEventListener('click', () => {
        state.token = null;
        state.user = null;
        localStorage.removeItem('auth_token');
        showScreen('auth-screen');
    });

    emergencyDeleteBtn.addEventListener('click', async () => {
        if (confirm('⚠️ WARNING: This will permanently delete ALL your content. This action cannot be undone. Are you sure?')) {
            if (confirm('🚨 FINAL WARNING: All files and data will be permanently deleted. Continue?')) {
                try {
                    const data = await apiCall('/content/emergency-delete', {
                        method: 'POST'
                    });
                    showNotification(`✓ ${data.message}`, 'success');
                    loadContent();
                } catch (error) {
                    showNotification(error.message, 'error');
                }
            }
        }
    });

    // Check if already logged in
    if (state.token) {
        verifyToken();
    }
}

async function verifyToken() {
    try {
        const data = await apiCall('/auth/verify');
        state.user = data.user;
        document.getElementById('username-display').textContent = data.user.username;
        showScreen('dashboard-screen');
        loadDashboard();
    } catch (error) {
        state.token = null;
        localStorage.removeItem('auth_token');
        showScreen('auth-screen');
    }
}

// Navigation
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            
            item.classList.add('active');
            const view = item.dataset.view;
            state.currentView = view;
            document.getElementById(`${view}-view`).classList.add('active');

            // Load view data
            loadView(view);
        });
    });
}

function loadView(view) {
    switch(view) {
        case 'content':
            loadContent();
            break;
        case 'calendar':
            loadCalendar();
            break;
        case 'platforms':
            loadPlatforms();
            break;
        case 'hashtags':
            loadHashtags();
            break;
    }
}

function loadDashboard() {
    loadContent();
}

// Content Management
function initContent() {
    const uploadBtn = document.getElementById('upload-btn');
    const cancelUploadBtn = document.getElementById('cancel-upload');
    const submitUploadBtn = document.getElementById('submit-upload');
    const uploadForm = document.getElementById('upload-form');

    uploadBtn.addEventListener('click', () => {
        uploadForm.classList.remove('hidden');
    });

    cancelUploadBtn.addEventListener('click', () => {
        uploadForm.classList.add('hidden');
        document.getElementById('file-input').value = '';
        document.getElementById('content-title').value = '';
        document.getElementById('content-description').value = '';
        document.getElementById('content-schedule').value = '';
    });

    submitUploadBtn.addEventListener('click', async () => {
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];

        if (!file) {
            showNotification('Please select a file', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', document.getElementById('content-title').value);
        formData.append('description', document.getElementById('content-description').value);
        formData.append('scheduledDate', document.getElementById('content-schedule').value);

        try {
            document.getElementById('upload-progress').classList.remove('hidden');
            submitUploadBtn.disabled = true;

            const response = await fetch(`${API_URL}/content/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${state.token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            showNotification('✓ ' + data.message, 'success');
            uploadForm.classList.add('hidden');
            document.getElementById('upload-progress').classList.add('hidden');
            submitUploadBtn.disabled = false;
            
            // Reset form
            fileInput.value = '';
            document.getElementById('content-title').value = '';
            document.getElementById('content-description').value = '';
            document.getElementById('content-schedule').value = '';

            loadContent();
        } catch (error) {
            showNotification(error.message, 'error');
            document.getElementById('upload-progress').classList.add('hidden');
            submitUploadBtn.disabled = false;
        }
    });
}

async function loadContent() {
    try {
        const data = await apiCall('/content');
        const contentList = document.getElementById('content-list');
        
        if (data.content.length === 0) {
            contentList.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 40px;">No content yet. Upload your first file!</p>';
            return;
        }

        contentList.innerHTML = data.content.map(item => `
            <div class="content-card">
                <h3>${item.title || 'Untitled'}</h3>
                <span class="status ${item.status}">${item.status}</span>
                <p style="color: var(--gray); font-size: 0.9rem; margin: 10px 0;">
                    ${item.description || 'No description'}
                </p>
                <p style="font-size: 0.85rem; color: var(--gray);">
                    Type: ${item.file_type}
                </p>
                ${item.scheduled_date ? `<p style="font-size: 0.85rem; color: var(--gray);">📅 ${new Date(item.scheduled_date).toLocaleString()}</p>` : ''}
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button class="btn btn-sm btn-danger" onclick="deleteContent(${item.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function deleteContent(id) {
    if (confirm('Are you sure you want to delete this content?')) {
        try {
            await apiCall(`/content/${id}`, { method: 'DELETE' });
            showNotification('✓ Content deleted', 'success');
            loadContent();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }
}

// Calendar
function initCalendar() {
    document.getElementById('prev-month').addEventListener('click', () => {
        state.currentMonth--;
        if (state.currentMonth < 0) {
            state.currentMonth = 11;
            state.currentYear--;
        }
        loadCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        state.currentMonth++;
        if (state.currentMonth > 11) {
            state.currentMonth = 0;
            state.currentYear++;
        }
        loadCalendar();
    });
}

async function loadCalendar() {
    try {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        
        document.getElementById('current-month').textContent = 
            `${monthNames[state.currentMonth]} ${state.currentYear}`;

        const data = await apiCall(`/calendar/events?year=${state.currentYear}&month=${state.currentMonth + 1}`);
        
        // Generate calendar grid
        const firstDay = new Date(state.currentYear, state.currentMonth, 1).getDay();
        const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
        
        const calendarGrid = document.getElementById('calendar-grid');
        calendarGrid.innerHTML = '';

        // Day headers
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const header = document.createElement('div');
            header.style.fontWeight = 'bold';
            header.style.textAlign = 'center';
            header.style.padding = '10px';
            header.textContent = day;
            calendarGrid.appendChild(header);
        });

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            calendarGrid.appendChild(empty);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            
            const dateStr = `${state.currentYear}-${String(state.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const eventsForDay = data.events.filter(e => e.event_date === dateStr);
            
            const today = new Date();
            if (today.getDate() === day && 
                today.getMonth() === state.currentMonth && 
                today.getFullYear() === state.currentYear) {
                dayCell.classList.add('today');
            }

            dayCell.innerHTML = `
                <div class="day-number">${day}</div>
                <div class="events">${eventsForDay.length} event(s)</div>
            `;

            calendarGrid.appendChild(dayCell);
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Platforms
function initPlatforms() {
    const addPlatformBtn = document.getElementById('add-platform-btn');
    const cancelPlatformBtn = document.getElementById('cancel-platform');
    const connectPlatformBtn = document.getElementById('connect-platform');
    const platformForm = document.getElementById('platform-form');

    addPlatformBtn.addEventListener('click', () => {
        platformForm.classList.remove('hidden');
    });

    cancelPlatformBtn.addEventListener('click', () => {
        platformForm.classList.add('hidden');
    });

    connectPlatformBtn.addEventListener('click', async () => {
        const platformName = document.getElementById('platform-select').value;
        const credentialsText = document.getElementById('platform-credentials').value;

        if (!platformName) {
            showNotification('Please select a platform', 'error');
            return;
        }

        try {
            const credentials = JSON.parse(credentialsText);
            
            await apiCall('/platforms/connect', {
                method: 'POST',
                body: JSON.stringify({ platformName, credentials })
            });

            showNotification('✓ Platform connected', 'success');
            platformForm.classList.add('hidden');
            document.getElementById('platform-select').value = '';
            document.getElementById('platform-credentials').value = '';
            loadPlatforms();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    document.getElementById('cross-post-btn').addEventListener('click', async () => {
        const contentId = document.getElementById('cross-post-content').value;
        const platformCheckboxes = document.querySelectorAll('#cross-post-platforms input:checked');
        const platforms = Array.from(platformCheckboxes).map(cb => cb.value);

        if (!contentId || platforms.length === 0) {
            showNotification('Please select content and at least one platform', 'error');
            return;
        }

        try {
            const data = await apiCall('/platforms/cross-post', {
                method: 'POST',
                body: JSON.stringify({ contentId, platforms })
            });

            showNotification('✓ ' + data.message, 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}

async function loadPlatforms() {
    try {
        const data = await apiCall('/platforms');
        const platformsList = document.getElementById('platforms-list');
        
        if (data.platforms.length === 0) {
            platformsList.innerHTML = '<p style="text-align: center; color: var(--gray);">No platforms connected</p>';
        } else {
            platformsList.innerHTML = data.platforms.map(platform => `
                <div class="platform-card ${platform.is_active ? 'active' : ''}">
                    <h3>${platform.platform_name}</h3>
                    <p style="font-size: 0.85rem; color: var(--gray);">
                        Connected: ${new Date(platform.created_at).toLocaleDateString()}
                    </p>
                    <button class="btn btn-sm btn-danger" onclick="disconnectPlatform(${platform.id})">
                        Disconnect
                    </button>
                </div>
            `).join('');
        }

        // Update cross-post platform checkboxes
        const crossPostPlatforms = document.getElementById('cross-post-platforms');
        crossPostPlatforms.innerHTML = data.platforms.map(platform => `
            <label>
                <input type="checkbox" value="${platform.platform_name}">
                ${platform.platform_name}
            </label>
        `).join('');

        // Load content for cross-posting dropdown
        const contentData = await apiCall('/content');
        const crossPostContent = document.getElementById('cross-post-content');
        crossPostContent.innerHTML = '<option value="">Select content to post</option>' +
            contentData.content.map(item => `
                <option value="${item.id}">${item.title || 'Untitled'} (${item.status})</option>
            `).join('');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function disconnectPlatform(id) {
    if (confirm('Disconnect this platform?')) {
        try {
            await apiCall(`/platforms/${id}`, { method: 'DELETE' });
            showNotification('✓ Platform disconnected', 'success');
            loadPlatforms();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }
}

// Hashtags
async function loadHashtags() {
    const platforms = ['twitter', 'instagram', 'onlyfans', 'fansly', 'manyvids', 'reddit'];
    const container = document.getElementById('hashtags-container');
    
    container.innerHTML = '';

    for (const platform of platforms) {
        try {
            const data = await apiCall(`/platforms/${platform}/hashtags`);
            
            const section = document.createElement('div');
            section.className = 'hashtag-section';
            section.innerHTML = `
                <h3>${platform}</h3>
                <textarea class="hashtag-input" id="hashtags-${platform}" 
                          placeholder="Enter hashtags separated by spaces (e.g., #tag1 #tag2)"
                          rows="3">${data.hashtags.join(' ')}</textarea>
                <button class="btn btn-primary btn-sm" onclick="saveHashtags('${platform}')">
                    Save ${platform} Hashtags
                </button>
            `;
            container.appendChild(section);
        } catch (error) {
            console.error(`Failed to load hashtags for ${platform}:`, error);
        }
    }
}

async function saveHashtags(platform) {
    const input = document.getElementById(`hashtags-${platform}`);
    const hashtagsText = input.value.trim();
    const hashtags = hashtagsText ? hashtagsText.split(/\s+/).filter(t => t.length > 0) : [];

    try {
        await apiCall(`/platforms/${platform}/hashtags`, {
            method: 'POST',
            body: JSON.stringify({ hashtags })
        });

        showNotification(`✓ Hashtags saved for ${platform}`, 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initNavigation();
    initContent();
    initCalendar();
    initPlatforms();
});
