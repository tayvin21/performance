class AuthManager {
    constructor() {
        this.apiBaseUrl = '/api.php';
        this.isAuthenticated = false;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.sessionTimer = null;
    }

    async login(username, password) {
        try {
            const response = await fetch(this.apiBaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                this.isAuthenticated = true;
                this.startSessionTimer();
                return { success: true };
            } else {
                return { success: false, error: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error occurred' };
        }
    }

    logout() {
        this.isAuthenticated = false;
        this.clearSessionTimer();
        
        // Clear any stored session data
        document.cookie = 'PHPSESSID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Redirect to login
        this.showLogin();
    }

    startSessionTimer() {
        this.clearSessionTimer();
        this.sessionTimer = setTimeout(() => {
            this.logout();
            this.showError('Session expired. Please login again.');
        }, this.sessionTimeout);
    }

    clearSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    showLogin() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
    }

    showError(message) {
        const errorElement = document.getElementById('loginError');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }

    hideError() {
        const errorElement = document.getElementById('loginError');
        errorElement.style.display = 'none';
    }

    async checkAuth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}?action=test`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                this.isAuthenticated = true;
                this.startSessionTimer();
                return true;
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
        
        this.isAuthenticated = false;
        return false;
    }
}

// Export for use in other modules
window.AuthManager = AuthManager;