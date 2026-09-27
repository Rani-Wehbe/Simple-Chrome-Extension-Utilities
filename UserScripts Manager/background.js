// background.js

// Firefox exposes the promise-based `browser` namespace, Chromium exposes
// `chrome` (promise-based in MV3 when no callback is passed). Either works below.
const ext = (typeof browser !== "undefined" && browser.runtime) ? browser : chrome;

let isDebugMode = false;

// Initialize debug mode state
ext.storage.local.get('debugMode').then((data) => {
    isDebugMode = !!data.debugMode;
}).catch((err) => {
    console.error('[Userscript Manager] Failed to read debug mode:', err);
});

// Custom logger for background.js
function debugLog(...args) {
    if (isDebugMode) {
        console.log('[Userscript Manager]', ...args);
    }
}

function wildcardToRegex(pattern) {
    const regexString = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${regexString}$`);
}

function getScriptWorld(code) {
    const match = code.match(/\/\/\s*@inject-into\s+(content|page)/i);
    const mode = match ? match[1].toLowerCase() : 'page';
    return mode === 'content' ? 'USER_SCRIPT' : 'MAIN';
}

async function updateRegisteredScripts() {
    try {
        // The userScripts API only exists once the permission is granted and,
        // on Chromium, the user flipped "Allow user scripts" for the extension.
        // Firefox grants it via optional_permissions at runtime.
        if (!ext.userScripts) {
            debugLog('userScripts API not available yet, skipping registration.');
            return;
        }

        if (ext.userScripts.configureWorld) {
            ext.userScripts.configureWorld({
                csp: "script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'self'"
            });
        }

        const { scripts = [] } = await ext.storage.local.get('scripts');
        const enabledScripts = scripts.filter(s => s.enabled);

        await ext.userScripts.unregister();

        const scriptsToRegister = enabledScripts.map(script => {
            let combinedCode = "";

            // --- DEBUG INJECTION ---
            // If debug mode is on, inject a console.log into the webpage so you know the script ran.
            if (isDebugMode) {
                combinedCode += `console.log("[Userscript Manager] Running script: ${script.name.replace(/"/g, '\\"')}");\n\n`;
            }

            if (script.requireCodes && script.requireCodes.length > 0) {
                script.requireCodes.forEach(reqCode => {
                    combinedCode += reqCode + "\n\n";
                });
            }

            if (script.grants && script.grants.length > 0 && !script.grants.includes('none')) {
                combinedCode += `
                    window.GM_addStyle = function(css) {
                        const style = document.createElement('style');
                        style.textContent = css;
                        (document.head || document.documentElement).appendChild(style);
                    };
                    window.GM_info = { script: { name: "${script.name.replace(/"/g, '\\"')}" } };
                \n\n`;
            }

            combinedCode += script.code;

            return {
                id: script.id,
                matches: script.matches,
                js: [{ code: combinedCode }],
                world: getScriptWorld(script.code),
                runAt: script.runAt || 'document_idle'
            };
        });

        if (scriptsToRegister.length > 0) {
            await ext.userScripts.register(scriptsToRegister);
        }
        
        // Log to extension background console
        debugLog(`Registered ${scriptsToRegister.length} scripts.`);
    } catch (error) {
        console.error('[Userscript Manager] Error updating scripts:', error);
    }
}

// Listen for changes to scripts OR the debugMode toggle
ext.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
        if (changes.debugMode !== undefined) {
            isDebugMode = changes.debugMode.newValue;
            // Re-register scripts to add/remove the in-page debug console.log
            updateRegisteredScripts().catch((err) => {
                console.error('[Userscript Manager] Error updating scripts:', err);
            });
        }
        if (changes.scripts) {
            updateRegisteredScripts().catch((err) => {
                console.error('[Userscript Manager] Error updating scripts:', err);
            });
        }
    }
});

// When the userScripts permission gets granted at runtime (Firefox), or the
// extension is installed/updated (scripts are wiped on update), register again.
ext.permissions.onAdded.addListener(() => {
    updateRegisteredScripts().catch((err) => {
        console.error('[Userscript Manager] Error updating scripts:', err);
    });
});

ext.runtime.onInstalled.addListener(() => {
    updateRegisteredScripts().catch((err) => {
        console.error('[Userscript Manager] Error updating scripts:', err);
    });
});
ext.runtime.onStartup.addListener(() => {
    updateRegisteredScripts().catch((err) => {
        console.error('[Userscript Manager] Error updating scripts:', err);
    });
});