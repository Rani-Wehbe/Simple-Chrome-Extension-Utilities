// Firefox exposes the promise-based `browser` namespace, Chromium exposes
// `chrome` (promise-based in MV3 when no callback is passed). Either works below.
const ext = (typeof browser !== "undefined" && browser.runtime) ? browser : chrome;

ext.runtime.onMessage.addListener((request, sender) => {
    // Listen for the message from content.js when the Escape key is pressed
    if (request.action === "deactivated_by_escape" && sender.tab) {
        const tabId = sender.tab.id;
        // Update the state in session storage to reflect that the randomizer is off
        void ext.storage.session.set({ [tabId]: false });
    }
});

ext.tabs.onUpdated.addListener((tabId, changeInfo) => {
    // When a tab is reloaded or its URL changes, reset its "active" state.
    // This prevents the toggle from appearing "on" for a page where the script isn't running.
    if (changeInfo.status === 'loading') {
        void ext.storage.session.remove(tabId.toString());
    }
});
