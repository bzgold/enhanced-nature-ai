# Nature AI Frontend 🌳

A beautiful, nature-themed AI chatbot frontend built with vanilla HTML, CSS, and JavaScript. This frontend connects to your FastAPI backend to provide an engaging chat experience with OpenAI's AI models.

## ✨ Features

- **🌿 Beautiful Nature Theme**: Forest greens, tree motifs, and floating leaf animations
- **💬 Real-time Chat**: Streaming responses from OpenAI API
- **⚙️ Easy Configuration**: Simple settings panel for API key and model selection
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🎨 Smooth Animations**: Elegant transitions and hover effects
- **🔒 Secure**: API keys stored locally in browser storage
- **🎯 User-Friendly**: Intuitive interface with helpful notifications

## 🚀 Quick Start

1. **Open the frontend**: Navigate to the `frontend` folder and open `index.html` in your browser
2. **Configure API Key**: Click the settings gear icon (⚙️) and enter your OpenAI API key
3. **Start Chatting**: Type your message and press Enter or click the send button
4. **Enjoy Nature AI**: Experience the beautiful, nature-inspired chat interface

## 🏗️ Architecture

### Files Structure
```
frontend/
├── index.html          # Main HTML structure
├── styles.css          # Nature-themed CSS styling
├── script.js           # Chat functionality and API integration
└── README.md           # This file
```

### Key Components

- **Header**: Beautiful gradient header with floating leaf animations
- **Chat Interface**: Clean message display with user/bot avatars
- **Input Area**: Auto-resizing textarea with send button
- **Settings Panel**: Slide-out configuration panel
- **Loading States**: Elegant loading indicators and animations

## 🎨 Design Features

### Color Palette
- **Forest Green**: `#2d5a27` - Primary brand color
- **Sage Green**: `#87a96b` - Secondary accents
- **Mint Green**: `#d4e6c5` - Light backgrounds and borders
- **Cream**: `#f8f6f0` - Page background
- **Leaf Green**: `#4caf50` - Interactive elements

### Typography
- **Font Family**: Inter (Google Fonts) - Clean, modern, readable
- **Hierarchy**: Clear visual hierarchy with consistent spacing
- **Accessibility**: High contrast ratios and focus indicators

### Animations
- **Floating Leaves**: Subtle leaf animations in the header
- **Message Transitions**: Smooth slide-in animations for new messages
- **Hover Effects**: Interactive feedback on buttons and elements
- **Loading States**: Animated dots and smooth transitions

## 🔧 Configuration

### API Settings
- **OpenAI API Key**: Your personal API key for authentication
- **Model Selection**: Choose from GPT-4.1 Mini, GPT-4, or GPT-3.5 Turbo
- **System Context**: Customize the AI's personality and behavior

### Local Storage
All settings are automatically saved to your browser's local storage:
- API key (encrypted)
- Selected model
- Custom system message
- Chat preferences

## 🌐 Deployment

### Local Development
1. Start your FastAPI backend: `uvicorn app:app --reload`
2. Open `frontend/index.html` in your browser
3. The frontend will automatically connect to `http://localhost:8000`

### Vercel Deployment
1. Deploy your backend to Vercel
2. Upload the frontend files to your Vercel project
3. The frontend will automatically use relative API paths

### Environment Detection
The frontend automatically detects your environment:
- **Localhost**: Connects to `http://localhost:8000/api/chat`
- **Production**: Uses relative path `/api/chat`

## 🎯 User Experience

### First-Time Users
- Welcome message with setup instructions
- Automatic settings panel opening
- Helpful notifications and guidance

### Chat Experience
- Real-time streaming responses
- Message history preservation
- Auto-scroll to latest messages
- Loading states and error handling

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast design
- Focus indicators for all interactive elements

## 🛠️ Customization

### Themes
The nature theme can be easily customized by modifying CSS variables in `styles.css`:

```css
:root {
    --forest-green: #2d5a27;
    --sage-green: #87a96b;
    --light-green: #a8c09a;
    /* Add more custom colors */
}
```

### Animations
Customize animations by modifying keyframes and timing:

```css
@keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
}
```

### System Messages
Customize the AI's personality by editing the default system message in `script.js`.

## 🔍 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify your OpenAI API key is correct
   - Check if you have sufficient API credits
   - Ensure the backend is running and accessible

2. **Messages Not Sending**
   - Check browser console for errors
   - Verify backend URL configuration
   - Ensure CORS is properly configured

3. **Styling Issues**
   - Clear browser cache
   - Check if CSS files are loading
   - Verify file paths are correct

### Debug Mode
Open browser console and access the global `natureAI` object for debugging:
```javascript
console.log(window.natureAI.settings);
console.log(window.natureAI.apiUrl);
```

## 🌟 Future Enhancements

- **Seasonal Themes**: Automatic theme changes based on seasons
- **Nature Sounds**: Ambient forest sounds for enhanced experience
- **Voice Input**: Speech-to-text capabilities
- **File Sharing**: Image and document sharing
- **Chat History**: Persistent chat history across sessions
- **Multi-language**: Internationalization support

## 📱 Browser Support

- **Chrome**: 80+ ✅
- **Firefox**: 75+ ✅
- **Safari**: 13+ ✅
- **Edge**: 80+ ✅
- **Mobile Browsers**: Full support ✅

## 🤝 Contributing

Feel free to contribute to improve the Nature AI frontend:
- Report bugs and issues
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is part of The AI Engineer Challenge. Use responsibly and enjoy connecting with nature through AI! 🌿

---

**Made with 🌳 by Nature AI Team**