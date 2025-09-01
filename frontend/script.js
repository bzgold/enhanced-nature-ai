// Nature AI - Chatbot JavaScript Functionality

class NatureAI {
    constructor() {
        this.apiUrl = '/api/chat'; // Will be updated based on deployment
        this.messages = [];
        this.isLoading = false;
        this.settings = this.loadSettings();
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.checkFirstTimeUser();
    }

    initializeElements() {
        // Core elements
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // Settings elements
        this.settingsPanel = document.getElementById('settingsPanel');
        this.settingsToggle = document.getElementById('settingsToggle');
        this.closeSettings = document.getElementById('closeSettings');
        this.saveSettings = document.getElementById('saveSettings');
        
        // Settings form elements
        this.apiKeyInput = document.getElementById('apiKey');
        this.modelSelect = document.getElementById('modelSelect');
        this.developerMessageInput = document.getElementById('developerMessage');
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

        // Auto-resize textarea
        this.userInput.addEventListener('input', () => this.autoResizeTextarea());

        // Settings events
        this.settingsToggle.addEventListener('click', () => this.toggleSettings());
        this.closeSettings.addEventListener('click', () => this.toggleSettings());
        this.saveSettings.addEventListener('click', () => this.saveSettingsToStorage());

        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.settingsPanel.contains(e.target) && 
                !this.settingsToggle.contains(e.target)) {
                this.settingsPanel.classList.remove('open');
            }
        });

        // Load settings when page loads
        window.addEventListener('load', () => this.populateSettingsForm());
    }

    checkFirstTimeUser() {
        if (!this.settings.apiKey) {
            // Show settings panel for first-time users
            setTimeout(() => {
                this.toggleSettings();
                this.showNotification('Welcome to Nature AI! Please enter your OpenAI API key to get started.', 'info');
            }, 1000);
        }
    }

    loadSettings() {
        const defaultSettings = {
            apiKey: '',
            model: 'gpt-4.1-mini',
            developerMessage: 'You are Nature AI, a friendly and knowledgeable AI assistant with a deep appreciation for nature, science, and human creativity. You help users explore ideas, solve problems, and engage in meaningful conversations. Always respond in a warm, helpful manner that reflects your connection to nature.'
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
    }

    saveSettingsToStorage() {
        this.settings.apiKey = this.apiKeyInput.value.trim();
        this.settings.model = this.modelSelect.value;
        this.settings.developerMessage = this.developerMessageInput.value.trim();

        try {
            localStorage.setItem('natureAI-settings', JSON.stringify(this.settings));
            this.showNotification('Settings saved successfully! 🌿', 'success');
            this.toggleSettings();
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Error saving settings. Please try again.', 'error');
        }
    }

    toggleSettings() {
        this.settingsPanel.classList.toggle('open');
    }

    autoResizeTextarea() {
        this.userInput.style.height = 'auto';
        this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message || this.isLoading) return;

        // Check if API key is configured
        if (!this.settings.apiKey) {
            this.showNotification('Please configure your OpenAI API key in settings first.', 'warning');
            this.toggleSettings();
            return;
        }

        // Add user message to chat
        this.addMessage(message, 'user');
        this.userInput.value = '';
        this.autoResizeTextarea();

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
            avatar.innerHTML = '<i class="fas fa-tree"></i>';
        } else {
            avatar.innerHTML = '<i class="fas fa-user"></i>';
        }

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageText = document.createElement('p');
        messageText.textContent = content;
        
        messageContent.appendChild(messageText);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
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
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
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
    // For Vercel deployment, use relative path
    else {
        natureAI.updateApiUrl('/api/chat');
    }
    
    // Make it globally accessible for debugging
    window.natureAI = natureAI;
});

// Add some nature-inspired utility functions
const NatureUtils = {
    // Generate random nature emojis for fun
    getRandomNatureEmoji() {
        const emojis = ['🌳', '🌿', '🍃', '🌱', '🌸', '🌺', '🌻', '🌲', '🌴', '🌵', '🍀', '🌾'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    },

    // Add subtle nature sounds (optional - for future enhancement)
    playNatureSound() {
        // This could be implemented with Web Audio API for ambient nature sounds
        console.log('Nature sounds could be added here for enhanced experience');
    },

    // Seasonal theme changes
    getSeasonalTheme() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring'; // March-May
        if (month >= 5 && month <= 7) return 'summer'; // June-August
        if (month >= 8 && month <= 10) return 'autumn'; // September-November
        return 'winter'; // December-February
    }
};

// Add some Easter eggs and fun interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add click effect to the logo
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            const emoji = NatureUtils.getRandomNatureEmoji();
            logo.style.transform = 'scale(1.1)';
            setTimeout(() => logo.style.transform = 'scale(1)', 200);
            
            // Show a fun notification
            if (window.natureAI) {
                window.natureAI.showNotification(`Welcome to the forest! ${emoji}`, 'info');
            }
        });
    }

    // Add some interactive elements to floating leaves
    const leaves = document.querySelectorAll('.leaf');
    leaves.forEach(leaf => {
        leaf.addEventListener('click', () => {
            leaf.style.animation = 'none';
            leaf.style.transform = 'scale(1.5) rotate(360deg)';
            setTimeout(() => {
                leaf.style.animation = 'float 6s ease-in-out infinite';
                leaf.style.transform = 'scale(1) rotate(0deg)';
            }, 1000);
        });
    });
});
