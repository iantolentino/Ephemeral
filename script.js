// User credentials
const VALID_USERS = {
    'admin1': 'root1',
    'admin2': 'root2',
    'admin': 'root'
};

// Application state
let currentUser = null;
let peer = null;
let conn = null;
let myPeerId = null;
let messageHistory = [];
let isConnecting = false;

// DOM Elements
const loginPage = document.getElementById('login-page');
const connectionPage = document.getElementById('connection-page');
const chatPage = document.getElementById('chat-page');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const errorText = document.querySelector('.error-text');
const passwordToggle = document.getElementById('password-toggle');
const welcomeUserSpan = document.getElementById('welcome-user');
const myIdSpan = document.getElementById('my-id');
const copyIdBtn = document.getElementById('copy-id');
const peerIdInput = document.getElementById('peer-id');
const connectBtn = document.getElementById('connect-btn');
const statusSpan = document.getElementById('status');
const statusDot = document.getElementById('status-dot');
const connectedPeerSpan = document.getElementById('connected-peer');
const goToChatBtn = document.getElementById('go-to-chat');
const logoutFromConnectBtn = document.getElementById('logout-from-connect');
const currentUserSpan = document.getElementById('current-user');
const connectedToSpan = document.getElementById('connected-to');
const disconnectBtn = document.getElementById('disconnect-btn');
const logoutBtn = document.getElementById('logout-btn');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const emojiBtn = document.getElementById('emoji-btn');
const notification = document.getElementById('notification');

// Initialize application
function init() {
    loadMessageHistory();
    setupEventListeners();
    checkExistingSession();
    setupAnimations();
}

function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    passwordToggle.addEventListener('click', togglePasswordVisibility);
    copyIdBtn.addEventListener('click', copyMyId);
    connectBtn.addEventListener('click', connectToPeer);
    peerIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') connectToPeer();
    });
    goToChatBtn.addEventListener('click', goToChat);
    logoutFromConnectBtn.addEventListener('click', handleLogout);
    disconnectBtn.addEventListener('click', disconnectFromPeer);
    logoutBtn.addEventListener('click', handleLogout);
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    messageInput.addEventListener('input', handleMessageInput);
    emojiBtn.addEventListener('click', toggleEmojiPicker);
    
    // Window event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
}

function setupAnimations() {
    // Add intersection observer for animated elements
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, { threshold: 0.1 });
    
    // Observe all animatable elements
    document.querySelectorAll('.connection-card, .message').forEach(el => {
        observer.observe(el);
    });
}

function checkExistingSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser && VALID_USERS[savedUser]) {
        initializePeer(savedUser);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.querySelector('.login-btn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');

    // Show loading state
    btnText.style.opacity = '0';
    btnLoader.style.display = 'block';
    loginBtn.disabled = true;

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (VALID_USERS[username] && VALID_USERS[username] === password) {
        showNotification('Login successful!', 'success');
        await new Promise(resolve => setTimeout(resolve, 500));
        initializePeer(username);
    } else {
        showLoginError('Invalid username or password');
    }

    // Reset button state
    btnText.style.opacity = '1';
    btnLoader.style.display = 'none';
    loginBtn.disabled = false;
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const icon = passwordToggle.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function initializePeer(username) {
    currentUser = username;
    
    // Show connecting state
    updateStatus('connecting', 'Initializing connection...');

    // Initialize PeerJS with better configuration
    peer = new Peer({
        debug: 2,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' }
            ]
        }
    });

    peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        myPeerId = id;
        showNotification('Connection ready!', 'success');
        showConnectionPage();
    });

    peer.on('connection', (connection) => {
        console.log('Incoming connection from:', connection.peer);
        if (!conn) {
            handleIncomingConnection(connection);
        } else {
            showNotification('Connection already established', 'warning');
            connection.close();
        }
    });

    peer.on('error', (err) => {
        console.error('Peer error:', err);
        let errorMessage = 'Connection error';
        
        switch (err.type) {
            case 'network':
                errorMessage = 'Network error. Please check your connection.';
                break;
            case 'peer-unavailable':
                errorMessage = 'Peer is unavailable or ID is incorrect.';
                break;
            case 'socket-error':
                errorMessage = 'Connection server error.';
                break;
            case 'server-error':
                errorMessage = 'Server error. Please try again.';
                break;
        }
        
        updateStatus('error', errorMessage);
        showNotification(errorMessage, 'error');
    });

    // Save to localStorage
    localStorage.setItem('currentUser', username);
    hideLoginError();
}

function showConnectionPage() {
    welcomeUserSpan.textContent = currentUser;
    myIdSpan.innerHTML = `<span class="id-text">${myPeerId}</span>`;
    updateStatus('disconnected', 'Ready to connect');
    
    switchPage(loginPage, connectionPage);
}

function copyMyId() {
    navigator.clipboard.writeText(myPeerId).then(() => {
        showNotification('Connection ID copied to clipboard!', 'success');
        // Add visual feedback
        copyIdBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyIdBtn.innerHTML = '<i class="fas fa-copy"></i> Copy ID';
        }, 2000);
    }).catch(() => {
        showNotification('Failed to copy ID', 'error');
    });
}

function connectToPeer() {
    const peerId = peerIdInput.value.trim();
    if (!peerId) {
        showNotification('Please enter a connection ID', 'warning');
        return;
    }

    if (isConnecting) {
        showNotification('Already connecting...', 'warning');
        return;
    }

    if (conn) {
        showNotification('Connection already established', 'warning');
        return;
    }

    isConnecting = true;
    updateStatus('connecting', 'Connecting to peer...');
    
    // Add loading state to connect button
    const originalText = connectBtn.innerHTML;
    connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    connectBtn.disabled = true;

    conn = peer.connect(peerId, {
        reliable: true,
        serialization: 'json',
        metadata: {
            username: currentUser,
            timestamp: Date.now()
        }
    });

    setupConnectionHandlers(conn);
    
    // Timeout for connection attempt
    setTimeout(() => {
        if (isConnecting) {
            showNotification('Connection timeout. Please check the ID and try again.', 'error');
            updateStatus('error', 'Connection failed');
            resetConnectionState();
        }
    }, 10000);
}

function handleIncomingConnection(connection) {
    if (conn) {
        showNotification('Connection already exists', 'warning');
        connection.close();
        return;
    }
    
    conn = connection;
    setupConnectionHandlers(conn);
    showNotification(`Incoming connection from ${connection.metadata.username}`, 'success');
}

function setupConnectionHandlers(connection) {
    connection.on('open', () => {
        console.log('Connected to:', connection.peer);
        isConnecting = false;
        
        const peerUsername = connection.metadata.username || 'Unknown';
        updateStatus('connected', `Connected to ${peerUsername}`);
        connectedPeerSpan.innerHTML = `Connected with: <strong>${peerUsername}</strong>`;
        
        // Reset connect button
        connectBtn.innerHTML = '<i class="fas fa-plug"></i> Connect';
        connectBtn.disabled = false;
        
        showNotification(`Connected to ${peerUsername}!`, 'success');
        
        // Enable chat button with animation
        goToChatBtn.disabled = false;
        goToChatBtn.style.transform = 'scale(1.05)';
        setTimeout(() => {
            goToChatBtn.style.transform = 'scale(1)';
        }, 150);
        
        // Send our user info
        connection.send({
            type: 'user_info',
            username: currentUser,
            timestamp: Date.now()
        });
    });

    connection.on('data', (data) => {
        console.log('Received data:', data);
        handleReceivedData(data);
    });

    connection.on('close', () => {
        console.log('Connection closed');
        isConnecting = false;
        updateStatus('disconnected', 'Connection closed');
        connectedPeerSpan.innerHTML = '';
        goToChatBtn.disabled = true;
        
        if (chatPage.classList.contains('active')) {
            addSystemMessage('Connection lost');
            showNotification('Connection lost', 'warning');
        }
        
        resetConnectionState();
    });

    connection.on('error', (err) => {
        console.error('Connection error:', err);
        isConnecting = false;
        updateStatus('error', 'Connection error');
        showNotification('Connection error occurred', 'error');
        resetConnectionState();
    });
}

function resetConnectionState() {
    isConnecting = false;
    conn = null;
    
    // Reset connect button
    connectBtn.innerHTML = '<i class="fas fa-plug"></i> Connect';
    connectBtn.disabled = false;
}

function handleReceivedData(data) {
    switch (data.type) {
        case 'message':
            addMessageToHistory({
                id: data.id || Date.now(),
                user: data.username,
                text: data.text,
                timestamp: data.timestamp || new Date().toLocaleTimeString()
            });
            displayMessages();
            
            // Show notification for new messages when not focused
            if (document.hidden && data.username !== currentUser) {
                showNotification(`New message from ${data.username}`, 'success');
            }
            break;
            
        case 'user_info':
            if (connectedToSpan) {
                connectedToSpan.textContent = data.username;
            }
            // Update connected peer info
            connectedPeerSpan.innerHTML = `Connected with: <strong>${data.username}</strong>`;
            break;
            
        case 'history_request':
            if (conn && conn.open) {
                conn.send({
                    type: 'history_sync',
                    history: messageHistory,
                    syncId: Date.now()
                });
            }
            break;
            
        case 'history_sync':
            if (data.history) {
                // Merge histories, avoiding duplicates
                const existingIds = new Set(messageHistory.map(msg => msg.id));
                const newMessages = data.history.filter(msg => !existingIds.has(msg.id));
                
                if (newMessages.length > 0) {
                    messageHistory.push(...newMessages);
                    messageHistory.sort((a, b) => a.id - b.id);
                    saveMessageHistory();
                    displayMessages();
                    showNotification(`Synced ${newMessages.length} messages`, 'success');
                }
            }
            break;
            
        case 'typing_start':
            showTypingIndicator(data.username);
            break;
            
        case 'typing_stop':
            hideTypingIndicator();
            break;
    }
}

function updateStatus(status, message) {
    statusSpan.textContent = message;
    statusDot.className = 'status-dot ' + status;
    
    // Add pulse animation for connecting
    if (status === 'connecting') {
        statusDot.style.animation = 'pulse 2s infinite';
    } else {
        statusDot.style.animation = 'none';
    }
}

function goToChat() {
    if (!conn || !conn.open) {
        showNotification('Not connected to any peer', 'error');
        return;
    }

    // Request message history from peer
    conn.send({
        type: 'history_request'
    });

    currentUserSpan.textContent = currentUser;
    
    switchPage(connectionPage, chatPage);
    
    // Add welcome message if no messages exist
    if (messageHistory.length === 0) {
        addSystemMessage(`Secure P2P connection established! Start chatting with ${connectedToSpan.textContent}`);
    }
    
    displayMessages();
    messageInput.focus();
}

function disconnectFromPeer() {
    if (conn) {
        conn.close();
        conn = null;
    }
    
    switchPage(chatPage, connectionPage);
    addSystemMessage('Disconnected from peer');
    showNotification('Disconnected from peer', 'warning');
}

function handleLogout() {
    if (conn) {
        conn.close();
    }
    if (peer) {
        peer.destroy();
    }
    
    currentUser = null;
    myPeerId = null;
    conn = null;
    peer = null;
    isConnecting = false;
    
    localStorage.removeItem('currentUser');
    
    switchPage(chatPage, loginPage);
    switchPage(connectionPage, loginPage);
    
    // Clear inputs
    loginForm.reset();
    peerIdInput.value = '';
    messageInput.value = '';
    
    showNotification('Logged out successfully', 'success');
}

function handleMessageInput() {
    if (!conn || !conn.open) return;
    
    // Send typing indicators (throttled)
    if (messageInput.value.length > 0) {
        conn.send({
            type: 'typing_start',
            username: currentUser
        });
    } else {
        conn.send({
            type: 'typing_stop'
        });
    }
}

let typingTimeout;
function showTypingIndicator(username) {
    clearTimeout(typingTimeout);
    
    let typingIndicator = document.getElementById('typing-indicator');
    if (!typingIndicator) {
        typingIndicator = document.createElement('div');
        typingIndicator.id = 'typing-indicator';
        typingIndicator.className = 'message system typing';
        typingIndicator.innerHTML = `
            <div class="typing-content">
                <span>${username} is typing</span>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingIndicator);
    }
    
    scrollToBottom();
    
    typingTimeout = setTimeout(hideTypingIndicator, 3000);
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !conn || !conn.open) {
        if (!conn || !conn.open) {
            showNotification('Not connected to any peer', 'error');
            return;
        }
        return;
    }

    const messageData = {
        id: Date.now() + Math.random(), // Ensure unique ID
        user: currentUser,
        text: message,
        timestamp: new Date().toLocaleTimeString()
    };

    // Add to local history
    addMessageToHistory(messageData);
    displayMessages();
    
    // Send to peer
    conn.send({
        type: 'message',
        username: currentUser,
        text: message,
        timestamp: messageData.timestamp,
        id: messageData.id
    });

    // Stop typing indicator
    conn.send({
        type: 'typing_stop'
    });

    // Clear input and refocus
    messageInput.value = '';
    messageInput.focus();
    
    // Auto-scroll to bottom
    scrollToBottom();
}

function addMessageToHistory(message) {
    messageHistory.push(message);
    
    // Keep only last 200 messages to prevent storage issues
    if (messageHistory.length > 200) {
        messageHistory = messageHistory.slice(-150);
    }
    
    saveMessageHistory();
}

function addSystemMessage(text) {
    const messageData = {
        id: Date.now(),
        user: 'System',
        text: text,
        timestamp: new Date().toLocaleTimeString(),
        isSystem: true
    };
    addMessageToHistory(messageData);
    displayMessages();
    scrollToBottom();
}

function displayMessages() {
    if (!chatMessages) return;
    
    // Remove welcome message if there are actual messages
    const welcomeMessage = chatMessages.querySelector('.welcome-message');
    if (welcomeMessage && messageHistory.length > 0) {
        welcomeMessage.style.display = 'none';
    }
    
    // Filter out system messages if there are user messages
    const userMessages = messageHistory.filter(msg => !msg.isSystem);
    let messagesToShow = messageHistory;
    
    if (userMessages.length > 0) {
        // Only show system messages from the last session
        const lastUserMessageTime = Math.max(...userMessages.map(msg => msg.id));
        messagesToShow = messageHistory.filter(msg => 
            !msg.isSystem || msg.id > lastUserMessageTime - 300000 // 5 minutes
        );
    }
    
    chatMessages.innerHTML = '';
    
    messagesToShow.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.isSystem ? 'system' : msg.user === currentUser ? 'own' : 'other'}`;
        
        if (msg.isSystem) {
            messageDiv.innerHTML = `
                <div class="message-text">${msg.text}</div>
                <div class="message-time">${msg.timestamp}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-header">${msg.user}</div>
                <div class="message-text">${msg.text}</div>
                <div class="message-time">${msg.timestamp}</div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
    });
    
    scrollToBottom();
}

function scrollToBottom() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function saveMessageHistory() {
    try {
        localStorage.setItem('p2pChatMessages', JSON.stringify(messageHistory));
    } catch (e) {
        console.warn('Could not save message history:', e);
        // Clear old messages if storage is full
        if (e.name === 'QuotaExceededError') {
            messageHistory = messageHistory.slice(-50);
            localStorage.setItem('p2pChatMessages', JSON.stringify(messageHistory));
        }
    }
}

function loadMessageHistory() {
    try {
        const saved = localStorage.getItem('p2pChatMessages');
        if (saved) {
            messageHistory = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Could not load message history:', e);
        messageHistory = [];
    }
}

function switchPage(fromPage, toPage) {
    fromPage.classList.remove('active');
    toPage.classList.add('active');
    
    // Add page transition animation
    toPage.style.animation = 'slideUp 0.6s ease-out';
}

function showNotification(message, type = 'info') {
    const notificationIcon = notification.querySelector('.notification-icon');
    const notificationText = notification.querySelector('.notification-text');
    
    // Set notification content
    notificationText.textContent = message;
    notification.className = `notification ${type} show`;
    
    // Set icon based on type
    switch (type) {
        case 'success':
            notificationIcon.className = 'notification-icon fas fa-check-circle';
            break;
        case 'error':
            notificationIcon.className = 'notification-icon fas fa-exclamation-circle';
            break;
        case 'warning':
            notificationIcon.className = 'notification-icon fas fa-exclamation-triangle';
            break;
        default:
            notificationIcon.className = 'notification-icon fas fa-info-circle';
    }
    
    // Auto hide after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

function showLoginError(message) {
    errorText.textContent = message;
    loginError.classList.add('show');
}

function hideLoginError() {
    loginError.classList.remove('show');
}

function toggleEmojiPicker() {
    showNotification('Emoji picker coming soon!', 'info');
    // In a real implementation, you'd integrate an emoji picker library here
}

function handleBeforeUnload(e) {
    if (conn && conn.open) {
        e.preventDefault();
        e.returnValue = 'You have an active connection. Are you sure you want to leave?';
        return e.returnValue;
    }
}

// Add CSS for new elements
const additionalStyles = `
    .typing {
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(99, 102, 241, 0.3) !important;
    }
    
    .typing-content {
        display: flex;
        align-items: center;
        gap: 8px;
        font-style: italic;
    }
    
    .typing-dots {
        display: flex;
        gap: 3px;
    }
    
    .typing-dots span {
        width: 6px;
        height: 6px;
        background: var(--primary);
        border-radius: 50%;
        animation: typingBounce 1.4s infinite ease-in-out;
    }
    
    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes typingBounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
    }
    
    .message-time {
        font-size: 0.7rem;
        opacity: 0.6;
        margin-top: 4px;
        text-align: right;
    }
    
    .message.system .message-time {
        text-align: center;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', init);

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
    });
}
