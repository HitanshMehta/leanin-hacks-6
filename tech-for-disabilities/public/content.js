// chrome.runtime.onMessage.addListener((msg) => {
//     if (msg.action === "speakText") {
//         const utterance = new SpeechSynthesisUtterance(msg.text);
//         utterance.rate = msg.speed || 1.0; 
//         speechSynthesis.speak(utterance);
//     }
// });

// chrome.runtime.onMessage.addListener((msg) => {
//     if (msg.action === "toggleVideoCaptioning") {
//       const video = document.querySelector("video");
  
//       if (msg.enableCaptioning) {
//         if (video) {
//           // If captions are available, extract them
//           extractCaptions(video);
//         } else {
//           // If no captions, start transcribing audio
//           startTranscribing();
//         }
//       } else {
//         // Stop transcribing if video captioning is disabled
//         stopTranscribing();
//       }
//     }
//   });

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "speakText") {
        const utterance = new SpeechSynthesisUtterance(msg.text);
        utterance.rate = msg.speed || 1.0; 
        speechSynthesis.speak(utterance);
    } else if (msg.action === "toggleVideoCaptioning") {
        const video = document.querySelector("video");
        if (msg.enableCaptioning) {
            if (video) {
                extractCaptions(video);
            } else {
                startTranscribing();
            }
        } else {
            stopTranscribing();
        }
    }
});

let recognition;

const startTranscribing = () => {
    if (!recognition) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            const transcript = event.results[event.resultIndex][0].transcript;
            displayCaption(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event);
        };
    }

    recognition.start();
};

const stopTranscribing = () => {
    if (recognition) {
        recognition.stop();
        recognition = null;  // Reset the recognition after stopping
    }
};

// Function to extract video subtitles (if available)
const extractCaptions = (videoElement) => {
const tracks = videoElement.textTracks;
let captionFound = false;

for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    if (track.kind === 'subtitles' || track.kind === 'captions') {
    captionFound = true;
    track.mode = "showing"; // Ensure captions are visible

    track.oncuechange = () => {
        const activeCue = track.activeCues[0];
        if (activeCue) {
        displayCaption(activeCue.text);
        }
    };
    }
}

if (!captionFound) {
    console.log("No captions found for this video.");
}
};

// Function to display captions in the extension UI
const displayCaption = (text) => {
const captionElement = document.getElementById('video-caption');
captionElement.textContent = text;
};


const captionStyle = {
position: 'fixed',
bottom: '10px',
left: '50%',
transform: 'translateX(-50%)',
backgroundColor: 'rgba(0, 0, 0, 0.7)',
color: 'white',
padding: '10px',
borderRadius: '5px',
fontSize: '18px',
zIndex: 9999
};

const captionContainer = document.createElement('div');
captionContainer.id = 'video-caption';
captionContainer.style = captionStyle;
document.body.appendChild(captionContainer);
