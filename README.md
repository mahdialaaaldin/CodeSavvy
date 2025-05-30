# **CodeSavvy Extension** <img src="Icons/ai-logo.gif" width="24" height="24" align="center" alt="Animated logo">

A developer-focused browser extension for real-time web page manipulation, debugging, and AI-powered text enhancements.

---

## **Features**

### **Core Tools**
- **Unlock Elements**: Remove `disabled` attributes and classes  
- **Remove Input Limits**: Delete `maxlength` restrictions  
- **Reveal Passwords**: Show hidden password fields  
- **Edit Mode**: Toggle `document.designMode` for content editing  
- **Change Fonts**: Apply 30+ fonts to page content  
- **Disable Loaders**: Hide loading indicators (Vanrise-specific)  
- **AI-Powered Text Enhancements**: Leverage Gemini API for text improvements  

### **Utilities**
- **Clear Cache**: One-click cache cleanup with auto-reload  
- **Screenshot**: Capture visible page area  
- **Fullscreen**: Enter fullscreen mode  

### **Text Actions** (Right-click menu)
Context menu with AI-powered and traditional text transformations:
- **AI Enhancements**:
  - **Improve Text**: Correct spelling and grammar  
  - **Enhance Professionally**: Rephrase for formal, professional tone  
  - **Add Humor**: Inject light-hearted jokes or puns  
  - **Advanced Improve Text**: Enhance clarity, fluency, and style  
  - **Prompt Engineer**: Create optimized AI prompts  
- **Text Transformations**:
  - **Case Conversions**: Sentence, lower, upper, capitalized, alternating, inverse, title, slugify  
  - **Highlight Text**: Apply yellow background (Beta)  

---

## **Preview**

Below is a preview of the CodeSavvy extension interface:

![image](https://github.com/user-attachments/assets/83c07683-213e-4646-9e9e-e9caae92e802)

---

## **Installation**

### 1. Clone the Repository
```bash
git clone https://github.com/mahdialaaaldin/CodeSavvy.git
```

### 2. Load the Extension
1. Open Chrome and navigate to `chrome://extensions/`  
2. Enable **Developer mode** (top-right corner)  
3. Click **Load unpacked** and select the project folder  

---

## **Usage**

### Popup Tools
- **Unlock Elements**: Enable editing of disabled elements  
- **Unlimited MaxLength**: Remove input character limits  
- **Toggle Design Mode**: Edit page content directly  
- **Take Screenshot**: Save visible tab as an image  
- **Make Page Full Screen**: Expand webpage to fullscreen  
- **Reveal Passwords**: Display password fields as text  
- **Change Font**: Choose from 30+ Google Fonts  
- **Clear Cache**: Clear cache and reload page  
- **AI Text Enhancements**: Require a valid Gemini API key  

### Context Menu Text Actions
1. Select text > Right-click > **Text Actions**  
2. Choose from:
   - **AI Enhancements**: Improve Text, Enhance Professionally, Add Humor, Advanced Improve Text, Prompt Engineer  
   - **Case Transformations**: Sentence, Lower, Upper, Capitalized, Alternating, Inverse, Title, Slugify  
   - **Highlight Text**: Apply yellow highlight (Beta)  

---

## **Options & API Setup**

Configure settings via the extension’s options page:

### 1. API Key Configuration
- Access settings via the ⚙️ icon  
- Enter your **Gemini API Key** for AI-powered text enhancements  
- Key is securely stored in `chrome.storage.local`  
- Obtain a key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Advanced Settings
- **Vanrise Mode**: Enable Vanrise-specific features (e.g., Disable Loaders)  
- **Inspirational Quote**: Toggle motivational quote in popup  
  - Default: Enabled  
  - Fallback: _"Make it work, make it right, make it fast."_  

### 3. Save Settings
- Click **Save Settings** to persist changes  

---

## **Keyboard Shortcuts**

| Shortcut          | Action                          |
|-------------------|---------------------------------|
| `Ctrl+Shift+E`    | Unlock elements                 |
| `Ctrl+Shift+Y`    | Toggle edit mode                |
| `Ctrl+Shift+L`    | Improve selected text (AI)      |
| `Ctrl+Shift+R`    | Clear cache and reload          |

### **Customize Shortcuts**
1. Go to `chrome://extensions/shortcuts`  
2. Locate **CodeSavvy** and edit key combinations  
3. Changes apply immediately  

**Note**: Shortcuts may conflict with browser defaults; customize as needed.

---

## **File Structure**

```
CodeSavvy/
├── popup.html        # Main interface
├── popup.js          # UI functionality
├── apiService.js     # Gemini API interactions
├── background.js     # Context menu and command handlers
├── coreFunctions.js  # Core logic
├── manifest.json     # Extension configuration
├── options.html      # Settings page
├── options.js        # Settings management
├── Icons/            # Visual assets
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── ...other icons
└── README.md         # Documentation
```

---

## **Permissions**

- `activeTab`: Modify current webpage  
- `scripting`: Inject content scripts  
- `storage`: Store API key and settings  
- `contextMenus`: Provide text action menu  
- `browsingData`: Enable cache clearing  
- `notifications`: Display status messages  

---

## **Technical Notes**
- **API Key Storage**: Secured in `chrome.storage.local`  
- **Theme Support**: Adapts to system dark/light mode  
- **Fallback Quote**: _"Make it work, make it right, make it fast."_  
- **Code Organization**: Core logic centralized in `coreFunctions.js`  

---

## **Contributing**
1. Fork the repository  
2. Create a feature branch (`feature/your-feature`)  
3. Submit a pull request  

---

## **License**

Copyright © 2025 mahdialaaaldin.  
All rights reserved.  
No part of this project may be used, copied, modified, or distributed without explicit written permission.

---

## **Third-Party Assets**

Icons sourced from FormWeb via Flaticon. Unauthorized use may result in legal action.

---

## **Contact**

For inquiries or feedback:  
**[mahdialaaaldin+codesavvy@gmail.com](mailto:mahdialaaaldin+codesavvy@gmail.com)**
