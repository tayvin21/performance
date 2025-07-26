class App {
    constructor() {
        this.authManager = new AuthManager();
        this.dashboardManager = null;
        this.chartManager = null;
    }

    async init() {
        this.setupLoginForm();
        
        // Check if user is already authenticated
        const isAuthenticated = await this.authManager.checkAuth();
        
        if (isAuthenticated) {
            this.showDashboard();
        } else {
            this.authManager.showLogin();
        }
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        const loginBtn = loginForm.querySelector('.login-btn');
        const btnText = loginBtn.querySelector('.btn-text');
        const loadingSpinner = loginBtn.querySelector('.loading-spinner');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                this.authManager.showError('Please enter both username and password');
                return;
            }

            // Show loading state
            btnText.style.display = 'none';
            loadingSpinner.style.display = 'block';
            loginBtn.disabled = true;
            this.authManager.hideError();

            try {
                const result = await this.authManager.login(username, password);
                
                if (result.success) {
                    this.showDashboard();
                } else {
                    this.authManager.showError(result.error);
                }
            } catch (error) {
                this.authManager.showError('An unexpected error occurred');
                console.error('Login error:', error);
            } finally {
                // Reset loading state
                btnText.style.display = 'inline';
                loadingSpinner.style.display = 'none';
                loginBtn.disabled = false;
            }
        });

        // Clear error when user starts typing
        const inputs = loginForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.authManager.hideError();
            });
        });
    }

    async showDashboard() {
        this.authManager.showDashboard();
        
        // Initialize dashboard components
        if (!this.dashboardManager) {
            this.dashboardManager = new DashboardManager(this.authManager);
        }
        
        if (!this.chartManager) {
            this.chartManager = new ChartManager();
            window.chartManager = this.chartManager; // Make available globally
        }

        // Initialize components
        this.chartManager.init();
        await this.dashboardManager.init();

        // Update performance chart periodically
        setInterval(() => {
            if (this.dashboardManager && this.chartManager) {
                this.chartManager.updatePerformanceChart(this.dashboardManager.metrics);
            }
        }, 5000);
    }

    destroy() {
        if (this.dashboardManager) {
            this.dashboardManager.destroy();
        }
        
        if (this.chartManager) {
            this.chartManager.destroy();
        }
        
        this.authManager.clearSessionTimer();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.destroy();
    }
});

// Handle visibility change (pause/resume refresh when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (window.app && window.app.dashboardManager) {
        if (document.hidden) {
            window.app.dashboardManager.stopAutoRefresh();
        } else {
            window.app.dashboardManager.startAutoRefresh();
            window.app.dashboardManager.loadData(); // Refresh immediately when tab becomes active
        }
    }
});