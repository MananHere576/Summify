import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

import FileUpload from './components/FileUpload';
import SummaryDisplay from './components/SummaryDisplay';
import Loader from './components/Loader';
import Preloader from './components/Preloader';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [file, setFile] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summaryLength, setSummaryLength] = useState('medium');
  const [modelType, setModelType] = useState('ai'); 

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => setIsAppLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = async (uploadedFile) => {
    setFile(uploadedFile);
    setLoading(true);
    setError('');
    setSummaryData(null);

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('length', summaryLength);
    formData.append('modelType', modelType);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/summarize`, formData);
      setSummaryData(data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'An unexpected error occurred.';
      setError(msg);
      console.error('Summarize request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (isAppLoading) return <Preloader />;

  return (
    <>
      <header className="app-header-navbar">
        <div className="navbar-content">
          <div className="logo">Summify</div>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>

      <div className="app-container">
        <div className="main-content-header">
          <br></br><br></br>
          <h1>📄 Document Summary Assistant</h1>
          <p className="subtitle">Instantly get the key points from your PDFs and images.</p>
        </div>

        <main>
          <div className="guide-container">
            <h2>How It Works</h2>
            <ol>
              <li><span>1</span>Select your desired model type and summary length below.</li>
              <li><span>2</span>Click the upload area or drag and drop your document.</li>
              <li><span>3</span>Wait a moment for the AI to work its magic.</li>
              <li><span>4</span>Your concise summary will appear below!</li>
            </ol>
          </div>

          <div className="controls-container">
            <label>Choose Model: <strong>{modelType === 'ai' ? 'API' : 'Traditional'}</strong></label>
            <div className="length-buttons-group">
              <button
                onClick={() => setModelType('traditional')}
                className={modelType === 'traditional' ? 'active' : ''}
                disabled={loading}
              >
                Traditional
              </button>
              <button
                onClick={() => setModelType('ai')}
                className={modelType === 'ai' ? 'active' : ''}
                disabled={loading}
              >
                API (Gemini)
              </button>
            </div>

            <label>Summary Length:</label>
            <div className="length-buttons-group">
              <button
                onClick={() => setSummaryLength('short')}
                className={summaryLength === 'short' ? 'active' : ''}
                disabled={loading}
              >
                Short
              </button>
              <button
                onClick={() => setSummaryLength('medium')}
                className={summaryLength === 'medium' ? 'active' : ''}
                disabled={loading}
              >
                Medium
              </button>
              <button
                onClick={() => setSummaryLength('long')}
                className={summaryLength === 'long' ? 'active' : ''}
                disabled={loading}
              >
                Long
              </button>
            </div>
          </div>

          <FileUpload onFileUpload={handleFileUpload} loading={loading} />

          <center>
            <div className="loader-container">{loading && <Loader />}</div>
          </center>

          <SummaryDisplay data={summaryData} error={error} />
        </main>

        <footer className="app-footer">
          <p>Built for the Technical Assessment Project</p>
        </footer>
      </div>
    </>
  );
}

export default App;
