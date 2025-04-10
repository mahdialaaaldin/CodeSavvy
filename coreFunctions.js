// Shared extension functionality
const CoreTools = {
    unlockElements: function () {
        document.querySelectorAll('[disabled], .divDisabled, [aria-disabled="true"], [readonly], .disabled')
            .forEach(el => {
                el.removeAttribute('disabled');
                el.removeAttribute('aria-disabled');
                el.removeAttribute('readonly');
                el.classList.remove('divDisabled', 'disabled');
            });
    },

    toggleDesignMode: function () {
        document.designMode = document.designMode === 'on' ? 'off' : 'on';
        return document.designMode === 'on';
    },

    disableLoaders: function () {
        document.querySelectorAll('.divLoading').forEach(el => {
            el.classList.remove('divLoading');
        });
    },

    clearCache: async function () {
        await chrome.browsingData.remove({ since: 0 }, { cache: true });
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.reload(tab.id);
    }
};