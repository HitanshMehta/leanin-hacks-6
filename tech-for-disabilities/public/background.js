chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "readAloud",
        title: "Read Aloud",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "readAloud" && info.selectionText) {
        // Execute speech synthesis in the page context
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (text, voiceName, speed) => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = speed || 1.0;

                const voices = speechSynthesis.getVoices();
                if (voiceName) {
                    utterance.voice = voices.find(v => v.name === voiceName) || voices[0];
                }

                speechSynthesis.speak(utterance);
            },
            args: [info.selectionText, null, 1.0] // Default voice and speed
        });
    }
});
