import { useState, useEffect } from "react";

export default function AccessibilityTool() {
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [signLanguage, setSignLanguage] = useState(false);
  const [easyRead, setEasyRead] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [voice, setVoice] = useState("");
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      setVoices(synth.getVoices());
    };
    synth.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const handleToggle = (feature) => {
    switch (feature) {
      case "tts":
        setTextToSpeech(!textToSpeech);
        break;
      case "sign":
        setSignLanguage(!signLanguage);
        break;
      case "read":
        setEasyRead(!easyRead);
        break;
      default:
        break;
    }
  };

  // Function to speak a sample text
  const handleSpeak = () => {
    chrome.runtime.sendMessage({
      action: "speakText",
      text: "This is a test speech.",
      speed,
      voice
    });
  };

  // Function to read the selected text
  const handleSpeakSelectedText = () => {
    chrome.tabs.executeScript(
      {
        code: "window.getSelection().toString();"
      },
      (selection) => {
        if (selection && selection[0]) {
          chrome.runtime.sendMessage({
            action: "speakText",
            text: selection[0],
            speed,
            voice
          });
        } else {
          alert("No text selected!");
        }
      }
    );
  };

  return (
    <div style={{ padding: '16px', width: '300px' }}>
      <h2 style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>Accessibility Settings</h2>
      <div style={{ marginTop: '16px', padding: '8px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Text-to-Speech</span>
          <input type="checkbox" checked={textToSpeech} onChange={() => handleToggle("tts")} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Sign Language Mode</span>
          <input type="checkbox" checked={signLanguage} onChange={() => handleToggle("sign")} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Easy Read Mode</span>
          <input type="checkbox" checked={easyRead} onChange={() => handleToggle("read")} />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <span>Select Voice</span>
          <select value={voice} onChange={(e) => setVoice(e.target.value)} style={{ width: '100%', marginTop: '4px' }}>
            {voices.map((v, index) => (
              <option key={index} value={v.name}>{v.name}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <span>Speech Speed ({speed}x)</span>
          <input type="range" min="0.5" max="2.0" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} style={{ width: '100%' }} />
        </div>
      </div>
      <button style={{ marginTop: '16px', width: '100%', padding: '8px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={handleSpeak}>Test Speech</button>
      <button style={{ marginTop: '8px', width: '100%', padding: '8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={handleSpeakSelectedText}>Read Selected Text</button>
    </div>
  );
}
