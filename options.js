document.addEventListener('DOMContentLoaded', () => {
    // Load existing settings
    chrome.storage.local.get(['geminiApiKey', 'vanriseMode', 'showQuote'], (result) => {
        document.getElementById('apiKey').value = result.geminiApiKey || '';
        document.getElementById('vanriseMode').checked = result.vanriseMode || false;
        document.getElementById('showQuote').checked = result.showQuote !== undefined ? result.showQuote : true;
    });

    // Save settings
    document.getElementById('saveKey').addEventListener('click', () => {
        const apiKey = document.getElementById('apiKey').value.trim();
        const vanriseMode = document.getElementById('vanriseMode').checked;
        const showQuote = document.getElementById('showQuote').checked;

        chrome.storage.local.set({
            geminiApiKey: apiKey,
            vanriseMode: vanriseMode,
            showQuote: showQuote
        }, () => {
            alert('Settings saved!');
            window.close();
        });
    });
});