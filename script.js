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
let ephemeralMode = true; // Default to ephemeral mode

// DOM Elements
const loginPage = document.getElementById('login-page');
const connectionPage = document.getElementById('connection-page');
const chatPage = document.getElementById('chat-page');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const errorText = document.querySelector('.error-text');
const passwordToggle = document.getElementById('password-toggle');
const ephemeralModeToggle = document.getElementById('ephemeral-mode');
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
const ephemeralBadge = document.getElementById('ephemeral-badge');
const ephemeralIndicator = document.getElementById('ephemeral-indicator');
const ephemeralNotice = document.getElementById('ephemeral-notice');
const modal = document.getElementById('confirmation-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');

// Initialize application
function init() {
    console.log('Initializing application...');
    loadMessageHistory();
    loadEphemeralMode();
    setupEventListeners();
    checkExistingSession();
    setupAnimations();
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    loginForm.addEventListener('submit', handleLogin);
    passwordToggle.addEventListener('click', togglePasswordVisibility);
    ephemeralModeToggle.addEventListener('change', handleEphemeralModeChange);
    copyIdBtn.addEventListener('click', copyMyId);
    connectBtn.addEventListener('click', connectToPeer);
    
    peerIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') connectToPeer();
    });
    
    goToChatBtn.addEventListener('click', goToChat);
    logoutFromConnectBtn.addEventListener('click', () => showLogoutConfirmation('connection'));
    disconnectBtn.addEventListener('click', disconnectFromPeer);
    logoutBtn.addEventListener('click', () => showLogoutConfirmation('chat'));
    sendBtn.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    messageInput.addEventListener('input', handleMessageInput);
    emojiBtn.addEventListener('click', toggleEmojiPicker);
    
    // Modal event listeners
    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);
    modalConfirm.addEventListener('click', handleModalConfirm);
    
    // Window event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('resize', handleResize);
    
    // Touch event listeners for better mobile experience
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    console.log('Event listeners setup complete');
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

function handleResize() {
    // Adjust UI for different screen sizes
    scrollToBottom();
}

function handleTouchStart(e) {
    // Add touch feedback
    if (e.target.classList.contains('account-card') || 
        e.target.classList.contains('action-btn') ||
        e.target.classList.contains('connect-btn') ||
        e.target.classList.contains('icon-btn')) {
        e.target.style.transform = 'scale(0.98)';
    }
}

function handleTouchEnd(e) {
    // Remove touch feedback
    if (e.target.classList.contains('account-card') || 
        e.target.classList.contains('action-btn') ||
        e.target.classList.contains('connect-btn') ||
        e.target.classList.contains('icon-btn')) {
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
    }
}

function checkExistingSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser && VALID_USERS[savedUser]) {
        console.log('Found existing session for:', savedUser);
        initializePeer(savedUser);
    } else {
        console.log('No existing session found');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    console.log('Login attempt...');
    
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
        console.log('Login successful for:', username);
        showNotification('Login successful!', 'success');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Save ephemeral mode setting
        saveEphemeralMode();
        initializePeer(username);
    } else {
        console.log('Login failed for:', username);
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

function handleEphemeralModeChange() {
    ephemeralMode = ephemeralModeToggle.checked;
    console.log('Ephemeral mode:', ephemeralMode ? 'enabled' : 'disabled');
    showNotification(
        ephemeralMode ? 
        'Ephemeral mode enabled - Messages will auto-delete on logout' : 
        'Ephemeral mode disabled - Messages will be saved',
        'info'
    );
}

function saveEphemeralMode() {
    localStorage.setItem('ephemeralMode', JSON.stringify(ephemeralMode));
}

function loadEphemeralMode() {
    const saved = localStorage.getItem('ephemeralMode');
    if (saved !== null) {
        ephemeralMode = JSON.parse(saved);
        ephemeralModeToggle.checked = ephemeralMode;
        console.log('Loaded ephemeral mode:', ephemeralMode);
    }
}

function initializePeer(username) {
    currentUser = username;
    console.log('Initializing PeerJS for user:', username);
    
    // Show connecting state
    updateStatus('connecting', 'Initializing connection...');

    // Initialize PeerJS with better configuration
    try {
        peer = new Peer({
            debug: 3, // Increased debug level for troubleshooting
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
            console.log('✅ PeerJS connected with ID:', id);
            myPeerId = id;
            showNotification('Connection ready!', 'success');
            showConnectionPage();
        });

        peer.on('connection', (connection) => {
            console.log('🔗 Incoming connection from:', connection.peer);
            if (!conn) {
                handleIncomingConnection(connection);
            } else {
                showNotification('Connection already established', 'warning');
                connection.close();
            }
        });

        peer.on('error', (err) => {
            console.error('❌ PeerJS error:', err);
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
                case 'browser-incompatible':
                    errorMessage = 'Your browser does not support WebRTC. Please use a modern browser.';
                    break;
                case 'disconnected':
                    errorMessage = 'Lost connection to signaling server.';
                    break;
                case 'invalid-id':
                    errorMessage = 'Invalid peer ID.';
                    break;
            }
            
            updateStatus('error', errorMessage);
            showNotification(errorMessage, 'error');
        });

        // Save to localStorage
        localStorage.setItem('currentUser', username);
        hideLoginError();
        
    } catch (error) {
        console.error('❌ Failed to initialize PeerJS:', error);
        showNotification('Failed to initialize connection: ' + error.message, 'error');
        updateStatus('error', 'Connection failed');
    }
}

function showConnectionPage() {
    console.log('Showing connection page...');
    welcomeUserSpan.textContent = currentUser;
    myIdSpan.innerHTML = `<span class="id-text">${myPeerId}</span>`;
    updateStatus('disconnected', 'Ready to connect');
    
    // Update ephemeral badge visibility
    ephemeralBadge.style.display = ephemeralMode ? 'flex' : 'none';
    
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
    console.log('Attempting to connect to peer:', peerId);
    
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

    try {
        conn = peer.connect(peerId, {
            reliable: true,
            serialization: 'json',
            metadata: {
                username: currentUser,
                timestamp: Date.now(),
                ephemeralMode: ephemeralMode
            }
        });

        setupConnectionHandlers(conn);
        
        // Timeout for connection attempt
        setTimeout(() => {
            if (isConnecting) {
                console.log('Connection timeout for peer:', peerId);
                showNotification('Connection timeout. Please check the ID and try again.', 'error');
                updateStatus('error', 'Connection failed');
                resetConnectionState();
            }
        }, 15000); // Increased timeout to 15 seconds
        
    } catch (error) {
        console.error('❌ Connection error:', error);
        showNotification('Connection error: ' + error.message, 'error');
        updateStatus('error', 'Connection error');
        resetConnectionState();
    }
}

function handleIncomingConnection(connection) {
    console.log('🔗 Handling incoming connection from:', connection.peer);
    
    if (conn) {
        showNotification('Connection already exists', 'warning');
        connection.close();
        return;
    }
    
    conn = connection;
    setupConnectionHandlers(conn);
    showNotification(`Incoming connection from ${connection.metadata?.username || 'Unknown'}`, 'success');
}

function setupConnectionHandlers(connection) {
    console.log('🔧 Setting up connection handlers...');
    
    connection.on('open', () => {
        console.log('✅ Connection established with:', connection.peer);
        isConnecting = false;
        
        const peerUsername = connection.metadata?.username || 'Unknown';
        const peerEphemeralMode = connection.metadata?.ephemeralMode || false;
        
        console.log('Peer username:', peerUsername);
        console.log('Peer ephemeral mode:', peerEphemeralMode);
        
        updateStatus('connected', `Connected to ${peerUsername}`);
        connectedPeerSpan.innerHTML = `Connected with: <strong>${peerUsername}</strong>`;
        
        // Reset connect button
        connectBtn.innerHTML = '<i class="fas fa-plug"></i> Connect';
        connectBtn.disabled = false;
        
        showNotification(`Connected to ${peerUsername}!`, 'success');
        
        // Enable chat button with animation
        goToChatBtn.disabled = false;
        goToChatBtn.style.opacity = '1';
        goToChatBtn.style.transform = 'scale(1.05)';
        setTimeout(() => {
            goToChatBtn.style.transform = 'scale(1)';
        }, 150);
        
        // Send our user info and settings
        connection.send({
            type: 'user_info',
            username: currentUser,
            ephemeralMode: ephemeralMode,
            timestamp: Date.now()
        });
        
        console.log('✅ Connection setup complete - Chat button should be enabled');
    });

    connection.on('data', (data) => {
        console.log('📨 Received data:', data);
        handleReceivedData(data);
    });

    connection.on('close', () => {
        console.log('🔒 Connection closed');
        isConnecting = false;
        updateStatus('disconnected', 'Connection closed');
        connectedPeerSpan.innerHTML = '';
        goToChatBtn.disabled = true;
        goToChatBtn.style.opacity = '0.5';
        
        if (chatPage.classList.contains('active')) {
            addSystemMessage('Connection lost');
            showNotification('Connection lost', 'warning');
            
            // If ephemeral mode is enabled, delete messages when connection is lost
            if (ephemeralMode) {
                setTimeout(() => {
                    clearMessageHistory();
                    showNotification('Messages cleared (ephemeral mode)', 'info');
                }, 1000);
            }
        }
        
        resetConnectionState();
    });

    connection.on('error', (err) => {
        console.error('❌ Connection error:', err);
        isConnecting = false;
        updateStatus('error', 'Connection error');
        showNotification('Connection error occurred', 'error');
        resetConnectionState();
    });
}

function resetConnectionState() {
    console.log('🔄 Resetting connection state');
    isConnecting = false;
    conn = null;
    
    // Reset connect button
    connectBtn.innerHTML = '<i class="fas fa-plug"></i> Connect';
    connectBtn.disabled = false;
}

function handleReceivedData(data) {
    switch (data.type) {
        case 'message':
            console.log('💬 Received message from:', data.username);
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
            console.log('👤 Received user info:', data.username);
            if (connectedToSpan) {
                connectedToSpan.textContent = data.username;
            }
            // Update connected peer info
            connectedPeerSpan.innerHTML = `Connected with: <strong>${data.username}</strong>`;
            
            // Update ephemeral indicators based on peer's setting
            updateEphemeralIndicators(data.ephemeralMode);
            break;
            
        case 'history_request':
            console.log('📜 History request received');
            if (conn && conn.open) {
                conn.send({
                    type: 'history_sync',
                    history: messageHistory,
                    syncId: Date.now()
                });
            }
            break;
            
        case 'history_sync':
            console.log('🔄 History sync received:', data.history?.length, 'messages');
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
            console.log('⌨️ Typing started:', data.username);
            showTypingIndicator(data.username);
            break;
            
        case 'typing_stop':
            console.log('💤 Typing stopped');
            hideTypingIndicator();
            break;
            
        case 'clear_history':
            console.log('🗑️ Clear history request received');
            // Peer requested to clear history (ephemeral mode)
            clearMessageHistory();
            showNotification('Messages cleared by peer', 'info');
            break;
            
        default:
            console.log('❓ Unknown data type:', data.type);
    }
}

function updateEphemeralIndicators(peerEphemeralMode) {
    const bothEphemeral = ephemeralMode && peerEphemeralMode;
    
    console.log('🔒 Ephemeral indicators - Local:', ephemeralMode, 'Peer:', peerEphemeralMode, 'Both:', bothEphemeral);
    
    // Update UI indicators
    ephemeralIndicator.style.display = bothEphemeral ? 'flex' : 'none';
    ephemeralNotice.style.display = bothEphemeral ? 'flex' : 'none';
    
    if (bothEphemeral) {
        showNotification('Both users have ephemeral mode enabled - Messages will auto-delete', 'info');
    }
}

function updateStatus(status, message) {
    console.log('📊 Status update:', status, message);
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
    console.log('🚀 Entering chat room...');
    
    if (!conn || !conn.open) {
        console.error('❌ Cannot enter chat - No active connection');
        showNotification('Not connected to any peer', 'error');
        return;
    }

    console.log('✅ Connection is active, proceeding to chat...');

    // Request message history from peer
    conn.send({
        type: 'history_request'
    });

    currentUserSpan.textContent = currentUser;
    
    switchPage(connectionPage, chatPage);
    
    // Add welcome message if no messages exist
    if (messageHistory.length === 0) {
        addSystemMessage(`Secure P2P connection established! Start chatting with ${connectedToSpan.textContent}`);
        if (ephemeralMode) {
            addSystemMessage('Ephemeral mode enabled - Messages will be deleted when you logout');
        }
    }
    
    displayMessages();
    
    // Focus on input after a short delay to ensure DOM is ready
    setTimeout(() => {
        messageInput.focus();
        console.log('✅ Chat room loaded successfully');
    }, 300);
}

function disconnectFromPeer() {
    console.log('🔌 Disconnecting from peer...');
    
    if (conn) {
        conn.close();
        conn = null;
    }
    
    switchPage(chatPage, connectionPage);
    addSystemMessage('Disconnected from peer');
    showNotification('Disconnected from peer', 'warning');
}

function showLogoutConfirmation(source) {
    if (ephemeralMode && messageHistory.length > 0) {
        modalTitle.textContent = 'Logout with Ephemeral Mode';
        modalMessage.textContent = 'You have ephemeral mode enabled. Logging out will permanently delete all messages. Are you sure you want to continue?';
        modal.dataset.action = 'logout';
        modal.dataset.source = source;
        showModal();
    } else {
        handleLogout(source);
    }
}

function handleModalConfirm() {
    const action = modal.dataset.action;
    const source = modal.dataset.source;
    
    if (action === 'logout') {
        handleLogout(source);
    }
    
    closeModal();
}

function showModal() {
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

function handleLogout(source) {
    console.log('🚪 Logging out...');
    
    // Clear message history if ephemeral mode is enabled
    if (ephemeralMode) {
        clearMessageHistory();
        
        // Notify peer to clear their history too
        if (conn && conn.open) {
            conn.send({
                type: 'clear_history',
                username: currentUser
            });
        }
    }
    
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
    
    // Navigate back to login page
    if (source === 'chat') {
        switchPage(chatPage, loginPage);
    } else {
        switchPage(connectionPage, loginPage);
    }
    
    // Clear inputs
    loginForm.reset();
    peerIdInput.value = '';
    messageInput.value = '';
    
    showNotification('Logged out successfully' + (ephemeralMode ? ' - Messages deleted' : ''), 'success');
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

    console.log('💬 Sending message:', message);

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

function clearMessageHistory() {
    messageHistory = [];
    saveMessageHistory();
    displayMessages();
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
    } else if (welcomeMessage && messageHistory.length === 0) {
        welcomeMessage.style.display = 'block';
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
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }
}

function saveMessageHistory() {
    try {
        if (ephemeralMode) {
            // Don't save history if ephemeral mode is enabled
            localStorage.removeItem('p2pChatMessages');
        } else {
            localStorage.setItem('p2pChatMessages', JSON.stringify(messageHistory));
        }
    } catch (e) {
        console.warn('Could not save message history:', e);
        // Clear old messages if storage is full
        if (e.name === 'QuotaExceededError') {
            messageHistory = messageHistory.slice(-50);
            if (!ephemeralMode) {
                localStorage.setItem('p2pChatMessages', JSON.stringify(messageHistory));
            }
        }
    }
}

function loadMessageHistory() {
    try {
        // Only load history if ephemeral mode is disabled
        if (!ephemeralMode) {
            const saved = localStorage.getItem('p2pChatMessages');
            if (saved) {
                messageHistory = JSON.parse(saved);
                console.log('📖 Loaded message history:', messageHistory.length, 'messages');
            }
        } else {
            messageHistory = [];
            console.log('📖 Ephemeral mode - no history loaded');
        }
    } catch (e) {
        console.warn('Could not load message history:', e);
        messageHistory = [];
    }
}

function switchPage(fromPage, toPage) {
    console.log('🔄 Switching page from:', fromPage.id, 'to:', toPage.id);
    
    fromPage.classList.remove('active');
    toPage.classList.add('active');
    
    // Add page transition animation
    toPage.style.animation = 'slideUp 0.6s ease-out';
    
    // Focus on input if switching to chat page
    if (toPage.id === 'chat-page') {
        console.log('🎯 Chat page activated');
    }
}

function showNotification(message, type = 'info') {
    console.log('📢 Notification:', type, message);
    
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
        case 'info':
            notificationIcon.className = 'notification-icon fas fa-info-circle';
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

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', init);

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
    });
}
