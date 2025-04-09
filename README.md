# **CodeSavvy Extension** <img src="Icons/ai-logo.gif" width="24" height="24" align="center" alt="Animated logo">

A developer-focused browser extension for real-time web page manipulation with essential tools for debugging and design.

---

## **Features**

### **Core Tools**
- **Unlock Elements**: Remove `disabled` attributes and classes
- **Remove Input Limits**: Delete `maxlength` restrictions
- **Reveal Passwords**: Show hidden password fields
- **Edit Mode**: Toggle `document.designMode` for content editing
- **Change Fonts**: Apply 30+ fonts to page content
- **Disable Loaders**: Hide loading indicators (Vanrise-specific)
- **AI-Powered Text Improvement**: Correct spelling/grammar via Gemini API

### **Utilities**
- **Clear Cache**: One-click cache cleanup with auto-reload
- **Screenshot**: Capture visible page area
- **Fullscreen**: Enter fullscreen mode

### **Text Actions** (Right-click menu)
Context menu with text transformations for selected text:
- **Improve Text**: AI-powered grammar/spelling correction
- **Highlight Text**: Yellow background highlighting (currently in **Beta** and will undergo further improvements)
- **Case Conversions**: 8 different case styles
- **Slugify**: URL-friendly formatting

---
## **Preview**

Below is a preview of the CodeSavvy extension interface:

![image](https://github.com/user-attachments/assets/83c07683-213e-4646-9e9e-e9caae92e802)

---

## **Installation**

### 1. Clone the Repository
```bash
git clone https://github.com/vr-malaadin/CodeSavvy.git
```

### 2. Load the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** in the top-right corner
3. Click **Load unpacked** and select the project folder

---

## **Usage**

### Popup Tools:
- **Unlock Elements**: Makes disabled elements editable
- **Unlimited MaxLength**: Removes character limits in input fields
- **Toggle Design Mode**: Edit page content directly
- **Take Screenshot**: Captures and saves the visible part of the active tab as an image.
- **Make Page Full Screen**: Expands the active tab's webpage to full screen mode.
- **Reveal Passwords**: Converts password fields to text for easy viewing.
- **Change Font**: 30+ font options with Google Fonts integration
- **Clear Cache**: Instant cache cleanup + reload
- **AI Text Correction**: Requires valid Gemini API key

### Context Menu Text Actions:
1. Select text > Right-click > **Text Actions**
2. Choose from:
   - Case transformations (Sentence, Lower, Upper, etc)
   - Highlight selected text
   - AI-powered text improvement
   - Slug generation for URLs

### API Setup:
1. Click extension ⚙️ icon > Settings
2. Enter [Gemini API key](https://aistudio.google.com/app/apikey)
3. Click Save - key stored locally in browser storage

---

## **File Structure**

```
CodeSavvy/
├── popup.html        # Main interface
├── popup.js          # UI functionality
├── apiService.js     # Gemini API interactions
├── background.js     # Context menu handlers
├── manifest.json     # Extension configuration
├── options.html      # Settings page
├── options.js        # API key management
├── Icons/            # Visual assets
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── ...other icons
└── README.md         # Documentation
```

---

## **Permissions**

Required Chrome permissions:
- `activeTab`: Modify current webpage
- `scripting`: Inject content scripts
- `storage`: Save API key/configurations
- `contextMenus`: Create text action menu
- `browsingData`: Clear cache functionality
- `notifications`: Show status messages

---

## **Technical Notes**
- API key stored locally using chrome.storage.local
- Fallback quote used when API unavailable: "Make it work, make it right, make it fast."
- Dark/light mode support based on system preference

---

## **Contributing**
Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`feature/your-feature`)
3. Submit pull request

---

## License  
Copyright © 2025 vr-malaadin | mahdialaaaldin (Mahdi). All rights reserved.

This project, including all source code, designs, and functionality, is the intellectual property of the author. You may not use, copy, modify, distribute, or reproduce any part of this project without explicit written permission.

Use of this software or its components for commercial, educational, or personal purposes is not permitted without prior authorization.

## Third-Party Assets  
Some icons or visual elements used in this project are sourced from FormWeb, particularly from the Flaticon website.

Unauthorized use or duplication may result in legal action.

## Contact  
For inquiries or feedback, contact me via email: **[mahdialaaaldin+codesavvy@gmail.com](mailto:mahdialaaaldin+codesavvy@gmail.com)**
