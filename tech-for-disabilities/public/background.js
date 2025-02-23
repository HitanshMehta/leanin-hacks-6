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

// Add context menu for captioning
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "toggleCaptions",
      title: "Toggle Video Captions",
      contexts: ["all"],
    });
  });
  
  // Handle context menu clicks
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "toggleCaptions") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "toggleVideoCaptioning",
            enableCaptioning: true,
          });
        }
      });
    }
  });