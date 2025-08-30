import React, { useState, useEffect } from 'react';


const CopyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);
const StopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
);


const parseAndHighlightText = (text) => {
  if (!text) return '';
  const content = text.split(/:\s*\n/)[1] || text;
  const parts = content.split('**');
  return parts.map((part, index) =>
    index % 2 === 1 ? <strong key={index} className="highlight">{part}</strong> : part
  );
};

const getRawTextForCopy = (text) => {
  if (!text) return '';
  return text
    .replace(/:\s*\n/, ':\n')
    .replace(/\*\*/g, '')
    .replace(/^- |^\* /gm, '');
}


function SummaryDisplay({ data, error }) {
  const [isCopied, setIsCopied] = useState({ paragraph: false, highlights: false });
  const [ttsState, setTtsState] = useState('idle');

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const handleCopy = (textToCopy, type) => {
    const rawText = getRawTextForCopy(textToCopy);
    navigator.clipboard.writeText(rawText);
    setIsCopied({ ...isCopied, [type]: true });
    setTimeout(() => setIsCopied({ ...isCopied, [type]: false }), 2000);
  };

  const handleDownload = (summary, highlights, modelType) => {
    let fullText = `Summary:\n${getRawTextForCopy(summary)}`;
    if (modelType !== 'traditional') {
      fullText += `\n\nKey Highlights:\n${getRawTextForCopy(highlights)}`;
    }
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTTS = (summary, highlights, modelType) => {
    if (!window.speechSynthesis) {
      alert("Your browser does not support Text-to-Speech.");
      return;
    }
    const synth = window.speechSynthesis;
    let textToSpeak = `Summary. ${getRawTextForCopy(summary)}`;
    if (modelType !== 'traditional') {
      textToSpeak += `. Key Highlights. ${getRawTextForCopy(highlights)}`;
    }

    if (ttsState === 'idle') {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => setTtsState('idle');
      synth.speak(utterance);
      setTtsState('playing');
    } else if (ttsState === 'playing') {
      synth.pause();
      setTtsState('paused');
    } else if (ttsState === 'paused') {
      synth.resume();
      setTtsState('playing');
    }
  };

  const handleStopTTS = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setTtsState('idle');
    }
  };

  if (error) {
    return (
      <div className="summary-container error-container animate-fade-in">
        <h3>An Error Occurred</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { filename, pages, summaryParagraph, highlightsList, modelType, length } = data;
  const wordCount = getRawTextForCopy(summaryParagraph).split(/\s+/).filter(Boolean).length;
 const bulletPoints = highlightsList
  .split('\n')
  .map(line => line.trim())               
  .filter(line => line && /^[\-\*]\s+/.test(line));


  return (
    <div className="animate-fade-in space-y-4">

      {}
      <div className="summary-container flex flex-wrap items-center justify-between gap-4">
        <div className='flex flex-col'>
          <h3 className='text-lg font-semibold'>Summary Actions</h3>
          <p className='text-sm text-gray-500'>Actions for the complete summary below.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleDownload(summaryParagraph, highlightsList, modelType)} className="action-button"><DownloadIcon /> Download</button>
          <button onClick={() => handleTTS(summaryParagraph, highlightsList, modelType)} className="action-button">
            {ttsState === 'playing' ? <PauseIcon /> : <PlayIcon />} {ttsState === 'playing' ? 'Pause' : 'Read Aloud'}
          </button>
          {ttsState !== 'idle' && <button onClick={handleStopTTS} className="action-button"><StopIcon /> Stop</button>}
        </div>
      </div>

      {}
      {summaryParagraph && (
        <div className="summary-container">
          <div className="summary-header">
            <h3>{summaryParagraph.split(/:\s*\n/)[0]}</h3>
            <div className='summary-header-meta'>
              <span className="word-count">{wordCount} words</span>
              <button onClick={() => handleCopy(summaryParagraph, 'paragraph')} className={`copy-button ${isCopied.paragraph ? 'copied' : ''}`} aria-label="Copy summary">
                {isCopied.paragraph ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          </div>
          <div className="summary-paragraphs">
            <p>{parseAndHighlightText(summaryParagraph)}</p>
          </div>
        </div>
      )}

      {}
      {modelType !== 'traditional' && highlightsList && (
        <div className="summary-container">
          <div className="summary-header">
            <h3>{highlightsList.split(/:\s*\n/)[0]}</h3>
            <button onClick={() => handleCopy(highlightsList, 'highlights')} className={`copy-button ${isCopied.highlights ? 'copied' : ''}`} aria-label="Copy highlights">
              {isCopied.highlights ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
          <ul className="summary-list">
            {bulletPoints.map((point, index) => (
              <li key={index}>
                {parseAndHighlightText(point)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SummaryDisplay;
