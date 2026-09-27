// Firefox exposes the promise-based `browser` namespace, Chromium exposes
// `chrome` (promise-based in MV3 when no callback is passed). Either works below.
const ext = (typeof browser !== "undefined" && browser.runtime) ? browser : chrome;

const toggleSwitch = document.getElementById('toggleSwitch');
const blurToggle = document.getElementById('blurToggle');

async function init() {
    // Load saved blur state from sync storage (persists across sessions)
    const { blurEnabled = false } = await ext.storage.sync.get('blurEnabled');
    blurToggle.checked = !!blurEnabled;

    // Listen for changes on the blur toggle
    blurToggle.addEventListener('change', () => {
        const isEnabled = blurToggle.checked;
        // Save to sync storage
        void ext.storage.sync.set({ blurEnabled: isEnabled });
    });

    // Get the current active tab to manage its state
    const tabs = await ext.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    if (!currentTab || !currentTab.id) return;
    const tabId = currentTab.id;

    // Disable the toggle on non-web pages (e.g., chrome://extensions)
    if (!currentTab.url?.startsWith('http')) {
        toggleSwitch.disabled = true;
        blurToggle.disabled = true;
        return;
    }

    // Load the saved state for this tab and set the toggle accordingly
    const sessionState = await ext.storage.session.get([tabId.toString()]);
    toggleSwitch.checked = !!sessionState[tabId];

    // Listen for changes on the toggle switch
    toggleSwitch.addEventListener('change', async () => {
        const isEnabled = toggleSwitch.checked;

        // Save the new state to session storage for this tab
        await ext.storage.session.set({ [tabId]: isEnabled });

        try {
            // Ensure the content script is injected before sending a message
            await ext.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });
            // Send a message to the content script to activate or deactivate
            const message = { action: isEnabled ? "activate" : "deactivate" };
            await ext.tabs.sendMessage(tabId, message);
        } catch (err) {
            console.error("Script injection failed:", err);
        }
    });
}

init().catch((err) => console.error("Popup init failed:", err));