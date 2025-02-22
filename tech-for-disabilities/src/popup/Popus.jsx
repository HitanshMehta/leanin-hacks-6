import { useState, useEffect } from "react";

const HUGGING_FACE_API_KEY = import.meta.env.VITE_API_KEY;

export default function EnhancedAccessibilityTool() {
  // Original accessibility states
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [signLanguage, setSignLanguage] = useState(false);
  const [easyRead, setEasyRead] = useState(false);
  const [textAnalysis, setTextAnalysis] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [voice, setVoice] = useState("");
  const [voices, setVoices] = useState([]);
  const [fontSize, setFontSize] = useState(22);
  const [lineHeight, setLineHeight] = useState(2);
  const [fontColor, setFontColor] = useState("#111");
  const [bgColor, setBgColor] = useState("#ffffff");
  
  // Speech control states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Analysis states
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      setVoices(synth.getVoices());
    };
    synth.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      synth.cancel();
    };
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
      case "analysis":
        setTextAnalysis(!textAnalysis);
        break;
      default:
        break;
    }
  };

  const getSelectedText = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString()
    });
    return result.result;
  };

  const handleSpeak = async () => {
    const text = await getSelectedText() || "Please select some text to read aloud.";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.voice = voices.find(v => v.name === voice) || null;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleDefine = async () => {
    const text = await getSelectedText();
    if (text) {
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`);
        const data = await response.json();
        const definition = data[0]?.meanings[0]?.definitions[0]?.definition || 'Definition not found.';
        alert(definition);
      } catch (error) {
        alert('Failed to fetch definition.');
      }
    } else {
      alert('Please select a word to define.');
    }
  };

  const handleSummarize = async () => {
    const text = await getSelectedText();
    if (text) {
      setIsSummarizing(true);
      try {
        const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`
          },
          body: JSON.stringify({ inputs: text })
        });
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        alert(data[0]?.summary_text || 'Failed to summarize.');
      } catch (error) {
        alert('Failed to summarize. Please check your API key and try again.');
      } finally {
        setIsSummarizing(false);
      }
    } else {
      alert('Please select text to summarize.');
    }
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

  const buttonStyle = {
    marginTop: '8px',
    width: '100%',
    padding: '8px',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  const loadingBoxStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div style={{ padding: '20px', width: '320px', minHeight: '400px', overflowY: 'auto', position: 'relative' }}>
      {isSummarizing && (
        <div style={overlayStyle}>
          <div style={loadingBoxStyle}>
            <div style={{ marginBottom: '10px' }}>📝 Summarizing text...</div>
            <div>Please wait a moment</div>
          </div>
        </div>
      )}

      <h2 style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}>Enhanced Accessibility Tools</h2>
      
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
                <option key={index} value={v.name}>{`${v.name} (${v.lang})`}</option>
              ))}
            </select>
            
            <label>Speech Speed ({speed}x)</label>
            <input type="range" min="0.5" max="2.0" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} style={{ width: '100%' }} />
            
            <button style={{ ...buttonStyle, background: '#007bff' }} onClick={handleSpeak}>
              Read Selected Text
            </button>
            
            {isSpeaking && (
              <>
                <button style={{ ...buttonStyle, background: '#28a745' }} onClick={handlePauseResume}>
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button style={{ ...buttonStyle, background: '#dc3545' }} onClick={handleStop}>
                  Stop
                </button>
              </>
            )}
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

        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span>Text Analysis Tools</span>
          <input type="checkbox" checked={textAnalysis} onChange={() => handleToggle("analysis")} />
        </label>

        {textAnalysis && (
          <div>
            <button style={{ ...buttonStyle, background: '#17a2b8' }} onClick={handleDefine}>
              Define Selected Word
            </button>
            
            <button 
              style={{ ...buttonStyle, background: '#6c757d' }} 
              onClick={handleSummarize}
              disabled={isSummarizing}
            >
              {isSummarizing ? 'Summarizing...' : 'Summarize Selected Text'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}