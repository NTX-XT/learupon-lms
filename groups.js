/**
 * LearnUpon Groups Manager
 * Handles API interactions with LearnUpon to fetch and display group information
 */

class LearnUponGroupsManager {
    constructor() {
        // API Configuration
        this.API_CONFIG = {
            username: '7e3cabb33785685b95eb',
            password: '0f990388e4a4ad06cd2f63814e7dd7',
            domain: 'learn.nintex.com',
            baseUrl: 'https://learn.nintex.com/api/v1'
        };
        
        // State management
        this.groups = [];
        this.filteredGroups = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.isLoading = false;
        
        // Initialize
        this.initializeEventListeners();
    }
    
    /**
     * Initialize event listeners for UI interactions
     */
    initializeEventListeners() {
        document.getElementById('loadGroupsBtn').addEventListener('click', () => this.loadGroups());
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshGroups());
        document.getElementById('searchBox').addEventListener('input', (e) => this.filterGroups(e.target.value));
        document.getElementById('prevPageBtn').addEventListener('click', () => this.previousPage());
        document.getElementById('nextPageBtn').addEventListener('click', () => this.nextPage());
    }
    
    /**
     * Create authorization header for API requests
     */
    getAuthHeader() {
        const credentials = btoa(`${this.API_CONFIG.username}:${this.API_CONFIG.password}`);
        return `Basic ${credentials}`;
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
    showLoading(message = 'Loading groups...') {
        document.getElementById('groupsContainer').innerHTML = `
            <div class="loading">
                <p>${message}</p>
                <div>Please wait...</div>
            </div>
        `;
        
        document.getElementById('loadGroupsBtn').disabled = true;
        this.isLoading = true;
    }
    
    /**
     * Hide loading state
     */
    hideLoading() {
        document.getElementById('loadGroupsBtn').disabled = false;
        document.getElementById('refreshBtn').disabled = false;
        document.getElementById('searchBox').disabled = false;
        this.isLoading = false;
    }
    
    /**
     * Fetch groups from LearnUpon API
     */
    async fetchGroups() {
        try {
            const response = await fetch(`${this.API_CONFIG.baseUrl}/groups`, {
                method: 'GET',
                headers: {
                    'Authorization': this.getAuthHeader(),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error fetching groups:', error);
            throw error;
        }
    }
    
    /**
     * Load groups and display them
     */
    async loadGroups() {
        if (this.isLoading) return;
        
        this.showLoading();
        this.showMessage('Fetching groups from LearnUpon API...', 'info');
        
        try {
            const data = await this.fetchGroups();
            
            // Handle different response formats
            this.groups = data.groups || data.data || data || [];
            
            if (!Array.isArray(this.groups)) {
                throw new Error('Invalid response format: expected array of groups');
            }
            
            this.filteredGroups = [...this.groups];
            this.currentPage = 1;
            
            this.displayGroups();
            this.updateStats();
            this.updatePagination();
            
            this.showMessage(`Successfully loaded ${this.groups.length} groups!`, 'success');
            
        } catch (error) {
            this.showMessage(`Error loading groups: ${error.message}`, 'error');
            console.error('Load groups error:', error);
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * Refresh groups data
     */
    async refreshGroups() {
        if (this.groups.length === 0) {
            this.loadGroups();
            return;
        }
        
        await this.loadGroups();
    }
    
    /**
     * Filter groups based on search term
     */
    filterGroups(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredGroups = [...this.groups];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredGroups = this.groups.filter(group => 
                (group.name && group.name.toLowerCase().includes(term)) ||
                (group.description && group.description.toLowerCase().includes(term)) ||
                (group.id && group.id.toString().includes(term))
            );
        }
        
        this.currentPage = 1;
        this.displayGroups();
        this.updatePagination();
    }
    
    /**
     * Display groups in the UI
     */
    displayGroups() {
        const container = document.getElementById('groupsContainer');
        
        if (this.filteredGroups.length === 0) {
            container.innerHTML = `
                <div class="loading">
                    <p>No groups found</p>
                    <div>Try adjusting your search criteria or load groups first.</div>
                </div>
            `;
            return;
        }
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageGroups = this.filteredGroups.slice(startIndex, endIndex);
        
        const groupsHtml = pageGroups.map(group => this.createGroupCard(group)).join('');
        container.innerHTML = groupsHtml;
    }
    
    /**
     * Create HTML card for a group
     */
    createGroupCard(group) {
        const groupId = group.id || 'N/A';
        const groupName = group.name || 'Unnamed Group';
        const description = group.description || 'No description available';
        const memberCount = group.member_count || group.members_count || group.users_count || 0;
        const createdAt = group.created_at ? new Date(group.created_at).toLocaleDateString() : 'Unknown';
        const status = group.status || group.active !== false ? 'Active' : 'Inactive';
        
        return `
            <div class="group-card">
                <div class="group-header">
                    <div class="group-name">${this.escapeHtml(groupName)}</div>
                    <div class="group-id">ID: ${groupId}</div>
                </div>
                
                <div class="group-details">
                    <div class="detail-item">
                        <span class="detail-label">Description:</span><br>
                        ${this.escapeHtml(description)}
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Members:</span><br>
                        ${memberCount}
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Status:</span><br>
                        <span style="color: ${status === 'Active' ? '#2e7d32' : '#c62828'}">${status}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Created:</span><br>
                        ${createdAt}
                    </div>
                </div>
                
                ${this.createGroupActions(group)}
            </div>
        `;
    }
    
    /**
     * Create action buttons for a group
     */
    createGroupActions(group) {
        return `
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button onclick="groupsManager.viewGroupDetails(${group.id})" style="font-size: 12px; padding: 5px 10px;">
                    View Details
                </button>
                <button onclick="groupsManager.viewGroupMembers(${group.id})" style="font-size: 12px; padding: 5px 10px;">
                    View Members
                </button>
            </div>
        `;
    }
    
    /**
     * Update statistics display
     */
    updateStats() {
        const statsArea = document.getElementById('statsArea');
        const totalGroups = this.groups.length;
        const activeGroups = this.groups.filter(g => g.status !== 'Inactive' && g.active !== false).length;
        const totalMembers = this.groups.reduce((sum, g) => sum + (g.member_count || g.members_count || g.users_count || 0), 0);
        
        document.getElementById('totalGroups').textContent = totalGroups;
        document.getElementById('activeGroups').textContent = activeGroups;
        document.getElementById('totalMembers').textContent = totalMembers;
        
        statsArea.style.display = totalGroups > 0 ? 'flex' : 'none';
    }
    
    /**
     * Update pagination controls
     */
    updatePagination() {
        const paginationArea = document.getElementById('paginationArea');
        const totalPages = Math.ceil(this.filteredGroups.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            paginationArea.style.display = 'none';
            return;
        }
        
        paginationArea.style.display = 'flex';
        
        document.getElementById('prevPageBtn').disabled = this.currentPage <= 1;
        document.getElementById('nextPageBtn').disabled = this.currentPage >= totalPages;
        
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.filteredGroups.length);
        
        document.getElementById('currentPageInfo').textContent = 
            `Page ${this.currentPage} of ${totalPages} (${startItem}-${endItem} of ${this.filteredGroups.length})`;
    }
    
    /**
     * Navigate to previous page
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayGroups();
            this.updatePagination();
        }
    }
    
    /**
     * Navigate to next page
     */
    nextPage() {
        const totalPages = Math.ceil(this.filteredGroups.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.displayGroups();
            this.updatePagination();
        }
    }
    
    /**
     * View detailed information about a group
     */
    async viewGroupDetails(groupId) {
        try {
            this.showMessage('Loading group details...', 'info');
            
            const response = await fetch(`${this.API_CONFIG.baseUrl}/groups/${groupId}`, {
                method: 'GET',
                headers: {
                    'Authorization': this.getAuthHeader(),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const groupDetails = await response.json();
            this.displayGroupDetailsModal(groupDetails);
            
        } catch (error) {
            this.showMessage(`Error loading group details: ${error.message}`, 'error');
            console.error('Group details error:', error);
        }
    }
    
    /**
     * View members of a group
     */
    async viewGroupMembers(groupId) {
        try {
            this.showMessage('Loading group members...', 'info');
            
            const response = await fetch(`${this.API_CONFIG.baseUrl}/groups/${groupId}/users`, {
                method: 'GET',
                headers: {
                    'Authorization': this.getAuthHeader(),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const members = await response.json();
            this.displayGroupMembersModal(groupId, members);
            
        } catch (error) {
            this.showMessage(`Error loading group members: ${error.message}`, 'error');
            console.error('Group members error:', error);
        }
    }
    
    /**
     * Display group details in a modal (simplified version)
     */
    displayGroupDetailsModal(groupDetails) {
        const details = JSON.stringify(groupDetails, null, 2);
        alert(`Group Details:\n\n${details}`);
    }
    
    /**
     * Display group members in a modal (simplified version)
     */
    displayGroupMembersModal(groupId, members) {
        const membersList = Array.isArray(members) ? members : (members.users || members.data || []);
        const memberNames = membersList.map(m => m.name || m.email || m.id).join('\n');
        alert(`Group ${groupId} Members (${membersList.length}):\n\n${memberNames}`);
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the groups manager when the page loads
let groupsManager;

document.addEventListener('DOMContentLoaded', function() {
    groupsManager = new LearnUponGroupsManager();
    
    // Show initial instructions
    document.getElementById('messageArea').innerHTML = `
        <div class="info" style="background-color: #e3f2fd; color: #1565c0; padding: 15px; border-radius: 5px; border-left: 4px solid #1565c0;">
            <strong>Welcome to LearnUpon Groups Manager!</strong><br>
            Click "Load Groups" to fetch all groups from your LearnUpon instance.<br>
            <small>API Domain: ${groupsManager.API_CONFIG.domain}</small>
        </div>
    `;
});

// Export for global access
window.groupsManager = groupsManager;
