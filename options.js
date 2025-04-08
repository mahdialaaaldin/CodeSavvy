document.addEventListener('DOMContentLoaded', () => {
    // Load existing key
    chrome.storage.local.get(['geminiApiKey'], (result) => {
        document.getElementById('apiKey').value = result.geminiApiKey || '';
    });

    // Save new key
    document.getElementById('saveKey').addEventListener('click', () => {
        const apiKey = document.getElementById('apiKey').value.trim();
        if (apiKey) {
            chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
                alert('API key saved successfully!');
                window.close();
            });
        }
    });
});