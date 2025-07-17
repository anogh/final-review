class ChatApp {
    constructor() {
        this.socket = null;
        this.authenticated = false;
        this.currentUserIdentity = null;
        this.initializeElements();
        this.setupEventListeners();
        this.showLoginForm();
    }

    initializeElements() {
        // Login elements
        this.loginForm = document.getElementById('loginForm');
        this.passwordInput = document.getElementById('passwordInput');
        this.loginButton = document.getElementById('loginButton');
        this.loginError = document.getElementById('loginError');

        // Chat elements
        this.chatContainer = document.getElementById('chatContainer');
        this.messagesContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.fileInput = document.getElementById('fileInput');
        this.fileButton = document.getElementById('fileButton');
        this.userStatus = document.getElementById('userStatus');
        this.currentUserDisplay = document.getElementById('currentUser');
    }

    setupEventListeners() {
        // Login form
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin(e);
        });

        // Chat form
        document.getElementById('chatForm').addEventListener('submit', (e) => this.handleSendMessage(e));
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage(e);
            }
        });

        // File upload
        this.fileButton.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    showLoginForm() {
        this.loginForm.style.display = 'block';
        this.chatContainer.style.display = 'none';
        this.passwordInput.focus();
    }

    showChatInterface() {
        this.loginForm.style.display = 'none';
        this.chatContainer.style.display = 'block';
        this.messageInput.focus();
    }

    async handleLogin(e) {
        e.preventDefault();
        const password = this.passwordInput.value.trim();
        
        if (!password) {
            this.showLoginError('Please enter a password');
            return;
        }

        this.loginButton.disabled = true;
        this.loginButton.textContent = 'Connecting...';

        try {
            // Verify password with server first
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const result = await response.json();

            if (result.success) {
                this.connectToSocket(password);
            } else {
                this.showLoginError(result.message || 'Invalid password');
                this.resetLoginButton();
            }
        } catch (error) {
            console.error('Authentication error:', error);
            this.showLoginError('Connection failed. Please try again.');
            this.resetLoginButton();
        }
    }

    connectToSocket(password) {
        this.socket = io();

        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.socket.emit('authenticate', password);
        });

        this.socket.on('auth_success', (data) => {
            console.log('Authentication successful:', data);
            this.authenticated = true;
            this.currentUserIdentity = data.userIdentity;
            this.updateCurrentUserDisplay();
            this.showChatInterface();
            this.resetLoginButton();
        });

        this.socket.on('auth_error', (message) => {
            console.error('Authentication failed:', message);
            this.showLoginError(message);
            this.resetLoginButton();
            this.socket.disconnect();
        });

        this.socket.on('user_status', (status) => {
            this.updateUserStatus(status);
        });

        this.socket.on('message_received', (message) => {
            this.displayMessage(message);
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.displaySystemMessage('Error: ' + error, 'error');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.authenticated = false;
            this.currentUserIdentity = null;
            this.displaySystemMessage('Disconnected from server', 'error');
        });
    }

    updateCurrentUserDisplay() {
        if (this.currentUserDisplay && this.currentUserIdentity) {
            this.currentUserDisplay.textContent = `Logged in as: ${this.currentUserIdentity}`;
            this.currentUserDisplay.className = `current-user ${this.currentUserIdentity.toLowerCase()}`;
        }
    }

    updateUserStatus(status) {
        if (this.userStatus) {
            const { user1Connections, user2Connections, totalConnections } = status;
            this.userStatus.innerHTML = `
                <div class="user-status-item">
                    <span class="user-indicator user1">User1</span>
                    <span class="connection-count">${user1Connections} device${user1Connections !== 1 ? 's' : ''}</span>
                </div>
                <div class="user-status-item">
                    <span class="user-indicator user2">User2</span>
                    <span class="connection-count">${user2Connections} device${user2Connections !== 1 ? 's' : ''}</span>
                </div>
                <div class="total-connections">Total: ${totalConnections} connection${totalConnections !== 1 ? 's' : ''}</div>
            `;
        }
    }

    showLoginError(message) {
        this.loginError.textContent = message;
        this.loginError.style.display = 'block';
    }

    resetLoginButton() {
        this.loginButton.disabled = false;
        this.loginButton.textContent = 'Connect';
    }

    handleSendMessage(e) {
        e.preventDefault();
        
        if (!this.authenticated) {
            this.displaySystemMessage('Please log in first', 'error');
            return;
        }

        const text = this.messageInput.value.trim();
        if (!text) return;

        const message = {
            type: 'text',
            text: text
        };

        this.socket.emit('chat_message', message);
        this.messageInput.value = '';
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.displaySystemMessage('File too large. Maximum size is 5MB.', 'error');
            return;
        }

        // Check file type (images only)
        if (!file.type.startsWith('image/')) {
            this.displaySystemMessage('Only image files are allowed.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const fileData = {
                fileName: file.name,
                fileData: event.target.result,
                fileType: file.type
            };

            this.socket.emit('file_upload', fileData);
        };

        reader.readAsDataURL(file);
        e.target.value = ''; // Reset file input
    }

    displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.userIdentity ? message.userIdentity.toLowerCase() : 'system'}`;
        
        // Add 'own-message' class if this is the current user's message
        if (message.userIdentity === this.currentUserIdentity) {
            messageElement.classList.add('own-message');
        }

        const timestamp = new Date(message.timestamp).toLocaleTimeString();
        
        let content = '';
        
        // User identity header
        if (message.userIdentity) {
            content += `<div class="message-header">
                <span class="user-identity ${message.userIdentity.toLowerCase()}">${message.userIdentity}</span>
                <span class="timestamp">${timestamp}</span>
            </div>`;
        }

        if (message.type === 'text') {
            content += `<div class="message-content">
                <div class="original-text">${this.escapeHtml(message.text)}</div>`;
            
            // Display translation if available
            if (message.translation) {
                const { translatedText, sourceLanguage, targetLanguage } = message.translation;
                content += `<div class="translation">
                    <div class="translation-label">
                        <span class="auto-translate-badge">Auto-translated</span>
                        <span class="language-info">${sourceLanguage} → ${targetLanguage}</span>
                    </div>
                    <div class="translated-text">${this.escapeHtml(translatedText)}</div>
                </div>`;
            }
            
            content += '</div>';
        } else if (message.type === 'file') {
            content += `<div class="message-content">
                <div class="file-message">
                    <img src="${message.fileData}" alt="${message.fileName}" class="shared-image" />
                    <div class="file-info">${this.escapeHtml(message.fileName)}</div>
                </div>
            </div>`;
        }

        messageElement.innerHTML = content;
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    displaySystemMessage(text, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `message system ${type}`;
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="system-text">${this.escapeHtml(text)}</div>
            </div>
        `;
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the chat app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});