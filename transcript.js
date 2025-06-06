/**
 * LearnUpon Transcript Manager
 * Handles API interactions with LearnUpon to fetch and display user and group transcript data
 */

class LearnUponTranscriptManager {    constructor() {
        // API Configuration - using proxy to avoid CORS issues
        this.API_CONFIG = {
            // For production, replace with your deployed proxy URL
            // Examples: 
            // - Vercel: 'https://your-app.vercel.app/api/learupon'
            // - Netlify: 'https://your-app.netlify.app/api/learupon'
            // - Azure Functions: 'https://your-function-app.azurewebsites.net/api/learupon'
            proxyUrl: 'http://localhost:3000/api/learupon', // Local development
            // Fallback to direct API (will have CORS issues)
            baseUrl: 'https://learn.nintex.com/api/v1',
            useProxy: true // Set to false to try direct API calls
        };
        
        // Test data
        this.testData = {
            userEmail: window.testUserEmail || 'ziyi@alrightylabs.com',
            companyName: window.testCompanyName || 'Alrighty Labs Pte. Ltd. (Partner)'
        };
        
        // State management
        this.userTranscript = [];
        this.groupTranscript = [];
        this.userId = null;
        this.groupId = null;
        this.isLoading = false;
        
        // Course categories for organization
        this.courseCategories = {
            'Process Mapping': [],
            'Workflow and Forms': [],
            'Document Generation': [],
            'Analytics and Reporting': [],
            'Platform Administration': [],
            'Integration and API': [],
            'Advanced Features': [],
            'Certification Programs': [],
            'Other': []
        };
        
        // Initialize
        this.initializeUI();
        this.initializeEventListeners();
    }
    
    /**
     * Initialize UI with test data
     */
    initializeUI() {
        document.getElementById('userEmail').textContent = this.testData.userEmail;
        document.getElementById('companyName').textContent = this.testData.companyName;
        document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
        document.getElementById('totalEnrollments').textContent = '0';
        
        this.showMessage('Ready to load transcript data. Click "Load User Transcript" or "Load Group Transcript" to begin.', 'info');
    }
      /**
     * Initialize event listeners for UI interactions
     */
    initializeEventListeners() {
        document.getElementById('loadTranscriptBtn').addEventListener('click', () => this.loadUserTranscript());
        document.getElementById('loadGroupTranscriptBtn').addEventListener('click', () => this.loadGroupTranscript());
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshTranscripts());
        
        // Configuration panel
        document.getElementById('configBtn').addEventListener('click', () => this.showConfigPanel());
        document.getElementById('saveConfigBtn').addEventListener('click', () => this.saveConfiguration());
        document.getElementById('cancelConfigBtn').addEventListener('click', () => this.hideConfigPanel());
        
        // Category collapse/expand functionality
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-header')) {
                this.toggleCategory(e.target.closest('.course-category'));
            }
        });
    }
      /**
     * Get the API URL (proxy or direct)
     */
    getApiUrl(endpoint) {
        if (this.API_CONFIG.useProxy) {
            return `${this.API_CONFIG.proxyUrl}/${endpoint}`;
        }
        return `${this.API_CONFIG.baseUrl}/${endpoint}`;
    }
    
    /**
     * Create authorization header for API requests (only needed for direct calls)
     */
    getAuthHeader() {
        if (this.API_CONFIG.useProxy) {
            return null; // Proxy handles authentication
        }
        const credentials = btoa(`${this.API_CONFIG.username}:${this.API_CONFIG.password}`);
        return `Basic ${credentials}`;
    }
    
    /**
     * Create fetch headers
     */
    getFetchHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        const authHeader = this.getAuthHeader();
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }
        
        return headers;
    }
    
    /**
     * Display messages to the user
     */
    showMessage(message, type = 'info') {
        const messageArea = document.getElementById('messageArea');
        const messageClass = type === 'error' ? 'error' : type === 'success' ? 'success' : 'info';
        
        messageArea.innerHTML = `<div class="${messageClass}">${message}</div>`;
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageArea.innerHTML = '';
            }, 5000);
        }
    }
    
    /**
     * Show loading state
     */
    showLoading(message = 'Loading transcript data...') {
        this.isLoading = true;
        document.getElementById('loadTranscriptBtn').disabled = true;
        document.getElementById('loadGroupTranscriptBtn').disabled = true;
        this.showMessage(message, 'info');
    }
    
    /**
     * Hide loading state
     */
    hideLoading() {
        this.isLoading = false;
        document.getElementById('loadTranscriptBtn').disabled = false;
        document.getElementById('loadGroupTranscriptBtn').disabled = false;
        document.getElementById('refreshBtn').disabled = false;
    }
      /**
     * Find user by email
     */
    async findUserByEmail(email) {
        try {
            const url = this.getApiUrl(`users?email=${encodeURIComponent(email)}`);
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getFetchHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            const users = data.users || data.data || data || [];
            
            if (users.length === 0) {
                throw new Error(`User with email "${email}" not found`);
            }
            
            return users[0];
            
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }
      /**
     * Find group by name
     */
    async findGroupByName(groupName) {
        try {
            const url = this.getApiUrl('groups');
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getFetchHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            const groups = data.groups || data.data || data || [];
            
            const matchingGroup = groups.find(group => 
                group.name && group.name.toLowerCase().includes(groupName.toLowerCase())
            );
            
            if (!matchingGroup) {
                throw new Error(`Group containing "${groupName}" not found`);
            }
            
            return matchingGroup;
            
        } catch (error) {
            console.error('Error finding group:', error);
            throw error;
        }
    }
      /**
     * Fetch user enrollments
     */
    async fetchUserEnrollments(userId) {
        try {
            const url = this.getApiUrl(`users/${userId}/enrollments`);
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getFetchHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.enrollments || data.data || data || [];
            
        } catch (error) {
            console.error('Error fetching user enrollments:', error);
            throw error;
        }
    }
      /**
     * Fetch user course completions
     */
    async fetchUserCompletions(userId) {
        try {
            const url = this.getApiUrl(`users/${userId}/course_completions`);
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getFetchHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.course_completions || data.data || data || [];
            
        } catch (error) {
            console.error('Error fetching user completions:', error);
            throw error;
        }
    }
      /**
     * Fetch group members and their transcripts
     */
    async fetchGroupTranscript(groupId) {
        try {
            // First get group members
            const membersUrl = this.getApiUrl(`groups/${groupId}/users`);
            const membersResponse = await fetch(membersUrl, {
                method: 'GET',
                headers: this.getFetchHeaders()
            });
            
            if (!membersResponse.ok) {
                throw new Error(`HTTP error! status: ${membersResponse.status} - ${membersResponse.statusText}`);
            }
            
            const membersData = await membersResponse.json();
            const members = membersData.users || membersData.data || membersData || [];
            
            // Fetch completions for each member
            const allCompletions = [];
            for (const member of members.slice(0, 10)) { // Limit to first 10 members for demo
                try {
                    const completions = await this.fetchUserCompletions(member.id);
                    completions.forEach(completion => {
                        completion.user_name = member.name || member.email;
                        completion.user_email = member.email;
                        allCompletions.push(completion);
                    });
                } catch (error) {
                    console.warn(`Could not fetch completions for user ${member.id}:`, error);
                }
            }
            
            return allCompletions;
            
        } catch (error) {
            console.error('Error fetching group transcript:', error);
            throw error;
        }
    }
    
    /**
     * Load user transcript
     */
    async loadUserTranscript() {
        if (this.isLoading) return;
        
        this.showLoading('Finding user and loading transcript...');
        
        try {
            // Find user by email
            const user = await this.findUserByEmail(this.testData.userEmail);
            this.userId = user.id;
            
            this.showMessage(`Found user: ${user.name || user.email}. Loading enrollments and completions...`, 'info');
            
            // Fetch enrollments and completions
            const [enrollments, completions] = await Promise.all([
                this.fetchUserEnrollments(user.id),
                this.fetchUserCompletions(user.id)
            ]);
            
            this.userTranscript = this.combineEnrollmentsAndCompletions(enrollments, completions);
            
            // Update UI
            document.getElementById('totalEnrollments').textContent = this.userTranscript.length;
            document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
            
            this.displayUserTranscript();
            this.updateUserStats();
            
            this.showMessage(`Successfully loaded user transcript with ${this.userTranscript.length} courses!`, 'success');
            
        } catch (error) {
            this.showMessage(`Error loading user transcript: ${error.message}`, 'error');
            console.error('Load user transcript error:', error);
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * Load group transcript
     */
    async loadGroupTranscript() {
        if (this.isLoading) return;
        
        this.showLoading('Finding group and loading transcript...');
        
        try {
            // Find group by name
            const group = await this.findGroupByName(this.testData.companyName);
            this.groupId = group.id;
            
            this.showMessage(`Found group: ${group.name}. Loading member transcripts...`, 'info');
            
            // Fetch group transcript
            this.groupTranscript = await this.fetchGroupTranscript(group.id);
            
            // Update UI
            this.displayGroupTranscript();
            this.updateGroupStats();
            
            this.showMessage(`Successfully loaded group transcript with ${this.groupTranscript.length} completions!`, 'success');
            
        } catch (error) {
            this.showMessage(`Error loading group transcript: ${error.message}`, 'error');
            console.error('Load group transcript error:', error);
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * Refresh both transcripts
     */
    async refreshTranscripts() {
        if (this.userId) {
            await this.loadUserTranscript();
        }
        if (this.groupId) {
            await this.loadGroupTranscript();
        }
    }
    
    /**
     * Combine enrollments and completions data
     */
    combineEnrollmentsAndCompletions(enrollments, completions) {
        const combined = [];
        const completionMap = new Map();
        
        // Create map of completions by course
        completions.forEach(completion => {
            const courseId = completion.course_id || completion.id;
            completionMap.set(courseId, completion);
        });
        
        // Add enrollments with completion data
        enrollments.forEach(enrollment => {
            const courseId = enrollment.course_id || enrollment.id;
            const completion = completionMap.get(courseId);
            
            combined.push({
                ...enrollment,
                completion: completion,
                status: completion ? 'Completed' : 'Enrolled',
                completed_at: completion?.completed_at || null,
                certificate_url: completion?.certificate_url || null
            });
        });
        
        // Add any completions not in enrollments
        completions.forEach(completion => {
            const courseId = completion.course_id || completion.id;
            if (!enrollments.find(e => (e.course_id || e.id) === courseId)) {
                combined.push({
                    course_id: courseId,
                    course_name: completion.course_name || completion.title,
                    completion: completion,
                    status: 'Completed',
                    completed_at: completion.completed_at,
                    certificate_url: completion.certificate_url
                });
            }
        });
        
        return combined;
    }
    
    /**
     * Categorize course by name
     */
    categorizeCourse(courseName) {
        if (!courseName) return 'Other';
        
        const name = courseName.toLowerCase();
        
        if (name.includes('process') || name.includes('mapping') || name.includes('promapp')) {
            return 'Process Mapping';
        } else if (name.includes('workflow') || name.includes('form') || name.includes('nintex forms')) {
            return 'Workflow and Forms';
        } else if (name.includes('document') || name.includes('generation') || name.includes('docgen')) {
            return 'Document Generation';
        } else if (name.includes('analytics') || name.includes('reporting') || name.includes('dashboard')) {
            return 'Analytics and Reporting';
        } else if (name.includes('admin') || name.includes('configuration') || name.includes('setup')) {
            return 'Platform Administration';
        } else if (name.includes('integration') || name.includes('api') || name.includes('connector')) {
            return 'Integration and API';
        } else if (name.includes('certification') || name.includes('practitioner') || name.includes('expert')) {
            return 'Certification Programs';
        } else if (name.includes('advanced') || name.includes('expert')) {
            return 'Advanced Features';
        }
        
        return 'Other';
    }
    
    /**
     * Display user transcript
     */
    displayUserTranscript() {
        const container = document.getElementById('userCoursesContainer');
        
        if (this.userTranscript.length === 0) {
            container.innerHTML = '<div class="loading">No course data found</div>';
            return;
        }
        
        // Group courses by category
        const categorizedCourses = {};
        Object.keys(this.courseCategories).forEach(category => {
            categorizedCourses[category] = [];
        });
        
        this.userTranscript.forEach(course => {
            const category = this.categorizeCourse(course.course_name || course.title);
            categorizedCourses[category].push(course);
        });
        
        // Generate HTML
        let html = '';
        Object.entries(categorizedCourses).forEach(([category, courses]) => {
            if (courses.length === 0) return;
            
            html += this.createCategorySection(category, courses, 'user');
        });
        
        container.innerHTML = html || '<div class="loading">No courses found</div>';
    }
    
    /**
     * Display group transcript
     */
    displayGroupTranscript() {
        const container = document.getElementById('groupCoursesContainer');
        
        if (this.groupTranscript.length === 0) {
            container.innerHTML = '<div class="loading">No group course data found</div>';
            return;
        }
        
        // Group courses by category
        const categorizedCourses = {};
        Object.keys(this.courseCategories).forEach(category => {
            categorizedCourses[category] = [];
        });
        
        this.groupTranscript.forEach(course => {
            const category = this.categorizeCourse(course.course_name || course.title);
            categorizedCourses[category].push(course);
        });
        
        // Generate HTML
        let html = '';
        Object.entries(categorizedCourses).forEach(([category, courses]) => {
            if (courses.length === 0) return;
            
            html += this.createCategorySection(category, courses, 'group');
        });
        
        container.innerHTML = html || '<div class="loading">No courses found</div>';
    }
    
    /**
     * Create category section HTML
     */
    createCategorySection(category, courses, type) {
        const courseRows = courses.map(course => this.createCourseRow(course, type)).join('');
        
        return `
            <div class="course-category">
                <div class="category-header">
                    <h3 class="category-title">${category}</h3>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="category-count">${courses.length}</span>
                        <span class="expand-icon">▼</span>
                    </div>
                </div>
                <div class="course-list">
                    <table class="course-table">
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Type</th>
                                ${type === 'group' ? '<th>User</th>' : ''}
                                <th>Status</th>
                                <th>Completion Date</th>
                                <th>Certificate</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${courseRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    /**
     * Create course row HTML
     */
    createCourseRow(course, type) {
        const courseName = course.course_name || course.title || 'Unknown Course';
        const courseType = this.getCourseType(courseName);
        const status = course.status || 'Unknown';
        const completedAt = course.completed_at ? new Date(course.completed_at).toLocaleDateString() : 'N/A';
        const certificateUrl = course.certificate_url;
        
        let statusClass = '';
        if (status === 'Completed') statusClass = 'status-completed';
        else if (status === 'Enrolled') statusClass = 'status-enrolled';
        else if (status === 'Expired') statusClass = 'status-expired';
        
        const userCell = type === 'group' ? 
            `<td>${course.user_name || course.user_email || 'Unknown User'}</td>` : '';
        
        const certificateCell = certificateUrl ? 
            `<a href="${certificateUrl}" class="certificate-link" target="_blank">Download</a>` : 
            (status === 'Completed' ? '<span style="color: #666;">Available</span>' : 'N/A');
        
        return `
            <tr>
                <td class="course-title">${this.escapeHtml(courseName)}</td>
                <td><span class="course-type ${courseType.toLowerCase()}">${courseType}</span></td>
                ${userCell}
                <td class="${statusClass}">${status}</td>
                <td class="date-cell">${completedAt}</td>
                <td>${certificateCell}</td>
            </tr>
        `;
    }
    
    /**
     * Get course type based on name
     */
    getCourseType(courseName) {
        if (!courseName) return 'Course';
        
        const name = courseName.toLowerCase();
        if (name.includes('certification') || name.includes('practitioner') || name.includes('expert')) {
            return 'Certification';
        }
        return 'Course';
    }
    
    /**
     * Update user statistics
     */
    updateUserStats() {
        const practitionerCount = this.userTranscript.filter(course => 
            (course.course_name || '').toLowerCase().includes('practitioner') && course.status === 'Completed'
        ).length;
        
        const expertCount = this.userTranscript.filter(course => 
            (course.course_name || '').toLowerCase().includes('expert') && course.status === 'Completed'
        ).length;
        
        document.getElementById('userPractitionerCount').textContent = practitionerCount;
        document.getElementById('userExpertCount').textContent = expertCount;
    }
    
    /**
     * Update group statistics
     */
    updateGroupStats() {
        const practitionerCount = this.groupTranscript.filter(course => 
            (course.course_name || '').toLowerCase().includes('practitioner')
        ).length;
        
        const expertCount = this.groupTranscript.filter(course => 
            (course.course_name || '').toLowerCase().includes('expert')
        ).length;
        
        document.getElementById('groupPractitionerCount').textContent = practitionerCount;
        document.getElementById('groupExpertCount').textContent = expertCount;
    }
    
    /**
     * Toggle category collapse/expand
     */
    toggleCategory(categoryElement) {
        categoryElement.classList.toggle('category-collapsed');
    }
      /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Show configuration panel
     */
    showConfigPanel() {
        const panel = document.getElementById('configPanel');
        panel.style.display = 'block';
        
        // Set current values
        const apiMode = this.API_CONFIG.useProxy ? 'proxy' : 'direct';
        document.querySelector(`input[name="apiMode"][value="${apiMode}"]`).checked = true;
        document.getElementById('proxyUrl').value = this.API_CONFIG.proxyUrl;
    }
    
    /**
     * Hide configuration panel
     */
    hideConfigPanel() {
        document.getElementById('configPanel').style.display = 'none';
    }
    
    /**
     * Save configuration settings
     */
    saveConfiguration() {
        const apiMode = document.querySelector('input[name="apiMode"]:checked').value;
        const proxyUrl = document.getElementById('proxyUrl').value.trim();
        
        if (apiMode === 'proxy' && !proxyUrl) {
            this.showMessage('Please enter a valid proxy URL when using proxy mode.', 'error');
            return;
        }
        
        // Update configuration
        this.API_CONFIG.useProxy = apiMode === 'proxy';
        this.API_CONFIG.proxyUrl = proxyUrl;
        
        this.hideConfigPanel();
        this.showMessage(`Configuration saved. API Mode: ${apiMode.toUpperCase()}${apiMode === 'proxy' ? ', Proxy: ' + proxyUrl : ''}`, 'success');
        
        console.log('Updated API Configuration:', this.API_CONFIG);
    }
}

// Initialize the transcript manager when the page loads
let transcriptManager;

document.addEventListener('DOMContentLoaded', function() {
    transcriptManager = new LearnUponTranscriptManager();
    
    console.log('LearnUpon Transcript Manager initialized');
    console.log('Test data:', transcriptManager.testData);
});

// Export for global access
window.transcriptManager = transcriptManager;
