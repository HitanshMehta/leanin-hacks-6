// chrome.runtime.onInstalled.addListener(() => {
//     chrome.contextMenus.create({
//         id: "readAloud",
//         title: "Read Aloud",
//         contexts: ["selection"]
//     });
// });

// chrome.contextMenus.onClicked.addListener((info, tab) => {
//     if (info.menuItemId === "readAloud" && info.selectionText) {
//         chrome.scripting.executeScript({
//             target: { tabId: tab.id },
//             function: speakText,
//             args: [info.selectionText]
//         });
//     }
// });

// function speakText(text) {
//     const utterance = new SpeechSynthesisUtterance(text);
//     speechSynthesis.speak(utterance);
// }

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "speakText") {
        const utterance = new SpeechSynthesisUtterance(msg.text);
        utterance.rate = msg.speed || 1.0; 
        speechSynthesis.speak(utterance);
    }
});
