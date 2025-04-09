document.addEventListener('DOMContentLoaded', () => {
    // Load existing settings
    chrome.storage.local.get(['geminiApiKey', 'vanriseMode'], (result) => {
        document.getElementById('apiKey').value = result.geminiApiKey || '';
        document.getElementById('vanriseMode').checked = result.vanriseMode || false;
    });

    // Save settings
    document.getElementById('saveKey').addEventListener('click', () => {
        const apiKey = document.getElementById('apiKey').value.trim();
        const vanriseMode = document.getElementById('vanriseMode').checked;
        
        chrome.storage.local.set({ 
            geminiApiKey: apiKey,
            vanriseMode: vanriseMode
        }, () => {
            alert('Settings saved!');
            window.close();
        });
    });
});