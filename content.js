const pageToSpeech = {
    data: {
        highlightedText: "",
        speechInProgress: false,
        fallbackAudio: null
    },

    initialize: function () {
        if (!this.hasText()) return;
        if (!this.trySpeechSynthesizer()) {
            this.trySpeechApi();
        }
    },

    hasText: function () {
        this.data.highlightedText = window.getSelection().toString();
        if (!this.data.highlightedText) {
            let input = document.createElement("input");
            input.type = "text";
            input.id = "sandbox";
            document.body.appendChild(input);
            let sandbox = document.getElementById("sandbox");
            sandbox.value = "";
            sandbox.style.opacity = 0;
            sandbox.focus();

            if (document.execCommand("paste")) {
                this.data.highlightedText = sandbox.value;
            }
            sandbox.remove();
        }
        return this.data.highlightedText.length > 0;
    },

    trySpeechSynthesizer: function () {
        if (window.speechSynthesis) {
            if (this.data.speechInProgress) {
                speechSynthesis.cancel();
            }
            this.data.speechInProgress = true;

            let msg = new SpeechSynthesisUtterance(this.data.highlightedText);
            msg.onend = () => {
                this.data.speechInProgress = false;
            };

            speechSynthesis.speak(msg);
            return true;
        }
        return false;
    },

    trySpeechApi: function () {
        if (this.data.speechInProgress) {
            this.data.fallbackAudio?.pause();
        }
        this.data.speechInProgress = true;

        this.data.fallbackAudio = new Audio(`http://api.voicerss.org/?key=your_api_key&src=${encodeURIComponent(this.data.highlightedText)}`);
        this.data.fallbackAudio.onerror = function () {
            alert("Sorry, we cannot produce speech right now. Try upgrading your Chrome browser!");
        };
        this.data.fallbackAudio.play();
        this.data.fallbackAudio.onended = () => {
            this.data.speechInProgress = false;
        };
    },

    addHotkeys: function () {
        let activeKeys = {};
        document.addEventListener("keydown", (event) => {
            activeKeys[event.keyCode] = true;
            if (activeKeys[16] && activeKeys[84]) { // Shift + T
                this.initialize();
            }
        });
        document.addEventListener("keyup", (event) => {
            delete activeKeys[event.keyCode];
        });
    }
};

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "pageToSpeech") {
        pageToSpeech.initialize();
    }
});

// Initialize hotkeys
pageToSpeech.addHotkeys();
