import { useState, useEffect } from "react";

export default function AccessibilityTool() {
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [signLanguage, setSignLanguage] = useState(false);
  const [easyRead, setEasyRead] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [voice, setVoice] = useState("");
  const [voices, setVoices] = useState([]);
  const [fontSize, setFontSize] = useState(22);
  const [lineHeight, setLineHeight] = useState(2);
  const [fontColor, setFontColor] = useState("#111");
  const [bgColor, setBgColor] = useState("#ffffff");

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
        toggleEasyReadMode(!easyRead, fontSize, lineHeight, fontColor, bgColor);
        break;
      default:
        break;
    }
  };

  const handleSpeak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text || "This is a test speech.");
    utterance.rate = speed;
    utterance.voice = voices.find(v => v.name === voice) || null;
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeakSelectedText = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) {
        alert("No active tab found!");
        return;
      }
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => window.getSelection().toString()
        },
        (results) => {
          if (results && results[0] && results[0].result) {
            handleSpeak(results[0].result);
          } else {
            alert("No text selected!");
          }
        }
      );
    });
  };

  const toggleEasyReadMode = (enabled, fontSize, lineHeight, fontColor, bgColor) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) return;

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (enabled, fontSize, lineHeight, fontColor, bgColor) => {
          document.querySelectorAll("* :not(script, style, meta, link)").forEach((el) => {
            el.style.fontSize = enabled ? `${fontSize}px` : "";
            el.style.lineHeight = enabled ? `${lineHeight}` : "";
            el.style.color = enabled ? fontColor : "";
            el.style.backgroundColor = enabled ? bgColor : "";
            el.style.fontFamily = enabled ? "Arial, sans-serif" : "";
          });
        },
        args: [enabled, fontSize, lineHeight, fontColor, bgColor]
      });
    });
  };

  useEffect(() => {
    if (easyRead) {
      toggleEasyReadMode(true, fontSize, lineHeight, fontColor, bgColor);
    }
  }, [fontSize, lineHeight, fontColor, bgColor]);

  return (
    <div style={{ padding: '20px', width: '320px', minHeight: '400px', overflowY: 'auto' }}>
      <h2 style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}>Accessibility Settings</h2>
      <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #ccc', borderRadius: '10px' }}>
        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span>Text-to-Speech</span>
          <input type="checkbox" checked={textToSpeech} onChange={() => handleToggle("tts")} />
        </label>
        {textToSpeech && (
          <div>
            <label>Select Voice</label>
            <select value={voice} onChange={(e) => setVoice(e.target.value)} style={{ width: '100%', marginBottom: '10px' }}>
              {voices.map((v, index) => (
                <option key={index} value={v.name}>{v.name}</option>
              ))}
            </select>
            <label>Speech Speed ({speed}x)</label>
            <input type="range" min="0.5" max="2.0" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} style={{ width: '100%' }} />
            <button style={{ marginTop: '10px', width: '100%', padding: '8px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }} onClick={() => handleSpeak()}>Test Speech</button>
            <button style={{ marginTop: '8px', width: '100%', padding: '8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }} onClick={handleSpeakSelectedText}>Read Selected Text</button>
          </div>
        )}
        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span>Sign Language Mode</span>
          <input type="checkbox" checked={signLanguage} onChange={() => handleToggle("sign")} />
        </label>
        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span>Easy Read Mode</span>
          <input type="checkbox" checked={easyRead} onChange={() => handleToggle("read")} />
        </label>
        {easyRead && (
          <div>
            <label>Font Size ({fontSize}px)</label>
            <input type="range" min="16" max="32" step="1" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} style={{ width: '100%' }} />
            <label>Line Height ({lineHeight})</label>
            <input type="range" min="1" max="3" step="0.1" value={lineHeight} onChange={(e) => setLineHeight(parseFloat(e.target.value))} style={{ width: '100%' }} />
            <label>Font Color</label>
            <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} style={{ width: '100%' }} />
            <label>Background Color</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: '100%' }} />
          </div>
        )}
      </div>
    </div>
  );
}
