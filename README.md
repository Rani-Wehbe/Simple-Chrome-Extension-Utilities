# Simple Chrome Extension Utilities
A collection of simple, single-purpose Chrome Extensions.

---

## How to Install
Each utility is a separate, unpacked Chrome Extension.

1. Navigate to `chrome://extensions` in your Chrome browser.
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click the **Load unpacked** button.
4. Select the specific extension's sub-folder (e.g., `Gemini Code Block Bottom Copy Button/Extension`).

---

## A note on browsers

These started out Chrome-only, but they now load in Firefox too (and anything built on it, like Zen). The code is the same on both sides where possible.

To install on Firefox or Zen: open `about:debugging`, click "This Firefox" (or "This Zen"), then "Load Temporary Add-on" and pick the `manifest.json` inside the extension's folder. Temporary add-ons go away when you close the browser, so you load them again next time. There is no way around that outside the official add-on store.

One thing about the Userscript Manager: Firefox only hands out the userScripts permission when asked, so the popup shows an "Enable User Scripts" button the first time around. Click it and accept. On Chrome nothing changed, you still flip on "Allow user scripts" for the extension at `chrome://extensions`.

I loaded and smoke-tested all three in Zen with no errors. They should work the same in Chrome 121 and up, since that is where the background script behavior they rely on landed, but I have not run them there.

---

## [Unicode Domain Warning](Unicode%20Domain%20Warning/)
**Purpose:** Shows a warning banner when visiting a domain with Unicode characters (Internationalized Domain Names), which can be used for "homograph" phishing attacks.

**Available on Chrome Webstore:** [Available on Chrome Web Store](https://chromewebstore.google.com/detail/unicode-domain-warning/khijgpndoffkmanglickjbnkbjimcdhn)


## [Click To Randomize Text](Click%20To%20Randomize%20Text/)
**Purpose:** Allows you to temporarily replace or blur text on any webpage. This is useful for testing layouts or creating screenshots without revealing sensitive information.

### Usage & Features
- Click the extension icon in the toolbar to open a popup where you can enable or disable the randomizer for the current tab.
- The popup also includes an option to automatically apply a blur effect after randomizing text.

### Controls
- **Enable/Disable:** Use the toggle switch in the extension popup.
- **Undo:** Press `Ctrl + Z` to undo the most recent text modification.
- **Deactivate:** Press the `Escape` key to quickly deactivate the tool on the current page.

### Click Modes
- **Alt + Click:** Replaces the text content of the clicked element with a randomized string of characters and words.
- **Ctrl + Click:** Applies or increases a blur effect on an already randomized element.
- **Ctrl + Alt + Click:** Clears the text content of the clicked element, replacing it with blank space.
