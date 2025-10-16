# 🌐 Ephemeral P2P Chat

A lightweight, browser-based **peer-to-peer chat** using WebRTC — with **no servers, no storage, and no trace**. Messages exist only in memory and vanish when the tab is closed.

---

## 🚀 Features

* 🔒 **100% Private** – No backend, no database, chat lives only in your browser.
* 🧠 **P2P via WebRTC** – Direct peer-to-peer connection using SDP exchange.
* 💬 **Real-Time Messaging** – Type and send instantly with a minimal UI.
* 📋 **Manual Offer/Answer Sharing** – Secure SDP copy & paste for handshake.
* 🗑️ **Ephemeral Messages** – Close the tab = everything is gone forever.
* 💻 **Responsive Interface** – Clean, modern chat layout with controls panel.

---

## 🛠 How It Works

1. **User A** clicks **Create Offer** → copies Local SDP.
2. **User B** pastes SDP → clicks **Create Answer** → returns new SDP.
3. **User A** pastes **Remote Answer** → Chat connects.
4. 🎉 Start chatting privately!

---

## 🏗 Tech Stack

| Technology      | Purpose          |
| --------------- | ---------------- |
| **WebRTC**      | P2P DataChannel  |
| **HTML/CSS/JS** | Frontend UI      |
| **No Servers**  | 100% Client-side |

---

## 🔐 Security by Design

| Aspect      | Behavior         |
| ----------- | ---------------- |
| Storage     | None (in-memory) |
| Server Logs | None             |
| Encryption  | WebRTC Built-in  |

---

## ⚙ Local Hosting (Optional)

```bash
# Use Python server
python -m http.server
```

Then open in browser:
`http://localhost:8000`

---

## 📌 Notes

❗ Works best over **HTTPS** or localhost
💡 Recommended to host via **GitHub Pages** for easy sharing

---

## 📜 License

MIT – Use, modify, and improve freely.
