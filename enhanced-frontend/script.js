// Enhanced Nature AI - Advanced Chatbot with Memory & Reasoning

class EnhancedNatureAI {
    constructor() {
        this.apiUrl = 'http://localhost:8001/api/chat';  // Enhanced API endpoint
        this.messages = [];
        this.conversationHistory = this.loadConversationHistory();
        this.isLoading = false;
        this.settings = this.loadSettings();
        this.isOnline = false;
        this.sessionStartTime = Date.now();
        this.totalMessages = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.checkFirstTimeUser();
        this.updateStatus();
        this.loadConversationFromHistory();
        this.loadSidePanelState();
        this.startStatsTimer();
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
        this.confidenceThreshold = document.getElementById('confidenceThreshold');
        this.confidenceValue = document.getElementById('confidenceValue');
        this.enableReasoning = document.getElementById('enableReasoning');
        this.clearConversationBtn = document.getElementById('clearConversation');
        this.exportConversationBtn = document.getElementById('exportConversation');
        
        // Side panel elements
        this.sidePanel = document.getElementById('sidePanel');
        this.togglePanel = document.getElementById('togglePanel');
        this.reasoningContent = document.getElementById('reasoningContent');
        this.questionsContent = document.getElementById('questionsContent');
        
        // Header elements
        this.darkModeBtn = document.getElementById('darkModeBtn');
        this.reasoningPanelBtn = document.getElementById('reasoningPanelBtn');
        this.statusIndicator = document.querySelector('.status-indicator');
        this.memoryCount = document.getElementById('memoryCount');
        
        // Stats elements
        this.totalMessagesEl = document.getElementById('totalMessages');
        this.memoryUsageEl = document.getElementById('memoryUsage');
        this.sessionTimeEl = document.getElementById('sessionTime');
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
        this.clearConversationBtn.addEventListener('click', () => this.clearConversationHistory());
        this.exportConversationBtn.addEventListener('click', () => this.exportConversation());
        
        // Side panel events
        this.togglePanel.addEventListener('click', () => this.toggleSidePanel());

        // Close modal when clicking outside
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        // Dark mode toggle
        this.darkModeBtn.addEventListener('click', () => this.toggleDarkMode());

        // Reasoning panel toggle
        this.reasoningPanelBtn.addEventListener('click', () => this.toggleSidePanel());

        // Confidence threshold slider
        this.confidenceThreshold.addEventListener('input', (e) => {
            this.confidenceValue.textContent = e.target.value;
        });

        // Load settings when page loads
        window.addEventListener('load', () => this.populateSettingsForm());
    }

    checkFirstTimeUser() {
        if (!this.settings.apiKey) {
            setTimeout(() => {
                this.openSettings();
                this.showNotification('Welcome to Enhanced Nature AI! 🧠 Please enter your OpenAI API key to unlock advanced features.', 'info');
            }, 1500);
        }
    }

    loadSettings() {
        const defaultSettings = {
            apiKey: '',
            model: 'gpt-4o-mini',
            developerMessage: 'You are Enhanced Nature AI, an advanced conversational AI with memory, reasoning, and structured response capabilities. You provide transparent, engaging, and helpful responses while building upon conversation context.',
            darkMode: false,
            enableReasoning: true,
            confidenceThreshold: 0.7
        };

        try {
            const saved = localStorage.getItem('enhancedNatureAI-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Error loading enhanced settings:', error);
            return defaultSettings;
        }
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('enhancedNatureAI-conversation');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading enhanced conversation history:', error);
            return [];
        }
    }

    saveConversationHistory() {
        try {
            localStorage.setItem('enhancedNatureAI-conversation', JSON.stringify(this.conversationHistory));
            this.updateMemoryStats();
        } catch (error) {
            console.error('Error saving enhanced conversation history:', error);
        }
    }

    loadConversationFromHistory() {
        if (this.conversationHistory.length > 0) {
            // Load previous messages
            this.conversationHistory.forEach(msg => {
                this.addMessage(msg.content, msg.role, false, false);
            });
            
            this.totalMessages = this.conversationHistory.length;
            this.updateStats();
        }
    }

    clearConversationHistory() {
        this.conversationHistory = [];
        this.saveConversationHistory();
        this.chatMessages.innerHTML = '';
        this.totalMessages = 0;
        this.updateStats();
        this.clearSidePanel();
        this.showNotification('Conversation memory cleared! 🧹', 'success');
    }

    exportConversation() {
        try {
            const conversationData = {
                timestamp: new Date().toISOString(),
                totalMessages: this.conversationHistory.length,
                conversation: this.conversationHistory,
                settings: this.settings
            };
            
            const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `enhanced-nature-ai-conversation-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Conversation exported successfully! 📁', 'success');
        } catch (error) {
            console.error('Error exporting conversation:', error);
            this.showNotification('Error exporting conversation', 'error');
        }
    }

    populateSettingsForm() {
        this.apiKeyInput.value = this.settings.apiKey;
        this.modelSelect.value = this.settings.model;
        this.developerMessageInput.value = this.settings.developerMessage;
        this.confidenceThreshold.value = this.settings.confidenceThreshold;
        this.confidenceValue.textContent = this.settings.confidenceThreshold;
        this.enableReasoning.checked = this.settings.enableReasoning;
        
        // Apply dark mode if enabled
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
            this.darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    saveSettingsToStorage() {
        this.settings.apiKey = this.apiKeyInput.value.trim();
        this.settings.model = this.modelSelect.value;
        this.settings.developerMessage = this.developerMessageInput.value.trim();
        this.settings.confidenceThreshold = parseFloat(this.confidenceThreshold.value);
        this.settings.enableReasoning = this.enableReasoning.checked;

        try {
            localStorage.setItem('enhancedNatureAI-settings', JSON.stringify(this.settings));
            this.showNotification('Enhanced settings saved successfully! 🧠✨', 'success');
            this.closeSettings();
            this.updateStatus();
        } catch (error) {
            console.error('Error saving enhanced settings:', error);
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
            localStorage.setItem('enhancedNatureAI-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving dark mode setting:', error);
        }
    }

    updateStatus() {
        if (this.settings.apiKey) {
            this.isOnline = true;
            this.statusIndicator.classList.remove('offline');
            this.statusIndicator.classList.add('online');
            this.statusIndicator.querySelector('.status-text').textContent = 'Enhanced Online';
        } else {
            this.isOnline = false;
            this.statusIndicator.classList.remove('online');
            this.statusIndicator.classList.add('offline');
            this.statusIndicator.querySelector('.status-text').textContent = 'Offline';
        }
        this.updateMemoryStats();
    }

    updateMemoryStats() {
        const memorySize = JSON.stringify(this.conversationHistory).length;
        this.memoryCount.textContent = this.conversationHistory.length;
        this.memoryUsageEl.textContent = Math.round(memorySize / 1024);
    }

    updateStats() {
        this.totalMessagesEl.textContent = this.totalMessages;
        this.updateMemoryStats();
    }

    startStatsTimer() {
        setInterval(() => {
            const sessionTime = Math.round((Date.now() - this.sessionStartTime) / 60000);
            this.sessionTimeEl.textContent = `${sessionTime}m`;
        }, 1000);
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message || this.isLoading) return;

        // Check if API key is configured
        if (!this.settings.apiKey) {
            this.showNotification('Please configure your OpenAI API key first to use Enhanced Nature AI.', 'warning');
            this.openSettings();
            return;
        }

        // Add user message to chat
        this.addMessage(message, 'user');
        this.userInput.value = '';

        // Show loading state
        this.setLoading(true);

        try {
            // Add user message to conversation history
            this.conversationHistory.push({
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            });

            // Prepare enhanced request payload
            const payload = {
                developer_message: this.settings.developerMessage,
                user_message: message,
                conversation_history: this.conversationHistory.slice(-20), // Send last 20 messages for context
                model: this.settings.model,
                api_key: this.settings.apiKey,
                enable_reasoning: this.settings.enableReasoning,
                confidence_threshold: this.settings.confidenceThreshold
            };

            // Make API request to enhanced backend with better error handling
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 422) {
                    throw new Error(`API validation error: Please check your API key and try again`);
                } else if (response.status === 500) {
                    throw new Error(`Server error: ${errorText || 'Please check your API key and try again'}`);
                } else {
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }
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

                // Update bot message content with enhanced formatting
                const formattedMessage = this.formatEnhancedMessage(botMessage);
                botMessageElement.querySelector('.message-content p').innerHTML = formattedMessage;
                this.scrollToBottom();
            }

            // Add bot response to conversation history
            this.conversationHistory.push({
                role: 'assistant',
                content: botMessage,
                timestamp: new Date().toISOString()
            });

            // Parse and update side panel with reasoning and questions
            const { reasoning, questions, mainContent } = this.parseMessageContent(botMessage);
            this.updateSidePanel(reasoning, questions);
            
            // Update the main message content with cleaned structured content
            if (mainContent && mainContent !== botMessage) {
                const formattedMainContent = this.formatEnhancedMessage(mainContent);
                botMessageElement.querySelector('.message-content p').innerHTML = formattedMainContent;
            }

            // Save conversation history
            this.saveConversationHistory();
            this.totalMessages++;
            this.updateStats();
            
            // Auto-scroll to bottom after a short delay to ensure content is rendered
            setTimeout(() => this.scrollToBottom(), 100);

        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('Error connecting to Enhanced Nature AI. Please check your API key and try again.', 'error');
            
            // Add error message to chat
            this.addMessage('Sorry, I encountered an error. Please check your API key and try again. Enhanced Nature AI is designed to be more reliable and transparent.', 'bot');
        } finally {
            this.setLoading(false);
        }
    }

    addMessage(content, sender, isStreaming = false, saveToHistory = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message enhanced`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (sender === 'bot') {
            avatar.innerHTML = '<i class="fas fa-brain"></i>';
        } else {
            avatar.innerHTML = '<i class="fas fa-user"></i>';
        }

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageText = document.createElement('p');
        
        // Format message content appropriately
        if (sender === 'bot' && !isStreaming) {
            messageText.innerHTML = this.formatEnhancedMessage(content);
        } else {
            messageText.textContent = content;
        }
        
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

    formatEnhancedMessage(content) {
        // Enhanced formatting for structured AI responses
        let formatted = content
            // Convert line breaks to <br>
            .replace(/\n/g, '<br>')
            // Format headings (lines that are all caps or start with capital letters and end with :)
            .replace(/^([A-Z][A-Z\s]+:?)$/gm, '<br><strong style="color: #059669; font-size: 1.1em; display: block; margin: 1rem 0 0.5rem 0;">$1</strong>')
            // Format numbered lists
            .replace(/^(\d+\.\s)/gm, '<br><strong style="color: #3b82f6;">$1</strong>')
            // Format bullet points
            .replace(/^[-•]\s/gm, '<br>• <span style="color: #059669;">')
            // Format confidence indicators
            .replace(/\(Confidence: [\d.]+\)/g, '<span style="color: #f59e0b; font-weight: 600;">$&</span>')
            // Clean up multiple line breaks
            .replace(/(<br>){3,}/g, '<br><br>')
            // Remove leading <br> tags
            .replace(/^(<br>)+/, '');
        
        return formatted;
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
            this.sendButton.innerHTML = '<i class="fas fa-brain fa-spin"></i>';
        } else {
            this.loadingIndicator.classList.remove('show');
            this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    toggleSidePanel() {
        this.sidePanel.classList.toggle('collapsed');
        const isCollapsed = this.sidePanel.classList.contains('collapsed');
        this.togglePanel.querySelector('i').className = isCollapsed ? 'fas fa-chevron-left' : 'fas fa-chevron-right';
        
        // Update header button state
        if (isCollapsed) {
            this.reasoningPanelBtn.classList.remove('active');
        } else {
            this.reasoningPanelBtn.classList.add('active');
        }
        
        // Save panel state to localStorage
        localStorage.setItem('enhancedNatureAI-sidePanelCollapsed', isCollapsed);
    }

    loadSidePanelState() {
        const isCollapsed = localStorage.getItem('enhancedNatureAI-sidePanelCollapsed') === 'true';
        if (isCollapsed) {
            this.sidePanel.classList.add('collapsed');
            this.togglePanel.querySelector('i').className = 'fas fa-chevron-left';
            this.reasoningPanelBtn.classList.remove('active');
        } else {
            this.reasoningPanelBtn.classList.add('active');
        }
    }

    updateSidePanel(reasoning, questions) {
        if (reasoning) {
            this.reasoningContent.innerHTML = `<p>${reasoning}</p>`;
        }
        
        if (questions && questions.length > 0) {
            const questionsHtml = questions.map(q => `<p>• ${q}</p>`).join('');
            this.questionsContent.innerHTML = questionsHtml;
        }
    }

    clearSidePanel() {
        this.reasoningContent.innerHTML = '<p class="no-content">No reasoning available yet</p>';
        this.questionsContent.innerHTML = '<p class="no-content">No questions available yet</p>';
    }

    parseMessageContent(content) {
        // Extract reasoning and follow-up questions from structured AI response
        let reasoning = null;
        let questions = [];
        
        // Look for reasoning sections in structured responses
        const reasoningMatch = content.match(/REASONING:?\s*([\s\S]*?)(?=FOLLOW-UP QUESTIONS:|$)/i);
        if (reasoningMatch) {
            reasoning = reasoningMatch[1].trim();
        }
        
        // Look for follow-up questions sections
        const questionsMatch = content.match(/FOLLOW-UP QUESTIONS:?\s*([\s\S]*?)$/i);
        if (questionsMatch) {
            const questionsText = questionsMatch[1].trim();
            questions = questionsText
                .split(/\n/)
                .map(q => q.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim())
                .filter(q => q.length > 0 && q.includes('?'));
        }
        
        // Remove reasoning and questions sections from main content for cleaner display
        let mainContent = content
            .replace(/REASONING:?\s*[\s\S]*?(?=FOLLOW-UP QUESTIONS:|$)/gi, '')
            .replace(/FOLLOW-UP QUESTIONS:?\s*[\s\S]*$/gi, '')
            .trim();
        
        // Clean up the main content
        mainContent = mainContent
            .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
            .replace(/^\s+|\s+$/g, '') // Trim whitespace
            .replace(/\n+/g, '\n'); // Clean up line breaks
        
        return { reasoning, questions, mainContent };
    }

    showNotification(message, type = 'info') {
        // Create enhanced notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add enhanced styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#dc2626' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 12px 16px;
            border-radius: 12px;
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

// Initialize Enhanced Nature AI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const enhancedNatureAI = new EnhancedNatureAI();
    
    // Update API URL based on environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        enhancedNatureAI.updateApiUrl('http://localhost:8001/api/chat');
    }

    // For production deployment - use relative path to avoid CORS and authentication issues
    else {
        // Use relative path - the API should be deployed together with the frontend
        enhancedNatureAI.updateApiUrl('/api/chat');
    }
    
    // Make it globally accessible for debugging
    window.enhancedNatureAI = enhancedNatureAI;
});
