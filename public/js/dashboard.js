class Dashboard {
    constructor() {
        this.baseUrl = window.location.origin;
        this.logContainer = document.getElementById('activity-log');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.startAutoRefresh();
        this.log('Dashboard initialized successfully', 'info');
    }

    setupEventListeners() {
        // Health refresh
        document.getElementById('refresh-health').addEventListener('click', () => {
            this.checkHealth();
        });

        // Version refresh
        document.getElementById('refresh-version').addEventListener('click', () => {
            this.loadVersionInfo();
        });

        // Test all APIs
        document.getElementById('test-all').addEventListener('click', () => {
            this.testAllAPIs();
        });

        // Clear results
        document.getElementById('clear-results').addEventListener('click', () => {
            this.clearAPIResults();
        });

        // Clear logs
        document.getElementById('clear-logs').addEventListener('click', () => {
            this.clearLogs();
        });

        // Individual API test buttons
        document.querySelectorAll('.test-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const method = e.target.dataset.method || e.target.closest('.test-btn').dataset.method;
                const endpoint = e.target.dataset.endpoint || e.target.closest('.test-btn').dataset.endpoint;
                const needsId = e.target.dataset.needsId || e.target.closest('.test-btn').dataset.needsId;
                
                this.testAPI(method, endpoint, needsId === 'true');
            });
        });
    }

    async loadInitialData() {
        await Promise.all([
            this.checkHealth(),
            this.loadVersionInfo()
        ]);
    }

    startAutoRefresh() {
        // Auto-refresh health every 30 seconds
        setInterval(() => {
            this.checkHealth();
        }, 30000);

        // Auto-refresh version info every 5 minutes
        setInterval(() => {
            this.loadVersionInfo();
        }, 300000);
    }

    async checkHealth() {
        this.log('Checking server health...', 'info');
        
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            const data = await response.json();

            if (response.ok) {
                document.getElementById('server-status').textContent = data.status || 'Running';
                document.getElementById('server-status').className = 'status online';
                
                document.getElementById('db-status').textContent = data.database || 'Unknown';
                document.getElementById('db-status').className = `status ${data.database === 'Connected' ? 'connected' : 'disconnected'}`;
                
                document.getElementById('last-check').textContent = new Date().toLocaleTimeString();
                
                this.log(`Health check completed - Server: ${data.status}, DB: ${data.database}`, 'success');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            document.getElementById('server-status').textContent = 'Offline';
            document.getElementById('server-status').className = 'status offline';
            document.getElementById('db-status').textContent = 'Unknown';
            document.getElementById('db-status').className = 'status offline';
            document.getElementById('last-check').textContent = new Date().toLocaleTimeString();
            
            this.log(`Health check failed: ${error.message}`, 'error');
        }
    }

    async loadVersionInfo() {
        this.log('Loading version information...', 'info');
        
        try {
            const response = await fetch(`${this.baseUrl}/api/version`);
            const data = await response.json();

            if (response.ok) {
                document.getElementById('app-version').textContent = `${data.name} v${data.version}`;
                document.getElementById('app-version').className = 'status online';
                
                document.getElementById('node-version').textContent = data.nodeVersion || 'Unknown';
                document.getElementById('node-version').className = 'status online';
                
                document.getElementById('environment').textContent = data.environment || 'Unknown';
                document.getElementById('environment').className = 'status online';
                
                const uptimeHours = Math.floor(data.uptime / 3600);
                const uptimeMinutes = Math.floor((data.uptime % 3600) / 60);
                document.getElementById('uptime').textContent = `${uptimeHours}h ${uptimeMinutes}m`;
                document.getElementById('uptime').className = 'status online';
                
                this.log(`Version info loaded - ${data.name} v${data.version}`, 'success');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            ['app-version', 'node-version', 'environment', 'uptime'].forEach(id => {
                document.getElementById(id).textContent = 'Error';
                document.getElementById(id).className = 'status offline';
            });
            
            this.log(`Failed to load version info: ${error.message}`, 'error');
        }
    }

    async testAllAPIs() {
        this.log('Starting comprehensive API testing...', 'info');
        this.clearAPIResults();

        const tests = [
            { method: 'GET', endpoint: '/api/projects', needsId: false },
            { method: 'POST', endpoint: '/api/projects', needsId: false }
        ];

        for (const test of tests) {
            await this.testAPI(test.method, test.endpoint, test.needsId);
            await this.delay(500); // Small delay between tests
        }

        this.log('API testing completed', 'success');
    }

    async testAPI(method, endpoint, needsId = false) {
        let url = `${this.baseUrl}${endpoint}`;
        let resultElementId = `result-${method.toLowerCase()}-${endpoint.split('/').pop()}`;
        
        // Handle endpoints that need IDs
        if (needsId) {
            let projectId = '';
            if (method === 'GET' && endpoint.includes('/api/projects/')) {
                projectId = document.getElementById('project-id').value;
                resultElementId = 'result-get-project';
            } else if (method === 'PUT' && endpoint.includes('/api/projects/')) {
                projectId = document.getElementById('update-project-id').value;
                resultElementId = 'result-put-project';
            } else if (method === 'DELETE' && endpoint.includes('/api/projects/')) {
                projectId = document.getElementById('delete-project-id').value;
                resultElementId = 'result-delete-project';
            }

            if (!projectId) {
                this.showAPIResult(resultElementId, 'error', 'Error: Project ID is required');
                this.log(`${method} ${endpoint} failed: Project ID required`, 'error');
                return;
            }
            
            url += projectId;
        }

        const resultElement = document.getElementById(resultElementId);
        if (!resultElement) {
            console.error(`Result element not found: ${resultElementId}`);
            return;
        }

        this.showAPIResult(resultElementId, 'loading', 'Testing...');
        this.log(`Testing ${method} ${url}`, 'info');

        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            // Add payload data for POST and PUT requests
            if (method === 'POST') {
                const payloadText = document.getElementById('post-projects-payload').value.trim();
                if (payloadText) {
                    try {
                        const payload = JSON.parse(payloadText);
                        options.body = JSON.stringify(payload);
                    } catch (parseError) {
                        this.showAPIResult(resultElementId, 'error', `Invalid JSON payload: ${parseError.message}`);
                        this.log(`${method} ${url} failed: Invalid JSON payload`, 'error');
                        return;
                    }
                } else {
                    // Default payload if none provided
                    options.body = JSON.stringify({
                        name: `Test Project ${Date.now()}`,
                        description: 'This is a test project created by the dashboard',
                        technologies: ['Node.js', 'Express', 'MongoDB'],
                        status: 'planning'
                    });
                }
            } else if (method === 'PUT') {
                const payloadText = document.getElementById('put-projects-payload').value.trim();
                if (payloadText) {
                    try {
                        const payload = JSON.parse(payloadText);
                        options.body = JSON.stringify(payload);
                    } catch (parseError) {
                        this.showAPIResult(resultElementId, 'error', `Invalid JSON payload: ${parseError.message}`);
                        this.log(`${method} ${url} failed: Invalid JSON payload`, 'error');
                        return;
                    }
                } else {
                    // Default payload if none provided
                    options.body = JSON.stringify({
                        name: `Updated Test Project ${Date.now()}`,
                        description: 'This project was updated by the dashboard',
                        technologies: ['Node.js', 'Express', 'MongoDB', 'React'],
                        status: 'in-progress'
                    });
                }
            }

            const response = await fetch(url, options);
            const data = await response.json();

            if (response.ok) {
                const formattedResponse = `Status: ${response.status}\nResponse:\n${JSON.stringify(data, null, 2)}`;
                this.showAPIResult(resultElementId, 'success', formattedResponse);
                this.log(`${method} ${url} succeeded (${response.status})`, 'success');

                // Auto-populate project ID for future requests if this was a POST request
                if (method === 'POST' && data.data && data.data._id) {
                    this.autoPopulateProjectIds(data.data._id);
                    this.log(`Auto-populated project ID: ${data.data._id}`, 'info');
                }
            } else {
                const errorResponse = `Status: ${response.status}\nError:\n${JSON.stringify(data, null, 2)}`;
                this.showAPIResult(resultElementId, 'error', errorResponse);
                this.log(`${method} ${url} failed (${response.status})`, 'error');
            }
        } catch (error) {
            this.showAPIResult(resultElementId, 'error', `Network Error: ${error.message}`);
            this.log(`${method} ${url} failed: ${error.message}`, 'error');
        }
    }

    showAPIResult(elementId, type, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.className = `api-result ${type}`;
        }
    }

    clearAPIResults() {
        document.querySelectorAll('.api-result').forEach(element => {
            element.textContent = '';
            element.className = 'api-result';
        });
        this.log('API test results cleared', 'info');
    }

    clearLogs() {
        this.logContainer.innerHTML = '<div class="log-entry info"><span class="timestamp">[System]</span><span class="message">Logs cleared</span></div>';
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="timestamp">[${timestamp}]</span>
            <span class="message">${message}</span>
        `;
        
        this.logContainer.appendChild(logEntry);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;

        // Keep only last 100 log entries
        const entries = this.logContainer.querySelectorAll('.log-entry');
        if (entries.length > 100) {
            entries[0].remove();
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Utility method to format uptime
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    // Method to check if server is responsive
    async isServerResponsive() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, { 
                method: 'GET',
                timeout: 5000 
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    togglePayload(payloadId) {
        const payloadSection = document.getElementById(payloadId);
        if (payloadSection) {
            const isVisible = payloadSection.style.display !== 'none';
            payloadSection.style.display = isVisible ? 'none' : 'block';
            
            // Focus on textarea when showing
            if (!isVisible) {
                const textarea = payloadSection.querySelector('textarea');
                if (textarea) {
                    setTimeout(() => textarea.focus(), 100);
                }
            }
        }
    }

    autoPopulateProjectIds(projectId) {
        // Auto-populate all project ID fields
        const idFields = ['project-id', 'update-project-id', 'delete-project-id'];
        idFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = projectId;
                field.style.backgroundColor = '#e8f5e8'; // Light green to show it was auto-filled
                setTimeout(() => {
                    field.style.backgroundColor = '';
                }, 2000);
            }
        });
    }

    async populateProjectIds() {
        this.log('Fetching available project IDs...', 'info');
        
        try {
            const response = await fetch(`${this.baseUrl}/api/projects`);
            const data = await response.json();

            if (response.ok && data.data && data.data.length > 0) {
                const firstProjectId = data.data[0]._id;
                this.autoPopulateProjectIds(firstProjectId);
                this.log(`Auto-populated with first available project ID: ${firstProjectId}`, 'success');
            } else {
                this.log('No projects found. Create a project first.', 'warning');
            }
        } catch (error) {
            this.log(`Failed to fetch project IDs: ${error.message}`, 'error');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
    
    // Global error handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        if (window.dashboard) {
            window.dashboard.log(`Unhandled error: ${event.reason}`, 'error');
        }
    });
    
    // Add some keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'r':
                    event.preventDefault();
                    window.dashboard.checkHealth();
                    window.dashboard.loadVersionInfo();
                    break;
                case 't':
                    event.preventDefault();
                    window.dashboard.testAllAPIs();
                    break;
                case 'l':
                    event.preventDefault();
                    window.dashboard.clearLogs();
                    break;
            }
        }
    });
});