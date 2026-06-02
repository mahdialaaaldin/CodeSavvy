// Helper function to execute scripts in active tab
async function executeInTab(func, ...args) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    try {
        const result = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func,
            args
        });
        return result[0].result;
    } catch (error) {
        console.error('Extension error:', error);
        //showNotification(`Error: ${error.message}`);
    }
}

// Show notification in the extension
function showNotification(message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'Icons/icon48.png',
        title: 'CodeSavvy',
        message
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    // Add settings gear icon (Modern SVG)
    const settingsBtn = document.createElement('div');
    settingsBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
    `;
    
    // Style the settings button to match the modern theme
    Object.assign(settingsBtn.style, {
        position: 'absolute',
        top: '20px',
        right: '20px',
        cursor: 'pointer',
        color: 'var(--text-light)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '10'
    });
    
    settingsBtn.title = 'Settings';
    
    // Add hover effects for interactivity
    settingsBtn.addEventListener('mouseenter', () => {
        settingsBtn.style.color = 'var(--primary)';
        settingsBtn.style.transform = 'rotate(45deg) scale(1.1)';
    });
    settingsBtn.addEventListener('mouseleave', () => {
        settingsBtn.style.color = 'var(--text-light)';
        settingsBtn.style.transform = 'rotate(0deg) scale(1)';
    });

    settingsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
    document.body.appendChild(settingsBtn);

    // Check quote setting
    const showQuote = await new Promise(resolve => {
        chrome.storage.local.get(['showQuote'], (result) => {
            resolve(result.showQuote !== undefined ? result.showQuote : true);
        });
    });

    // Handle quote display based on setting
    const quoteElement = document.getElementById("quote");
    const quoteSection = document.querySelector('.section.quote');
    if (showQuote) {
        quoteSection.style.display = "block";
        getQuote()
            .then(quote => {
                quoteElement.innerText = `${quote}`;
            })
            .catch(error => {
                console.error("Error fetching quote:", error);
                quoteElement.innerText = `"Make it work, make it right, make it fast"`;
            });
    } else {
        quoteSection.style.display = "none";
    }

    // Update when settings change
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.showQuote) {
            if (changes.showQuote.newValue) {
                quoteSection.style.display = "block";
                getQuote()
                    .then(quote => {
                        quoteElement.innerText = `${quote}`;
                    })
                    .catch(error => {
                        console.error("Error fetching quote:", error);
                        quoteElement.innerText = `"Make it work, make it right, make it fast"`;
                        quoteSection.style.display = "block";
                    });
            } else {
                quoteSection.style.display = "none";
            }
        }
    });

    // Initialize design mode button state
    const isDesignModeOn = await executeInTab(() => document.designMode === 'on');
    document.getElementById('designModeToggle').classList.toggle('active', isDesignModeOn);

    // Core functionality handlers
    document.getElementById('unlockElements').addEventListener('click', async () => {
        await executeInTab(CoreTools.unlockElements);
    });

    document.getElementById('unlimitedMaxLengthButton').addEventListener('click', async () => {
        await executeInTab(() => {
            document.querySelectorAll('[maxlength]').forEach(el => el.removeAttribute('maxlength'));
        });
    });

    document.getElementById('designModeToggle').addEventListener('click', async () => {
        const newState = await executeInTab(CoreTools.toggleDesignMode);
        const toggleBtn = document.getElementById('designModeToggle');
        toggleBtn.classList.toggle('active', newState);
        toggleBtn.title = `Design mode ${newState ? 'ON' : 'OFF'}`;
    });

    document.getElementById('clearCacheButton').addEventListener('click', () => {
        chrome.browsingData.remove({
            "since": 0 // Clear all cache
        }, {
            "cache": true
        }, () => {
            console.log("Cache cleared");

            // Reload the current tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.reload(tabs[0].id);
            });
            setTimeout(() => window.close(), 500);
        });
    });

    // Font changer modal
    const fontModal = document.getElementById('fontModal');
    document.getElementById('changeFont').addEventListener('click', () => fontModal.style.display = 'flex');
    document.getElementById('closeModal').addEventListener('click', () => fontModal.style.display = 'none');

    document.getElementById('applyFont').addEventListener('click', () => {
        const fontSelector = document.getElementById('fontSelector');
        const selectedFont = fontSelector.value;
        const systemFonts = [
            "Comic Sans MS", "Tahoma", "Trebuchet MS", "Lucida Sans Unicode",
            "Lucida Grande", "Palatino", "Impact", "Wingdings", "Arial Black",
            "Consolas", "Segoe UI", "Helvetica", "Helvetica Neue", "Times"
        ];

        const googleFontsUrl = {
            'Poppins': "https://fonts.googleapis.com/css2?family=Poppins&display=swap",
            'Lexend Deca': "https://fonts.googleapis.com/css2?family=Lexend+Deca&display=swap",
            'EB Garamond': "https://fonts.googleapis.com/css2?family=EB+Garamond&display=swap",
            'STIX Two Text': "https://fonts.googleapis.com/css2?family=STIX+Two+Text&display=swap",
            'Andika': "https://fonts.googleapis.com/css2?family=Andika&display=swap",
            'Atkinson Hyperlegible': "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible&display=swap",
            'Roboto': "https://fonts.googleapis.com/css2?family=Roboto&display=swap",
            'Lato': "https://fonts.googleapis.com/css2?family=Lato&display=swap",
            'Open Sans': "https://fonts.googleapis.com/css2?family=Open+Sans&display=swap",
            'Oswald': "https://fonts.googleapis.com/css2?family=Oswald&display=swap",
            'Montserrat': "https://fonts.googleapis.com/css2?family=Montserrat&display=swap",
            'Merriweather': "https://fonts.googleapis.com/css2?family=Merriweather&display=swap",
            'Raleway': "https://fonts.googleapis.com/css2?family=Raleway&display=swap",
            'Lora': "https://fonts.googleapis.com/css2?family=Lora&display=swap",
            'Playfair Display': "https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap",
            'Ubuntu': "https://fonts.googleapis.com/css2?family=Ubuntu&display=swap"
        };

        if (systemFonts.includes(selectedFont)) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: (font) => {
                        document.querySelectorAll('*:not(code):not(pre):not([class*="code"])').forEach(element => {
                            element.style.fontFamily = font;
                        });
                    },
                    args: [selectedFont]
                });
            });
        } else {
            // If the font is a Google Font, load it and apply it
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: (font, fontUrl) => {
                        let link = document.querySelector(`link[href="${fontUrl}"]`);
                        if (!link) {
                            // Create a link tag for the font if not already loaded
                            link = document.createElement('link');
                            link.rel = 'stylesheet';
                            link.href = fontUrl;
                            document.head.appendChild(link);
                        }

                        // Apply the font to all elements except code sections
                        document.querySelectorAll('*:not(code):not(pre):not([class*="code"])').forEach(element => {
                            element.style.fontFamily = font;
                        });
                    },
                    args: [selectedFont, googleFontsUrl[selectedFont]]
                });
                fontModal.style.display = 'none';
            });
        }
    });

    // Utility handlers
    const buttonActions = {
        screenshotButton: async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const dataUrl = await chrome.tabs.captureVisibleTab();
            chrome.downloads.download({
                url: dataUrl,
                filename: `${tab.title.replace(/[^a-z0-9]/gi, '_')}_screenshot.png`
            });
        },
        fullscreenButton: () => executeInTab(() => document.documentElement.requestFullscreen()),
        revealPasswords: () => executeInTab(() => {
            document.querySelectorAll('input[type="password"]').forEach(input => input.type = 'text');
        })
    };

    Object.entries(buttonActions).forEach(([id, action]) => {
        document.getElementById(id)?.addEventListener('click', action);
    });
});

// Handle tab updates
chrome.tabs.onActivated.addListener(updateDesignModeState);
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') updateDesignModeState();
});

async function updateDesignModeState() {
    const isDesignModeOn = await executeInTab(() => document.designMode === 'on');
    document.getElementById('designModeToggle')?.classList.toggle('active', isDesignModeOn);
}