// background.js
//
// Clears the temporary "proceed for this session" dismissals when the browser
// starts, so they don't leak into the next session.
//
// On Chromium this is a backup: the warning page URL changes on every launch
// (dynamic URL), which already invalidates the old dismissals. Firefox uses a
// static warning page URL, so without this the "proceed" clicks would stick
// around after a restart.

// Firefox exposes the promise-based `browser` namespace, Chromium exposes
// `chrome` (promise-based in MV3 when no callback is passed). Either works below.
const ext = (typeof browser !== "undefined" && browser.runtime) ? browser : chrome;

async function clearSessionDismissals() {
    try {
        await ext.storage.local.remove(["tempDismissed", "sessionToken"]);
    } catch (err) {
        console.error("Unicode Domain Warning: failed to clear session dismissals:", err);
    }
}

ext.runtime.onStartup.addListener(clearSessionDismissals);
ext.runtime.onInstalled.addListener(clearSessionDismissals);
