chrome.contextMenus.create({
    id: "textActions",
    title: "Text Actions",
    contexts: ["selection"],
});

const actions = [
    { id: "improveText", title: "Improve Text" },
    { id: "sentenceCase", title: "Sentence case" },
    { id: "lowerCase", title: "lower case" },
    { id: "upperCase", title: "UPPER CASE" },
    { id: "capitalizedCase", title: "Capitalized Case" },
    { id: "alternatingCase", title: "altErNaTiNg CASE" },
    { id: "inverseCase", title: "InVeRsE CaSe" },
    { id: "titleCase", title: "Title Case" },
    { id: "slugify", title: "Slugify" },
    { id: "highlightText", title: "Highlight Text (Beta)" }
];

actions.forEach((action) => {
    chrome.contextMenus.create({
        id: action.id,
        parentId: "textActions",
        title: action.title,
        contexts: ["selection"],
    });
});

// Listen for clicks on the context menu items
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "highlightText") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: highlightSelectedText,
        });
    } else if (info.menuItemId === "improveText") {
        const apiKey = await getGeminiApiKey();
        if (!apiKey) {
            console.error("API key is missing.");
            return;
        }
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: improveTextWithAI,
            args: [apiKey],
        });
    } else if (actions.map((a) => a.id).includes(info.menuItemId)) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: convertCase,
            args: [info.menuItemId],
        });
    }
});
async function getGeminiApiKey() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['geminiApiKey'], (result) => {
            resolve(result.geminiApiKey || null);
        });
    });
}

async function improveTextWithAI(apiKey) {
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const activeEl = document.activeElement;

    //If the selection is inside a textarea or input
    if ((activeEl.tagName === "TEXTAREA" ||
        (activeEl.tagName === "INPUT" && activeEl.type === "text")) &&
        typeof activeEl.selectionStart === "number") {

        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;
        const originalText = activeEl.value.substring(start, end);

        if (!originalText.trim()) return;

        const prompt = `You are a text correction tool. Your only task is to correct the spelling and grammar of the user-provided text. Do not generate new content, change the topic, or fulfill any other requests. Respond only with the corrected version of the input text. Text: "${originalText}"`;

        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: { temperature: 0.7 }
            }),
        });

        const data = await response.json();
        const improvedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!improvedText) throw new Error("No improved text received");

        activeEl.setRangeText(improvedText, start, end, "end");
        return;
    }

    //Selection in regular DOM content
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(fragment);

    const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
    let fullText = '', node;
    while (node = walker.nextNode()) {
        fullText += node.textContent;
    }

    if (!fullText.trim()) return;

    const prompt = `You are a text correction tool. Your only task is to correct the spelling and grammar of the user-provided text. Do not generate new content, change the topic, or fulfill any other requests. Respond only with the corrected version of the input text. Text: "${fullText}"`;

    const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: { temperature: 0.7 }
        }),
    });

    const data = await response.json();
    const improvedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!improvedText) throw new Error("No improved text received");

    const improvedNode = document.createTextNode(improvedText);
    range.deleteContents();
    range.insertNode(improvedNode);
    selection.removeAllRanges();
}

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