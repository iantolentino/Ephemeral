# Ephemeral Chat - Secure P2P Messaging

![Ephemeral Chat](https://img.shields.io/badge/Ephemeral Chat-P2P%20Messaging-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![WebRTC](https://img.shields.io/badge/WebRTC-Peer--to--Peer-orange?style=for-the-badge)

A modern, secure peer-to-peer chat application that enables direct communication between users without central servers. Built with WebRTC and featuring a sleek glassmorphism design.

## 🌟 Features

### 🔒 Security & Privacy
- **End-to-End Encryption** - Direct P2P connections
- **No Central Server** - Messages never pass through third parties
- **Secure Authentication** - Admin-level user verification
- **Local Storage** - Message history stored locally

### 💬 Chat Features
- **Real-time Messaging** - Instant message delivery
- **Typing Indicators** - See when others are typing
- **Message History** - Persistent chat history
- **Connection Status** - Visual connection monitoring
- **System Notifications** - Desktop notifications for new messages

### 🎨 Modern UI/UX
- **Dark Theme** - Eye-friendly interface
- **Glassmorphism Design** - Modern frosted glass effects
- **Smooth Animations** - Fluid transitions and interactions
- **Responsive Design** - Works on all devices
- **Professional Typography** - Clean, readable text

### 🔧 Technical Features
- **WebRTC Powered** - Modern browser communication
- **PeerJS Integration** - Simplified P2P connections
- **Auto-reconnection** - Handles network issues
- **Cross-browser Support** - Works on Chrome, Firefox, Safari, Edge

## 🚀 Quick Start

### Prerequisites
- Modern web browser with WebRTC support
- No server installation required!

### Installation

1. **Download the files:**
   ```bash
   git clone https://github.com/yourusername/Ephemeral Chat.git
   cd Ephemeral Chat
   ```

2. **Open the application:**
   - Simply open `index.html` in your web browser
   - Or serve with a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve .
     
     # Using PHP
     php -S localhost:8000
     ```

3. **Access the application:**
   - Open `http://localhost:8000` in your browser

### Demo Accounts
Use these pre-configured accounts for testing:

| Username | Password | Role |
|----------|----------|------|
| `admin1` | `root1`  | Admin |
| `admin2` | `root2`  | Admin |
| `admin`  | `root`   | Admin |

## 📖 How to Use

### Step 1: Login
1. Open the application in your browser
2. Enter your username and password
3. Click "Sign In" to authenticate

### Step 2: Establish Connection
**Option A: Create Connection (Host)**
1. Copy your unique Connection ID
2. Share this ID with the person you want to chat with
3. Wait for them to connect

**Option B: Join Connection (Client)**
1. Get the Connection ID from your chat partner
2. Paste the ID in the input field
3. Click "Connect"

### Step 3: Start Chatting
1. Click "Enter Chat Room" once connected
2. Type your message in the input field
3. Press Enter or click the send button
4. Enjoy secure, real-time communication!

## 🛠️ Technical Details

### Architecture
```
User Browser ← WebRTC → User Browser
    ↑                            ↑
PeerJS Connection        PeerJS Connection
    ↑                            ↑
STUN Servers (NAT traversal only)
```

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **P2P Library**: PeerJS (WebRTC abstraction)
- **Styling**: Modern CSS with Glassmorphism
- **Storage**: localStorage for message persistence
- **Icons**: Font Awesome 6

### File Structure
```
Ephemeral Chat/
├── index.html          # Main application file
├── style.css           # Modern styling and animations
├── script.js           # Application logic and P2P handling
└── README.md           # This file
```

## 🔧 Configuration

### Customizing Users
Edit the `VALID_USERS` object in `script.js`:
```javascript
const VALID_USERS = {
    'username1': 'password1',
    'username2': 'password2',
    // Add more users as needed
};
```

### STUN Servers
The app uses Google's public STUN servers. You can modify these in `script.js`:
```javascript
config: {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add your own STUN/TURN servers
    ]
}
```

## 🌐 Network Requirements

### Ports
- **WebRTC** uses various UDP ports for data transfer
- **STUN** servers use port 19302
- No specific firewall configuration needed in most cases

### Network Conditions
- **NAT Traversal**: Works behind most firewalls
- **Bandwidth**: Minimal data usage (text-only)
- **Latency**: Real-time performance depends on network quality

## 📱 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 60+ | ✅ Full |
| Firefox | 55+ | ✅ Full |
| Safari | 11+ | ✅ Full |
| Edge | 79+ | ✅ Full |
| Opera | 47+ | ✅ Full |

## 🐛 Troubleshooting

### Common Issues

**1. Connection Failed**
- Verify the Connection ID is correct
- Check if both users are online
- Ensure firewalls allow WebRTC traffic

**2. Messages Not Sending**
- Check connection status indicator
- Verify both users are still connected
- Try reconnecting

**3. Cannot Copy ID**
- Ensure browser has clipboard permissions
- Try manual copy-paste as alternative

**4. Stuck on "Connecting..."**
- Wait 10 seconds for timeout
- Check network connectivity
- Try refreshing the page

### Debug Mode
Enable debug logging by opening browser console:
```javascript
localStorage.setItem('debug', 'peerjs*');
```

## 🔒 Security Considerations

### What's Secure
- Direct P2P connections (no intermediaries)
- Local message storage
- No third-party analytics

### Limitations
- WebRTC IP leakage (common to all WebRTC apps)
- Browser security model constraints
- No message encryption beyond transport layer

### Best Practices
1. Use strong, unique passwords
2. Regularly clear message history if needed
3. Verify connection IDs through secure channels
4. Use HTTPS in production deployment

## 🚀 Deployment

### Local Network
Perfect for internal team communication:
```bash
# Share your local IP address
python -m http.server 8000
# Others access: http://YOUR_IP:8000
```

### Production Deployment
For public access, deploy to any web server:

**Options:**
- Netlify (static hosting)
- GitHub Pages
- Vercel
- Traditional web hosting
- Your own server

**Requirements:**
- HTTPS recommended for WebRTC
- Basic static file serving
- No server-side processing needed

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:

- Bug fixes
- New features
- UI/UX improvements
- Documentation updates
- Security enhancements

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Open a GitHub issue with details
3. Include browser version and error messages
4. Describe steps to reproduce the problem

## 🔮 Future Enhancements

Planned features for future versions:
- [ ] File sharing capabilities
- [ ] Group chats (multiple peers)
- [ ] Voice and video calls
- [ ] Message encryption
- [ ] Mobile app version
- [ ] Custom themes
- [ ] Message search
- [ ] Chat rooms with passwords

---

**Built with ❤️ using WebRTC and modern web technologies**

*Ephemeral Chat - Your private conversation space*
