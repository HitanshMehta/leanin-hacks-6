// chrome.action.onClicked.addListener(tab => {
//     chrome.scripting.executeScript({
//         target: {tabId: tab.id},
//         func: () => {
//             alert('Hello from my extension!');
//         }
//     });
// });

// // background.js
// chrome.runtime.onInstalled.addListener(() => {
//     chrome.contextMenus.create({
//       id: "readAloud",
//       title: "Read Aloud",
//       contexts: ["selection"] // Only show on selected text
//     });
//   });
  
//   chrome.contextMenus.onClicked.addListener((info, tab) => {
//     if (info.menuItemId === "readAloud" && info.selectionText) {
//       chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         function: speakText,
//         args: [info.selectionText]
//       });
//     }
//   });
  
//   // This function will be injected into the content script
//   function speakText(text) {
//     chrome.storage.sync.get({
//       voice: null, // Default voice
//       rate: 1.0  // Default speed
//     }, function(data) {
//       const utterance = new SpeechSynthesisUtterance(text);
//       if (data.voice) {
//         utterance.voice = speechSynthesis.getVoices().find(v => v.name === data.voice);
//       }
//       utterance.rate = data.rate;
  
//       console.log("Utterance Object:", utterance); // Add this line!
  
//       speechSynthesis.speak(utterance);
//     });
//   }
// Background script
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "readAloud",
        title: "Read Aloud",
        contexts: ["selection"] // Only show on selected text
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "readAloud" && info.selectionText) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: speakText,
            args: [info.selectionText]
        });
    }
});

function speakText(text) {
    chrome.storage.sync.get({
        voice: null, // Default voice
        rate: 1.0    // Default speed
    }, function (data) {
        const utterance = new SpeechSynthesisUtterance(text);
        if (data.voice) {
            utterance.voice = speechSynthesis.getVoices().find(v => v.name === data.voice);
        }
        utterance.rate = data.rate;

        console.log("Utterance Object:", utterance);
        speechSynthesis.speak(utterance);
    });
}
