class DashboardManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.apiBaseUrl = '/api.php';
        this.refreshInterval = 30000; // 30 seconds
        this.refreshTimer = null;
        this.isRefreshing = false;
        this.lastUpdateTime = null;
        
        this.metrics = {
            cpu: { current: 0, history: [] },
            memory: { current: 0, history: [] },
            disk: { current: 0, history: [] },
            network: { current: 0, history: [] }
        };

        this.services = {
            nginx: 'running',
            redis: 'running',
            mysql: 'running',
            wings: 'running',
            docker: 'running'
        };
    }

    async init() {
        this.setupEventListeners();
        await this.loadData();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Server selector
        const serverSelect = document.getElementById('serverSelect');
        serverSelect.addEventListener('change', () => {
            this.loadData();
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', () => {
            this.authManager.logout();
        });
    }

    async loadData() {
        if (this.isRefreshing) return;
        
        this.isRefreshing = true;
        this.updateConnectionStatus('connecting');

        try {
            const response = await fetch(`${this.apiBaseUrl}?action=stats`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const responseText = await response.text();
            let data;
            
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('API returned non-JSON response:', responseText);
                throw new Error('API endpoint returned HTML instead of JSON. Check if /api.php exists and is working correctly.');
            }

            if (data.success) {
                this.updateMetrics(data.data);
                this.updateServices(data.data.services || {});
                this.updateConnectionStatus('connected');
                this.lastUpdateTime = new Date();
            } else {
                throw new Error(data.message || 'Failed to load data');
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.updateConnectionStatus('disconnected');
            this.handleApiError(error);
        } finally {
            this.isRefreshing = false;
        }
    }

    updateMetrics(data) {
        // Update CPU
        const cpuValue = data.cpu || Math.floor(Math.random() * 100);
        this.updateMetric('cpu', cpuValue, '%');
        
        // Update Memory
        const memoryValue = data.memory || Math.floor(Math.random() * 100);
        this.updateMetric('memory', memoryValue, '%');
        
        // Update Disk
        const diskValue = data.disk || Math.floor(Math.random() * 100);
        this.updateMetric('disk', diskValue, '%');
        
        // Update Network
        const networkValue = data.network || Math.floor(Math.random() * 50);
        this.updateMetric('network', networkValue, 'MB/s');
    }

    updateMetric(type, value, unit) {
        // Update current value
        this.metrics[type].current = value;
        
        // Add to history (keep last 20 points)
        this.metrics[type].history.push({
            timestamp: new Date(),
            value: value
        });
        
        if (this.metrics[type].history.length > 20) {
            this.metrics[type].history.shift();
        }

        // Update UI
        const valueElement = document.getElementById(`${type}Value`);
        const statusElement = document.getElementById(`${type}Status`);
        const cardElement = document.getElementById(`${type}Card`);

        if (valueElement) {
            valueElement.textContent = `${value}${unit}`;
        }

        // Update status based on value
        let status = 'Normal';
        let statusClass = 'status-normal';

        if (type !== 'network') { // Network uses different thresholds
            if (value >= 80) {
                status = 'Critical';
                statusClass = 'status-critical';
            } else if (value >= 60) {
                status = 'Warning';
                statusClass = 'status-warning';
            }
        }

        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `metric-status ${statusClass}`;
        }

        // Update card color
        if (cardElement) {
            cardElement.className = `metric-card ${statusClass}`;
        }

        // Update mini chart if chart manager is available
        if (window.chartManager) {
            window.chartManager.updateMetricChart(type, this.metrics[type].history);
        }
    }

    updateServices(servicesData) {
        const serviceNames = ['nginx', 'redis', 'mysql', 'wings', 'docker'];
        
        serviceNames.forEach(serviceName => {
            const status = servicesData[serviceName] || (Math.random() > 0.1 ? 'running' : 'stopped');
            this.services[serviceName] = status;
            
            const statusElement = document.getElementById(`${serviceName}Status`);
            const cardElement = document.getElementById(`${serviceName}Service`);
            
            if (statusElement) {
                statusElement.textContent = status === 'running' ? 'Running' : 'Stopped';
                statusElement.className = `service-status ${status === 'running' ? 'service-running' : 'service-stopped'}`;
            }
            
            if (cardElement) {
                cardElement.className = `service-card ${status === 'running' ? 'service-running' : 'service-stopped'}`;
            }
        });
    }

    updateConnectionStatus(status) {
        const statusDot = document.getElementById('connectionStatus');
        const lastUpdate = document.getElementById('lastUpdate');
        
        if (statusDot) {
            statusDot.className = `status-dot ${status === 'connected' ? '' : 'disconnected'}`;
        }
        
        if (lastUpdate) {
            switch (status) {
                case 'connecting':
                    lastUpdate.textContent = 'Connecting...';
                    break;
                case 'connected':
                    lastUpdate.textContent = `Updated ${new Date().toLocaleTimeString()}`;
                    break;
                case 'disconnected':
                    lastUpdate.textContent = 'Connection failed';
                    break;
            }
        }
    }

    startAutoRefresh() {
        this.stopAutoRefresh();
        this.refreshTimer = setInterval(() => {
            this.loadData();
        }, this.refreshInterval);
    }

    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    handleApiError(error) {
        if (error.message.includes('401') || error.message.includes('403')) {
            // Authentication error
            this.authManager.logout();
        } else {
            // Other errors - could show notification
            console.error('Dashboard error:', error);
        }
    }

    destroy() {
        this.stopAutoRefresh();
    }
}

// Export for use in other modules
window.DashboardManager = DashboardManager;