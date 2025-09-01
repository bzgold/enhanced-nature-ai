// Nature AI - Clean Modern Chatbot

class NatureAI {
    constructor() {
        this.apiUrl = '/api/chat';
        this.messages = [];
        this.isLoading = false;
        this.settings = this.loadSettings();
        this.isOnline = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.checkFirstTimeUser();
        this.updateStatus();
    }

    initializeElements() {
        // Core elements
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // Modal elements
        this.settingsModal = document.getElementById('settingsModal');
        this.apiKeyBtn = document.getElementById('apiKeyBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.closeModal = document.getElementById('closeModal');
        this.saveSettings = document.getElementById('saveSettings');
        
        // Settings form elements
        this.apiKeyInput = document.getElementById('apiKey');
        this.modelSelect = document.getElementById('modelSelect');
        this.developerMessageInput = document.getElementById('developerMessage');
        
        // Header elements
        this.darkModeBtn = document.getElementById('darkModeBtn');
        this.statusIndicator = document.querySelector('.status-indicator');
    }

    bindEvents() {
        // Chat events
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Modal events
        this.apiKeyBtn.addEventListener('click', () => this.openSettings());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeModal.addEventListener('click', () => this.closeSettings());
        this.saveSettings.addEventListener('click', () => this.saveSettingsToStorage());

        // Close modal when clicking outside
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        // Dark mode toggle
        this.darkModeBtn.addEventListener('click', () => this.toggleDarkMode());

        // Load settings when page loads
        window.addEventListener('load', () => this.populateSettingsForm());
    }

    checkFirstTimeUser() {
        if (!this.settings.apiKey) {
            setTimeout(() => {
                this.openSettings();
                this.showNotification('Welcome to Nature AI! Please enter your OpenAI API key to get started.', 'info');
            }, 1000);
        }
    }

    loadSettings() {
        const defaultSettings = {
            apiKey: '',
            model: 'gpt-4.1-mini',
            developerMessage: 'You are Nature AI, a friendly and knowledgeable AI assistant with a deep appreciation for nature, science, and human creativity. You help users explore ideas, solve problems, and engage in meaningful conversations. Always respond in a warm, helpful manner that reflects your connection to nature.',
            darkMode: false
        };

        try {
            const saved = localStorage.getItem('natureAI-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return defaultSettings;
        }
    }

    populateSettingsForm() {
        this.apiKeyInput.value = this.settings.apiKey;
        this.modelSelect.value = this.settings.model;
        this.developerMessageInput.value = this.settings.developerMessage;
        
        // Apply dark mode if enabled
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    saveSettingsToStorage() {
        this.settings.apiKey = this.apiKeyInput.value.trim();
        this.settings.model = this.modelSelect.value;
        this.settings.developerMessage = this.developerMessageInput.value.trim();

        try {
            localStorage.setItem('natureAI-settings', JSON.stringify(this.settings));
            this.showNotification('Settings saved successfully! 🌿', 'success');
            this.closeSettings();
            this.updateStatus();
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Error saving settings. Please try again.', 'error');
        }
    }

    openSettings() {
        this.settingsModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeSettings() {
        this.settingsModal.classList.remove('show');
        document.body.style.overflow = '';
    }

    toggleDarkMode() {
        this.settings.darkMode = !this.settings.darkMode;
        document.body.classList.toggle('dark-mode', this.settings.darkMode);
        
        // Update button icon
        this.darkModeBtn.innerHTML = this.settings.darkMode ? 
            '<i class="fas fa-sun"></i>' : 
            '<i class="fas fa-moon"></i>';
        
        // Save to storage
        try {
            localStorage.setItem('natureAI-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving dark mode setting:', error);
        }
    }

    updateStatus() {
        if (this.settings.apiKey) {
            this.isOnline = true;
            this.statusIndicator.classList.remove('offline');
            this.statusIndicator.classList.add('online');
            this.statusIndicator.querySelector('.status-text').textContent = 'Online';
        } else {
            this.isOnline = false;
            this.statusIndicator.classList.remove('online');
            this.statusIndicator.classList.add('offline');
            this.statusIndicator.querySelector('.status-text').textContent = 'Offline';
        }
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message || this.isLoading) return;

        // Check if API key is configured
        if (!this.settings.apiKey) {
            this.showNotification('Please configure your OpenAI API key first.', 'warning');
            this.openSettings();
            return;
        }

        // Add user message to chat
        this.addMessage(message, 'user');
        this.userInput.value = '';

        // Show loading state
        this.setLoading(true);

        try {
            // Prepare request payload
            const payload = {
                developer_message: this.settings.developerMessage,
                user_message: message,
                model: this.settings.model,
                api_key: this.settings.apiKey
            };

            // Make API request
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botMessage = '';

            // Add bot message container
            const botMessageElement = this.addMessage('', 'bot', true);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                botMessage += chunk;

                // Update bot message content
                botMessageElement.querySelector('.message-content p').textContent = botMessage;
                this.scrollToBottom();
            }

        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('Error connecting to Nature AI. Please check your API key and try again.', 'error');
            
            // Add error message to chat
            this.addMessage('Sorry, I encountered an error. Please check your API key and try again.', 'bot');
        } finally {
            this.setLoading(false);
        }
    }

    addMessage(content, sender, isStreaming = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (sender === 'bot') {
            avatar.innerHTML = '<i class="fas fa-leaf"></i>';
        } else {
            avatar.innerHTML = '<i class="fas fa-user"></i>';
        }

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageText = document.createElement('p');
        messageText.textContent = content;
        
        const messageTime = document.createElement('span');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();
        
        messageContent.appendChild(messageText);
        messageContent.appendChild(messageTime);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.sendButton.disabled = loading;
        this.userInput.disabled = loading;
        
        if (loading) {
            this.loadingIndicator.classList.add('show');
            this.sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else {
            this.loadingIndicator.classList.remove('show');
            this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
            font-size: 14px;
            font-weight: 500;
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);

        document.body.appendChild(notification);
    }

    // Method to update API URL for different environments
    updateApiUrl(url) {
        this.apiUrl = url;
    }
}

// Initialize Nature AI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const natureAI = new NatureAI();
    
    // Update API URL based on environment
    // For local development, use the FastAPI backend
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        natureAI.updateApiUrl('http://localhost:8000/api/chat');
    }
    // For Vercel deployment, use the production API URL
    else {
        natureAI.updateApiUrl('https://api-m3skopw3v-bhzbgold-2840s-projects.vercel.app/api/chat');
    }
    
    // Make it globally accessible for debugging
    window.natureAI = natureAI;
});
