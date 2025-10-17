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

// DOM Elements
const loginPage = document.getElementById('login-page');
const connectionPage = document.getElementById('connection-page');
const chatPage = document.getElementById('chat-page');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const welcomeUserSpan = document.getElementById('welcome-user');
const myIdSpan = document.getElementById('my-id');
const copyIdBtn = document.getElementById('copy-id');
const peerIdInput = document.getElementById('peer-id');
const connectBtn = document.getElementById('connect-btn');
const statusSpan = document.getElementById('status');
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

// Initialize application
function init() {
    loadMessageHistory();
    setupEventListeners();
    checkExistingSession();
}

function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    copyIdBtn.addEventListener('click', copyMyId);
    connectBtn.addEventListener('click', connectToPeer);
    goToChatBtn.addEventListener('click', goToChat);
    logoutFromConnectBtn.addEventListener('click', handleLogout);
    disconnectBtn.addEventListener('click', disconnectFromPeer);
    logoutBtn.addEventListener('click', handleLogout);
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

function checkExistingSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser && VALID_USERS[savedUser]) {
        initializePeer(savedUser);
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (VALID_USERS[username] && VALID_USERS[username] === password) {
        initializePeer(username);
    } else {
        showLoginError('Invalid username or password');
    }
}

function initializePeer(username) {
    currentUser = username;
    
    // Initialize PeerJS
    peer = new Peer({
        debug: 3,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        }
    });

    peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        myPeerId = id;
        showConnectionPage();
    });

    peer.on('connection', (connection) => {
        console.log('Incoming connection from:', connection.peer);
        handleIncomingConnection(connection);
    });

    peer.on('error', (err) => {
        console.error('Peer error:', err);
        updateStatus('error', 'Connection error: ' + err.type);
    });

    // Save to localStorage
    localStorage.setItem('currentUser', username);
    hideLoginError();
}

function showConnectionPage() {
    welcomeUserSpan.textContent = currentUser;
    myIdSpan.textContent = myPeerId;
    updateStatus('disconnected', 'Disconnected');
    
    loginPage.classList.remove('active');
    connectionPage.classList.add('active');
    chatPage.classList.remove('active');
}

function copyMyId() {
    navigator.clipboard.writeText(myPeerId).then(() => {
        alert('Connection ID copied to clipboard!');
    });
}

function connectToPeer() {
    const peerId = peerIdInput.value.trim();
    if (!peerId) {
        alert('Please enter a connection ID');
        return;
    }

    updateStatus('connecting', 'Connecting...');
    
    conn = peer.connect(peerId, {
        reliable: true,
        metadata: {
            username: currentUser
        }
    });

    setupConnectionHandlers(conn);
}

function handleIncomingConnection(connection) {
    conn = connection;
    setupConnectionHandlers(conn);
}

function setupConnectionHandlers(connection) {
    connection.on('open', () => {
        console.log('Connected to:', connection.peer);
        updateStatus('connected', `Connected to ${connection.metadata.username}`);
        connectedPeerSpan.textContent = `Connected with: ${connection.metadata.username}`;
        goToChatBtn.disabled = false;
        
        // Send our username to the peer
        connection.send({
            type: 'user_info',
            username: currentUser
        });
    });

    connection.on('data', (data) => {
        console.log('Received data:', data);
        handleReceivedData(data);
    });

    connection.on('close', () => {
        console.log('Connection closed');
        updateStatus('disconnected', 'Disconnected');
        connectedPeerSpan.textContent = '';
        goToChatBtn.disabled = true;
        addSystemMessage('Connection lost');
    });

    connection.on('error', (err) => {
        console.error('Connection error:', err);
        updateStatus('error', 'Connection error');
    });
}

function handleReceivedData(data) {
    switch (data.type) {
        case 'message':
            addMessageToHistory({
                id: Date.now(),
                user: data.username,
                text: data.text,
                timestamp: new Date().toLocaleTimeString()
            });
            displayMessages();
            break;
            
        case 'user_info':
            // Store the peer's username
            if (connectedToSpan) {
                connectedToSpan.textContent = data.username;
            }
            break;
            
        case 'history_request':
            // Send message history when requested
            if (conn && conn.open) {
                conn.send({
                    type: 'history_sync',
                    history: messageHistory
                });
            }
            break;
            
        case 'history_sync':
            // Receive and merge message history
            if (data.history) {
                messageHistory = [...new Map([...messageHistory, ...data.history].map(msg => [msg.id, msg])).values()];
                messageHistory.sort((a, b) => a.id - b.id);
                saveMessageHistory();
                displayMessages();
            }
            break;
    }
}

function updateStatus(status, message) {
    statusSpan.textContent = message;
    statusSpan.className = status;
}

function goToChat() {
    if (!conn || !conn.open) {
        alert('Not connected to any peer');
        return;
    }

    // Request message history from peer
    conn.send({
        type: 'history_request'
    });

    currentUserSpan.textContent = `Logged in as: ${currentUser}`;
    
    connectionPage.classList.remove('active');
    chatPage.classList.add('active');
    
    displayMessages();
    
    // Add connection message
    addSystemMessage(`Connected to peer! Start chatting now.`);
}

function disconnectFromPeer() {
    if (conn) {
        conn.close();
        conn = null;
    }
    
    chatPage.classList.remove('active');
    connectionPage.classList.add('active');
    
    addSystemMessage('Disconnected from peer');
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
    
    localStorage.removeItem('currentUser');
    
    chatPage.classList.remove('active');
    connectionPage.classList.remove('active');
    loginPage.classList.add('active');
    
    // Clear inputs
    loginForm.reset();
    peerIdInput.value = '';
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !conn || !conn.open) {
        if (!conn || !conn.open) {
            alert('Not connected to any peer');
            return;
        }
        return;
    }

    const messageData = {
        id: Date.now(),
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
        timestamp: messageData.timestamp
    });

    // Clear input
    messageInput.value = '';
    
    // Auto-scroll to bottom
    scrollToBottom();
}

function addMessageToHistory(message) {
    messageHistory.push(message);
    if (messageHistory.length > 1000) {
        messageHistory = messageHistory.slice(-500); // Keep last 500 messages
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
    
    chatMessages.innerHTML = '';
    
    messageHistory.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.isSystem ? 'system' : msg.user === currentUser ? 'own' : 'other'}`;
        
        if (msg.isSystem) {
            messageDiv.style.cssText = `
                background: #ffeb3b;
                color: #333;
                text-align: center;
                max-width: 100%;
                font-style: italic;
                margin: 0.5rem 0;
            `;
            messageDiv.innerHTML = `<em>${msg.text} - ${msg.timestamp}</em>`;
        } else {
            messageDiv.innerHTML = `
                <div class="message-header">${msg.user} - ${msg.timestamp}</div>
                <div class="message-text">${msg.text}</div>
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
    localStorage.setItem('p2pChatMessages', JSON.stringify(messageHistory));
}

function loadMessageHistory() {
    const saved = localStorage.getItem('p2pChatMessages');
    if (saved) {
        messageHistory = JSON.parse(saved);
    }
}

function showLoginError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
}

function hideLoginError() {
    loginError.style.display = 'none';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);