document.addEventListener('DOMContentLoaded', () => {
    // Load existing settings
    chrome.storage.local.get(['geminiApiKey', 'vanriseMode', 'showQuote', 'apiProvider'], (result) => {
        document.getElementById('apiKey').value = result.geminiApiKey || '';
        document.getElementById('vanriseMode').checked = result.vanriseMode || false;
        document.getElementById('showQuote').checked = result.showQuote !== undefined ? result.showQuote : true;
        document.getElementById('apiProvider').value = result.apiProvider || 'gemini';

        toggleApiKeyField(result.apiProvider || 'gemini');
    });

    // Show / hide API key field
    function toggleApiKeyField(provider) {
        const apiKeyField = document.getElementById('apiKey').parentNode.parentNode;
        apiKeyField.style.display = provider === 'gemini' ? 'block' : 'none';
    }

    // Add listener for API provider change
    document.getElementById('apiProvider').addEventListener('change', function (e) {
        toggleApiKeyField(e.target.value);
    });

    // Toggle password visibility
    const toggleButton = document.getElementById('toggleVisibility');
    const apiKeyInput = document.getElementById('apiKey');

    toggleButton.addEventListener('click', () => {
        const isPassword = apiKeyInput.type === 'password';
        apiKeyInput.type = isPassword ? 'text' : 'password';

        // Update the icon
        const icon = toggleButton.querySelector('svg');
        if (isPassword) {
            icon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            `;
        } else {
            icon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            `;
        }
    });

    // Save settings
    document.getElementById('saveKey').addEventListener('click', () => {
        const apiKey = document.getElementById('apiKey').value.trim();
        const vanriseMode = document.getElementById('vanriseMode').checked;
        const showQuote = document.getElementById('showQuote').checked;
        const apiProvider = document.getElementById('apiProvider').value;

        chrome.storage.local.set({
            geminiApiKey: apiKey,
            vanriseMode: vanriseMode,
            showQuote: showQuote,
            apiProvider: apiProvider
        }, () => {
            alert('Settings saved!');
            window.close();
        });
    });
});