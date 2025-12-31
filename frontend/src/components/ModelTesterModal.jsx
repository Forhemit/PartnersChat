import { useState, useEffect } from 'react';

export default function ModelTesterModal({ isOpen, onClose, selectedModels }) {
    const [prompt, setPrompt] = useState('Hello, are you working?');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setResults([]);
        }
    }, [isOpen]);

    const handleTest = async () => {
        setLoading(true);
        setResults([]);
        try {
            const res = await fetch('http://localhost:8001/api/settings/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    models: selectedModels,
                    prompt: prompt
                })
            });
            const data = await res.json();
            setResults(data.results);
        } catch (err) {
            console.error(err);
            // Dummy error result
            setResults(selectedModels.map(m => ({ model: m, status: "error", response: "Failed to connect to backend." })));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Test Models</h2>

                <div className="test-config">
                    <label>Prompt:</label>
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                </div>

                <div className="models-to-test">
                    <strong>Testing {selectedModels.length} models:</strong>
                    <p className="model-names">{selectedModels.join(', ')}</p>
                </div>

                <div className="results-area">
                    {results.length === 0 && !loading && (
                        <div className="empty-state">Click "Run Test" to start.</div>
                    )}

                    {loading && <div className="loading-state">Running tests...</div>}

                    {results.map((res, idx) => (
                        <div key={idx} className={`result-item ${res.status}`}>
                            <div className="result-header">
                                <span className="model-name">{res.model}</span>
                                <span className={`status-badge ${res.status}`}>{res.status}</span>
                            </div>
                            <div className="result-body">{res.response}</div>
                        </div>
                    ))}
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} disabled={loading}>Close</button>
                    <button className="primary-btn" onClick={handleTest} disabled={loading}>
                        {loading ? 'Running...' : 'Run Test'}
                    </button>
                </div>
            </div>

            <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
        }
        .modal-content {
          background: white;
          padding: 24px;
          border-radius: 12px;
          width: 600px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        }
        h2 { margin-top: 0; margin-bottom: 20px; }

        .test-config { margin-bottom: 20px; }
        .test-config input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          margin-top: 8px;
        }

        .models-to-test {
          margin-bottom: 20px;
          background: #f8fafc;
          padding: 12px;
          border-radius: 6px;
          font-size: 13px;
        }
        .model-names { color: #64748b; margin: 4px 0 0; }

        .results-area {
          flex: 1;
          overflow-y: auto;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 20px;
          min-height: 200px;
          background: #f8fafc;
        }

        .result-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 12px;
        }
        .result-item.success { border-left: 4px solid #10b981; }
        .result-item.error { border-left: 4px solid #ef4444; }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .model-name { font-weight: 600; font-size: 14px; }
        .status-badge {
          font-size: 11px;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
        .status-badge.success { background: #d1fae5; color: #059669; }
        .status-badge.error { background: #fee2e2; color: #b91c1c; }

        .result-body {
          font-size: 13px;
          color: #334155;
          white-space: pre-wrap;
          font-family: monospace;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        button {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
        }
        button.primary-btn {
          background: #2563eb;
          color: white;
          border: none;
        }
      `}</style>
        </div>
    );
}
