importScripts('coreFunctions.js');
chrome.contextMenus.create({
    id: "textActions",
    title: "Text Actions",
    contexts: ["selection"],
});

// Define all menu options (AI enhancements and other text actions)
const menuOptions = [
    { id: "improveText", title: "Improve Text" },
    { id: "enhanceProfessionally", title: "Enhance Professionally" },
    { id: "addHumor", title: "Add Humor" },
    { id: "sarcasticMode", title: "Sarcastic Mode" },
    { id: "promptEngineer", title: "Prompt Engineer" },
    { id: "advancedImproveText", title: "Advanced Improve Text" },
    { id: "separator_ai_tools", type: "separator" },
    { id: "sentenceCase", title: "Sentence case" },
    { id: "lowerCase", title: "lower case" },
    { id: "upperCase", title: "UPPER CASE" },
    { id: "capitalizedCase", title: "Capitalized Case" },
    { id: "alternatingCase", title: "altErNaTiNg CASE" },
    { id: "inverseCase", title: "InVeRsE CaSe" },
    { id: "titleCase", title: "Title Case" },
    { id: "slugify", title: "Slugify" },
    { id: "separator_text_transform", type: "separator" },
    { id: "convertArabicToEnglish", title: "Convert Arabic to English (Beta)" },
    { id: "convertEnglishToArabic", title: "Convert English to Arabic (Beta)" },
    { id: "highlightText", title: "Highlight Text (Beta)" }
];

// Create all menu items under "Text Actions"
menuOptions.forEach((action) => {
    const menuItem = {
        id: action.id,
        parentId: "textActions",
        contexts: ["selection"]
    };

    if (action.type === "separator") {
        menuItem.type = "separator";
    } else {
        menuItem.title = action.title;
    }

    chrome.contextMenus.create(menuItem);
});

// Helper function to get selected API provider
async function getSelectedApiProvider() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['apiProvider'], (result) => {
            resolve(result.apiProvider || 'gemini');
        });
    });
}

// Fetch API key from storage
async function getGeminiApiKey() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['geminiApiKey'], (result) => {
            resolve(result.geminiApiKey || null);
        });
    });
}

// AI text enhancement function with dual API support and automatic fallback
async function enhanceTextWithAI(primaryApiProvider, geminiApiKey, prompt) {
    // Helper function to get enhanced text from Gemini
    async function getEnhancedTextFromGemini(apiKey, prompt) {
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7 }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const enhancedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!enhancedText) {
            throw new Error("No enhanced text received from Gemini");
        }

        return enhancedText;
    }

    // Helper function to get enhanced text from Pollinations
    async function getEnhancedTextFromPollinations(prompt) {
        prompt += `Note that this prompt is sent to you at ${new Date().toLocaleString()}`;
        const apiUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Pollinations API error (${response.status})`);
        }

        const enhancedText = await response.text();

        if (!enhancedText || enhancedText.trim() === '') {
            throw new Error("Empty response from Pollinations");
        }

        return enhancedText;
    }
    const activeEl = document.activeElement;
    const selection = window.getSelection();

    // Get the text to enhance
    let textToEnhance;

    if ((activeEl.tagName === "TEXTAREA" ||
        (activeEl.tagName === "INPUT" && activeEl.type === "text")) &&
        typeof activeEl.selectionStart === "number") {

        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;
        textToEnhance = activeEl.value.substring(start, end);
    } else if (selection.rangeCount) {
        const range = selection.getRangeAt(0);
        const fragment = range.cloneContents();
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(fragment);

        const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
        textToEnhance = '';
        let node;
        while (node = walker.nextNode()) {
            textToEnhance += node.textContent;
        }
    }

    if (!textToEnhance.trim()) return;

    let enhancedText;
    let usedProvider = primaryApiProvider;
    let errorMessage = '';

    try {
        // Try primary provider first
        if (primaryApiProvider === 'gemini') {
            if (!geminiApiKey) {
                throw new Error("Gemini API key is missing");
            }

            try {
                enhancedText = await getEnhancedTextFromGemini(geminiApiKey, prompt);
                console.log(`Successfully used Gemini API`);
            } catch (geminiError) {
                console.warn(`Gemini API failed, falling back to Pollinations: ${geminiError.message}`);
                // Fall back to Pollinations
                enhancedText = await getEnhancedTextFromPollinations(prompt);
                usedProvider = 'pollinations (fallback)';
                errorMessage = `Gemini failed: ${geminiError.message}. Using Pollinations instead.`;
            }
        } else {
            // Primary provider is Pollinations
            try {
                enhancedText = await getEnhancedTextFromPollinations(prompt);
                console.log(`Successfully used Pollinations API`);
            } catch (pollinationsError) {
                console.warn(`Pollinations API failed, falling back to Gemini: ${pollinationsError.message}`);
                // Fall back to Gemini if we have a key
                if (geminiApiKey) {
                    try {
                        enhancedText = await getEnhancedTextFromGemini(geminiApiKey, prompt);
                        usedProvider = 'gemini (fallback)';
                        errorMessage = `Pollinations failed: ${pollinationsError.message}. Using Gemini instead.`;
                    } catch (geminiError) {
                        // Both failed
                        throw new Error(`Both APIs failed: Pollinations - ${pollinationsError.message}, Gemini - ${geminiError.message}`);
                    }
                } else {
                    // No Gemini key, can't fall back
                    throw pollinationsError;
                }
            }
        }

        function unescapeText(str) {
            return str.replace(/\\([nrtbf"'\\])/g, (match, character) => {
                switch (character) {
                    case 'n': return "\n"; // New Line
                    case 'r': return "\r"; // Carriage Return
                    case 't': return "\t"; // Tab
                    case 'b': return "\b"; // Backspace
                    case 'f': return "\f"; // Form Feed
                    case '"': return "\""; // Double Quote
                    case "'": return "'";  // Single Quote
                    case '\\': return "\\"; // Backslash
                    default: return match;
                }
            });
        }

        enhancedText = unescapeText(enhancedText).trim();

        // Insert the enhanced text
        if (activeEl.tagName === "TEXTAREA" || activeEl.tagName === "INPUT") {
            const start = activeEl.selectionStart;
            const end = activeEl.selectionEnd;

            // setRangeText handles real newline characters correctly
            activeEl.setRangeText(enhancedText, start, end, "end");

            // Trigger an input event so frameworks (like React/Angular) or validation know the value changed
            activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (selection.rangeCount) {
            const range = selection.getRangeAt(0);
            // For non-inputs, textNode will hold the formatting, but CSS (white-space: pre-wrap) determines if it renders visibly
            const enhancedNode = document.createTextNode(enhancedText);
            range.deleteContents();
            range.insertNode(enhancedNode);
            selection.removeAllRanges();
        }

        // Show notification if we used fallback
        if (errorMessage && usedProvider.includes('fallback')) {
            // We'll send a message to the background script to show a notification
            chrome.runtime.sendMessage({
                action: 'showFallbackNotification',
                message: `Text enhanced using ${usedProvider}. ${errorMessage}`
            });
        }

    } catch (error) {
        console.error(`All AI providers failed:`, error);
        console.log(`Failed to enhance text: ${error.message}`);
    }
}


// Highlight selected text function
function highlightSelectedText() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = 'yellow';
    span.style.color = 'black';

    try {
        range.surroundContents(span);
    } catch (e) {
        console.error('Could not highlight text:', e);
    }
}

// Case conversion function
function convertCase(caseType) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(fragment);

    // Process all text nodes within the selection
    const walker = document.createTreeWalker(
        tempDiv,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    while (node = walker.nextNode()) {
        let text = node.textContent;
        let convertedText = '';

        switch (caseType) {
            case 'sentenceCase':
                convertedText = text.toLowerCase();
                convertedText = convertedText.charAt(0).toUpperCase() + convertedText.slice(1);
                break;

            case 'lowerCase':
                convertedText = text.toLowerCase();
                break;

            case 'upperCase':
                convertedText = text.toUpperCase();
                break;

            case 'capitalizedCase':
                convertedText = text.toLowerCase().split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                break;

            case 'alternatingCase':
                convertedText = text.split('')
                    .map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase())
                    .join('');
                break;

            case 'inverseCase':
                convertedText = text.split('')
                    .map(char => {
                        if (char === char.toUpperCase()) return char.toLowerCase();
                        return char.toUpperCase();
                    })
                    .join('');
                break;

            case 'titleCase':
                convertedText = text.toLowerCase().split(' ')
                    .map((word, index) => {
                        // Don't capitalize certain small words unless they're the first word
                        const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'];
                        if (index > 0 && smallWords.includes(word)) return word;
                        return word.charAt(0).toUpperCase() + word.slice(1);
                    })
                    .join(' ');
                break;

            case 'slugify':
                convertedText = text.toLowerCase()
                    .replace(/[^\w\s-]/g, '') // Remove special characters
                    .replace(/\s+/g, '-')     // Replace spaces with hyphens
                    .replace(/-+/g, '-');     // Remove consecutive hyphens
                break;
        }

        node.textContent = convertedText;
    }

    // Replace the selected content with the modified content
    range.deleteContents();
    range.insertNode(tempDiv);

    // Remove the temporary div but keep its contents
    const parent = tempDiv.parentNode;
    while (tempDiv.firstChild) {
        parent.insertBefore(tempDiv.firstChild, tempDiv);
    }
    parent.removeChild(tempDiv);
}

function convertKeyboardLayoutInSelection(direction, selectedText) {
    // Define keyboard layout conversion maps
    const englishToArabicMap = { '`': 'ذ', 'q': 'ض', 'w': 'ص', 'e': 'ث', 'r': 'ق', 't': 'ف', 'y': 'غ', 'u': 'ع', 'i': 'ه', 'o': 'خ', 'p': 'ح', '[': 'ج', ']': 'د', 'a': 'ش', 's': 'س', 'd': 'ي', 'f': 'ب', 'g': 'ل', 'h': 'ا', 'j': 'ت', 'k': 'ن', 'l': 'م', ';': 'ك', "'": 'ط', 'z': 'ئ', 'x': 'ء', 'c': 'ؤ', 'v': 'ر', 'b': 'لا', 'n': 'ى', 'm': 'ة', ',': 'و', '.': 'ز', '/': 'ظ' };
    const arabicToEnglishMap = { 'ذ': '`', 'ض': 'q', 'ص': 'w', 'ث': 'e', 'ق': 'r', 'ف': 't', 'غ': 'y', 'ع': 'u', 'ه': 'i', 'خ': 'o', 'ح': 'p', 'ج': '[', 'د': ']', 'ش': 'a', 'س': 's', 'ي': 'd', 'ب': 'f', 'ل': 'g', 'ا': 'h', 'ت': 'j', 'ن': 'k', 'م': 'l', 'ك': ';', 'ط': "'", 'ئ': 'z', 'ء': 'x', 'ؤ': 'c', 'ر': 'v', 'لا': 'b', 'ى': 'n', 'ة': 'm', 'و': ',', 'ز': '.', 'ظ': '/' };

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(fragment);

    // Process all text nodes within the selection
    const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
    let fullText = '';
    while (walker.nextNode()) {
        fullText += walker.currentNode.textContent;
    }

    if (!fullText.trim()) return;

    // Convert the text
    const convertedText = convertKeyboardLayout(fullText, direction);

    // Handle input/textarea elements
    const activeEl = document.activeElement;
    if (
        (activeEl.tagName === "TEXTAREA" ||
            (activeEl.tagName === "INPUT" && activeEl.type === "text")) &&
        typeof activeEl.selectionStart === "number"
    ) {
        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;
        activeEl.setRangeText(convertedText, start, end, "end");
        return;
    }

    // Handle regular DOM content
    const convertedNode = document.createTextNode(convertedText);
    console.log(selection);
    console.log(convertedText);
    range.deleteContents();
    range.insertNode(convertedNode);
    selection.removeAllRanges();

    // Send notification
    chrome.runtime.sendMessage({
        action: 'showNotification',
        message: `Text converted to ${direction === 'arabic-to-english' ? 'English' : 'Arabic'} layout`
    });

    function convertKeyboardLayout(text, direction) {
        const map = direction === 'arabic-to-english' ? arabicToEnglishMap : englishToArabicMap;
        let output = '';
        for (let char of text) {
            output += map[char] || char;
        }
        return output;
    }
}

// Listen for clicks on the context menu items
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "highlightText") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: highlightSelectedText,
        });
    } else if (["improveText", "enhanceProfessionally", "addHumor", "sarcasticMode", "advancedImproveText", "promptEngineer"].includes(info.menuItemId)) {
        const apiProvider = await getSelectedApiProvider();
        const geminiApiKey = apiProvider === 'gemini' ? await getGeminiApiKey() : await getGeminiApiKey(); // Always try to get it for fallback

        // Check API key only for Gemini as primary
        if (apiProvider === 'gemini' && !geminiApiKey) {
            console.error("Gemini API key is missing.");
            // Show notification to user
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'Icons/icon48.png',
                title: 'CodeSavvy - API Key Required',
                message: 'Please set your Gemini API key in the extension settings to use Gemini AI features.'
            });
            return;
        }

        let prompt;
        switch (info.menuItemId) {
            case "improveText":
                prompt = `Correct the spelling and grammar of the following text. Return plain text without any formatting or additional content. Text: "${info.selectionText}"`;
                break;
            case "enhanceProfessionally":
                prompt = `Rephrase the following text to sound more professional and formal. Return plain text without any formatting. Text: "${info.selectionText}"`;
                break;
            case "addHumor":
                prompt = `Rewrite the following text to be hilariously funny and witty, incorporating clever wordplay, absurd twists, and light-hearted humor while preserving the original meaning. Keep it playful and family-friendly. Return only the funny version as plain text, with no additional formatting or comments. Text: "${info.selectionText}"`;
                break;
            case "sarcasticMode":
                prompt = `Rewrite the following text to be extremely rude and offensive, incorporating profanity, bad words, and aggressive insults liberally while preserving the original meaning. Make it as insulting and crude as possible. Return only the rude version as plain text, with no additional formatting or comments. Text: "${info.selectionText}"`;
                break;
            case "advancedImproveText":
                prompt = `Act as a professional English editor. Improve the following text by correcting spelling, grammar, and punctuation, and enhancing clarity, flow, and readability. Do not add comments or explanations. Return only the edited text as plain text. Text: "${info.selectionText}"`;
                break;
            case "promptEngineer":
                prompt = `You are an expert prompt creator. Your task is to craft an optimized prompt based on the user-provided input for use with ChatGPT, GPT-3, or GPT-4. The output prompt should:
                    - Be clear, concise, and specific.
                    - Include instructions to match the user's communication style.
                    - Be written from the user's perspective, requesting assistance from an AI.
                    - Avoid ambiguity and ensure actionable instructions.
                    Input text: "${info.selectionText}"
                    Return only the optimized prompt as plain text.`;
                break;
        }

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: enhanceTextWithAI,
            args: [apiProvider, geminiApiKey, prompt],
        });
    } else if (["convertArabicToEnglish", "convertEnglishToArabic"].includes(info.menuItemId)) {
        const direction = info.menuItemId === "convertArabicToEnglish" ? "arabic-to-english" : "english-to-arabic";
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: convertKeyboardLayoutInSelection,
            args: [direction, info.selectionText],
        });
    } else {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: convertCase,
            args: [info.menuItemId],
        });
    }
});

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    switch (command) {
        case 'unlock-elements':
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: CoreTools.unlockElements
            });
            break;

        case 'toggle-design-mode':
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: CoreTools.toggleDesignMode
            });
            break;

        case 'improve-text':
            const apiProvider = await getSelectedApiProvider();
            const geminiApiKey = await getGeminiApiKey(); // Always try to get it for fallback

            // Check API key only for Gemini as primary
            if (apiProvider === 'gemini' && !geminiApiKey) {
                console.error("Gemini API key missing");
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'Icons/icon48.png',
                    title: 'CodeSavvy - API Key Required',
                    message: 'Please set your Gemini API key in the extension settings to use Gemini AI features.'
                });
                return;
            }

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const selection = window.getSelection();
                    if (!selection.rangeCount) return;
                    const text = selection.toString();
                    if (!text.trim()) return;
                    return text;
                }
            }).then(async (results) => {
                const selectedText = results[0].result;
                if (selectedText) {
                    const prompt = `Correct the spelling and grammar of the following text. Return plain text without any formatting or additional content. Text: "${selectedText}"`;

                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: enhanceTextWithAI,
                        args: [apiProvider, geminiApiKey, prompt]
                    });
                }
            }).catch((error) => {
                console.error("Error getting selected text:", error);
            });
            break;

        case 'clear-cache':
            await chrome.browsingData.remove({ since: 0 }, { cache: true });
            chrome.tabs.reload(tab.id);
            break;
    }
});

// Handle notification messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showNotification') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'Icons/icon48.png',
            title: 'CodeSavvy',
            message: request.message
        });
    } else if (request.action === 'showFallbackNotification') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'Icons/icon48.png',
            title: 'CodeSavvy - API Fallback',
            message: request.message
        });
    }
});