// chrome.runtime.onMessage.addListener((msg) => {
//     if (msg.action === "speakText") {
//         const utterance = new SpeechSynthesisUtterance(msg.text);
//         utterance.rate = msg.speed || 1.0; 
//         speechSynthesis.speak(utterance);
//     } else if (msg.action === "toggleVideoCaptioning") {
//         const video = document.querySelector("video");
//         if (msg.enableCaptioning) {
//             if (video) {
//                 extractCaptions(video);
//             } else {
//                 startTranscribing();
//             }
//         } else {
//             stopTranscribing();
//         }
//     }
// });

// // content.js

// let recognition;

// // Start transcribing audio using Web Speech API
// const startTranscribing = () => {
//   if (!recognition) {
//     recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//     recognition.lang = "en-US";
//     recognition.continuous = true;
//     recognition.interimResults = true;

//     recognition.onresult = (event) => {
//       const transcript = event.results[event.results.length - 1][0].transcript;
//       console.log("Live Transcript:", transcript);
//       displayCaption(transcript);
//     };

//     recognition.onerror = (event) => {
//       console.error("Speech recognition error", event);
//     };
//   }

//   recognition.start();
// };

// // Stop transcribing
// const stopTranscribing = () => {
//   if (recognition) {
//     recognition.stop();
//     recognition = null;
//   }
// };

// // Extract captions from video element
// const extractCaptions = (videoElement) => {
//   const tracks = videoElement.textTracks;
//   let captionFound = false;

//   for (let i = 0; i < tracks.length; i++) {
//     const track = tracks[i];
//     if (track.kind === "subtitles" || track.kind === "captions") {
//       captionFound = true;
//       track.mode = "showing";

//       track.oncuechange = () => {
//         const activeCue = track.activeCues[0];
//         if (activeCue) {
//           console.log("Caption:", activeCue.text);
//           displayCaption(activeCue.text);
//         }
//       };
//     }
//   }

//   if (!captionFound) {
//     console.log("No captions found, switching to transcription...");
//     startTranscribing();
//   }
// };

// // Display captions on the screen
// const displayCaption = (text) => {
//   let captionElement = document.getElementById("video-caption");

//   if (!captionElement) {
//     captionElement = document.createElement("div");
//     captionElement.id = "video-caption";
//     document.body.appendChild(captionElement);
//   }

//   captionElement.textContent = text;

//   // Styling for the caption overlay
//   captionElement.style.position = "fixed";
//   captionElement.style.bottom = "50px";
//   captionElement.style.left = "50%";
//   captionElement.style.transform = "translateX(-50%)";
//   captionElement.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
//   captionElement.style.color = "white";
//   captionElement.style.padding = "10px";
//   captionElement.style.borderRadius = "5px";
//   captionElement.style.fontSize = "18px";
//   captionElement.style.zIndex = "9999";
// };

// // Listen for messages from the popup
// chrome.runtime.onMessage.addListener((msg) => {
//   if (msg.action === "toggleVideoCaptioning") {
//     const video = document.querySelector("video");
//     if (msg.enableCaptioning) {
//       if (video) {
//         extractCaptions(video);
//       } else {
//         startTranscribing();
//       }
//     } else {
//       stopTranscribing();
//     }
//   }
// });

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((msg) => {
    console.log("Message received in content.js:", msg);
    if (msg.action === "speakText") {
    const utterance = new SpeechSynthesisUtterance(msg.text);
    utterance.rate = msg.speed || 1.0;
    speechSynthesis.speak(utterance);
  } 
  else if (msg.action === "toggleVideoCaptioning") {
    const video = document.querySelector("video");
    if (msg.enableCaptioning) {
      if (video) {
        extractCaptions(video);
      } else {
        startTranscribing();
      }
    } else {
      stopTranscribing();
      cleanupCaptionOverlay();
    }
  }
  sendResponse({ success: true });
});

// // content.js
// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//   if (msg.action === "transcribeVideo") {
//     const video = document.querySelector("video");
//     if (video) {
//       const videoUrl = video.src;
//       const formData = new FormData();
//       formData.append("file", videoUrl);

//       fetch("http://localhost:5000/transcribe", {
//         method: "POST",
//         body: formData,
//       })
//         .then((response) => response.json())
//         .then((data) => {
//           console.log("Transcription:", data);
//           sendResponse(data);
//         })
//         .catch((error) => {
//           console.error("Error:", error);
//           sendResponse({ error: "Transcription failed" });
//         });
//       return true; // Keep the message channel open for sendResponse
//     } else {
//       sendResponse({ error: "No video found" });
//     }
//   }
// });