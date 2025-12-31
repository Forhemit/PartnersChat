import { useState, useEffect } from 'react';
import ModelTesterModal from './ModelTesterModal';

const EditableModel = ({ value, onSave, editable, onClick }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    // Update editValue when prop changes, BUT only if not currently editing
    // This allows prop updates to flow through without clobbering in-progress edits
    useEffect(() => {
        if (!isEditing) {
            setEditValue(value);
        }
    }, [value, isEditing]);

    const handleSave = (e) => {
        e.stopPropagation();
        onSave(editValue);
        setIsEditing(false);
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setEditValue(value);
        setIsEditing(false);
    };

    const handleStartEdit = (e) => {
        e.stopPropagation();
        if (editable) {
            setIsEditing(true);
        } else if (onClick) {
            onClick(e);
        }
    };

    if (isEditing) {
        return (
            <div className="editable-container" onClick={(e) => e.stopPropagation()}>
                <input
                    className="edit-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                />
                <span className="action-icon save" onClick={handleSave}>✓</span>
                <span className="action-icon cancel" onClick={handleCancel}>✕</span>
            </div>
        );
    }

    return (
        <div className="editable-container" onClick={handleStartEdit}>
            <span>{value}</span>
            {editable && <span className="edit-icon">✎</span>}
        </div>
    );
};


const SettingsModal = ({ isOpen, onClose, onSettingsChanged }) => {
    const [apiKey, setApiKey] = useState('');
    const [includeFree, setIncludeFree] = useState(false);
    const [timezone, setTimezone] = useState('America/Los_Angeles');
    const [activeTab, setActiveTab] = useState('general');
    const [councilModels, setCouncilModels] = useState([]);
    const [chairmanModel, setChairmanModel] = useState('');
    const [definitions, setDefinitions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // Multi-select state
    const [selectedModels, setSelectedModels] = useState([]);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchSettings();
            setActiveTab('general');
            setSelectedModels([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && activeTab === 'logs') {
            fetchLogs();
        }
    }, [isOpen, activeTab]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:8001/api/settings');
            const data = await res.json();
            setApiKey(data.openrouter_api_key || '');
            setIncludeFree(data.include_free_models || false);
            setTimezone(data.timezone || 'America/Los_Angeles');
            setCouncilModels(data.council_models || []);
            setChairmanModel(data.chairman_model || '');
            setDefinitions(data.definitions || {});
        } catch (err) {
            console.error("Failed to fetch settings", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            setLoadingLogs(true);
            const res = await fetch('http://localhost:8001/api/logs');
            const data = await res.json();
            setLogs(data.logs || []);
        } catch (err) {
            console.error("Failed to fetch logs", err);
        } finally {
            setLoadingLogs(false);
        }
    };

    // ... existing save handlers ...
    const handleSave = async () => {
        // ... (unchanged)
        try {
            setSaving(true);
            await fetch('http://localhost:8001/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    openrouter_api_key: apiKey,
                    include_free_models: includeFree,
                    timezone: timezone,
                }),
            });
            if (onSettingsChanged) onSettingsChanged();
            onClose();
        } catch (err) {
            console.error("Failed to save settings", err);
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDefinitions = async () => {
        // ... (unchanged)
        try {
            setSaving(true);
            await fetch('http://localhost:8001/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    openrouter_api_key: apiKey,
                    include_free_models: includeFree,
                    timezone: timezone,
                    definitions: definitions
                }),
            });
            if (onSettingsChanged) onSettingsChanged();
            fetchSettings();
        } catch (err) {
            console.error("Failed to save definitions", err);
            alert("Failed to save definitions");
        } finally {
            setSaving(false);
        }
    };
    // ... end save handlers ...

    const [modelView, setModelView] = useState('active'); // 'active' | 'paid' | 'free'

    // ... helpers and handlers ...
    // Helper to get current displayed list
    const getCurrentList = () => {
        if (modelView === 'active') return councilModels;
        if (modelView === 'paid') return definitions?.paid?.council || [];
        if (modelView === 'free') return definitions?.free?.council || [];
        return [];
    };

    const handleUpdateModel = (group, type, index, newValue) => {
        const newDefs = { ...definitions };
        if (type === 'chairman') {
            newDefs[group].chairman = newValue;
        } else {
            const newCouncil = [...newDefs[group].council];
            newCouncil[index] = newValue;
            newDefs[group].council = newCouncil;
        }
        setDefinitions(newDefs);
    };

    const handleToggleSelect = (model) => {
        if (selectedModels.includes(model)) {
            setSelectedModels(selectedModels.filter(m => m !== model));
        } else {
            setSelectedModels([...selectedModels, model]);
        }
    };

    const handleSelectAll = () => {
        const list = getCurrentList();
        const newSelected = [...new Set([...selectedModels, ...list])];
        setSelectedModels(newSelected);
    };

    const handleDeselectAll = () => {
        setSelectedModels([]);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Settings</h2>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <div className="tabs">
                            <button
                                className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                                onClick={() => setActiveTab('general')}
                            >
                                General
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'models' ? 'active' : ''}`}
                                onClick={() => setActiveTab('models')}
                            >
                                Models
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
                                onClick={() => setActiveTab('logs')}
                            >
                                Logs
                            </button>
                        </div>

                        <div className="tab-content">
                            {activeTab === 'general' ? (
                                <div className="settings-form">
                                    {/* ... General Tab Content ... */}
                                    <div className="form-group">
                                        <label>OpenRouter API Key</label>
                                        <div className="input-with-mask">
                                            <input
                                                type="password"
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                                placeholder="sk-or-v1-..."
                                            />
                                        </div>
                                        <p className="help-text">Key is masked but stored in backend memory.</p>
                                    </div>

                                    <div className="form-group">
                                        <label>Timezone</label>
                                        <select
                                            value={timezone}
                                            onChange={(e) => setTimezone(e.target.value)}
                                            className="timezone-select"
                                        >
                                            <option value="UTC">UTC</option>
                                            <option value="America/Los_Angeles">America/Los_Angeles (Pacific)</option>
                                            <option value="America/New_York">America/New_York (Eastern)</option>
                                            <option value="America/Chicago">America/Chicago (Central)</option>
                                            <option value="Europe/London">Europe/London</option>
                                            <option value="Europe/Paris">Europe/Paris</option>
                                            <option value="Asia/Tokyo">Asia/Tokyo</option>
                                        </select>
                                    </div>

                                    <div className="form-group toggle-group">
                                        <label className="toggle-label">
                                            <span>Use Free Council Only</span>
                                            <div className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={includeFree}
                                                    onChange={(e) => setIncludeFree(e.target.checked)}
                                                />
                                                <span className="slider round"></span>
                                            </div>
                                        </label>
                                        <div className={`status-pill ${includeFree ? 'free' : 'paid'}`}>
                                            {includeFree ? 'FREE CONTEXT' : 'PAID STANDARD'}
                                        </div>
                                    </div>
                                    <p className="help-text">
                                        <strong>ON:</strong> Uses free models (Xiaomi, Mistral, etc.)<br />
                                        <strong>OFF:</strong> Uses paid models (Grok, Gemini, etc.)
                                    </p>
                                </div>
                            ) : activeTab === 'models' ? (
                                <div className="models-list">
                                    {/* ... Models Tab Content ... */}
                                    <div className="sub-tabs">
                                        <button
                                            className={`sub-tab-btn ${modelView === 'active' ? 'active' : ''}`}
                                            onClick={() => setModelView('active')}
                                        >
                                            Active
                                        </button>
                                        <button
                                            className={`sub-tab-btn ${modelView === 'paid' ? 'active' : ''}`}
                                            onClick={() => setModelView('paid')}
                                        >
                                            Paid Models
                                        </button>
                                        <button
                                            className={`sub-tab-btn ${modelView === 'free' ? 'active' : ''}`}
                                            onClick={() => setModelView('free')}
                                        >
                                            Free Models
                                        </button>
                                    </div>

                                    <div className="model-view-content">
                                        <div className="model-section">
                                            <h3>Chairman</h3>
                                            <div className="model-chip chairman">
                                                <EditableModel
                                                    value={modelView === 'active' ? chairmanModel :
                                                        modelView === 'paid' ? definitions?.paid?.chairman :
                                                            definitions?.free?.chairman}
                                                    onSave={(val) => handleUpdateModel(modelView, 'chairman', null, val)}
                                                    editable={modelView !== 'active'}
                                                />
                                            </div>
                                        </div>

                                        <div className="model-section">
                                            <div className="section-header">
                                                <h3>Council Members</h3>
                                                <div className="selection-actions">
                                                    <button className="text-btn" onClick={handleSelectAll}>Select All</button>
                                                    <button className="text-btn" onClick={handleDeselectAll}>Clear</button>
                                                </div>
                                            </div>
                                            <div className="council-grid">
                                                {getCurrentList().map((model, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`model-chip selectable ${selectedModels.includes(model) ? 'selected' : ''}`}
                                                        onClick={() => handleToggleSelect(model)}
                                                    >
                                                        <div className="checkbox-indicator">
                                                            {selectedModels.includes(model) && "✓"}
                                                        </div>
                                                        <EditableModel
                                                            value={model}
                                                            onSave={(val) => handleUpdateModel(modelView, 'council', idx, val)}
                                                            editable={modelView !== 'active'}
                                                            onClick={(e) => e.stopPropagation()} // Prevent selection toggle when editing
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="logs-view">
                                    <div className="logs-header">
                                        <h3>Execution Logs</h3>
                                        <button className="text-btn" onClick={fetchLogs}>Refresh</button>
                                    </div>
                                    <div className="logs-list">
                                        {loadingLogs ? <p>Loading logs...</p> :
                                            logs.length === 0 ? <p className="empty-logs">No logs found.</p> : (
                                                <table className="logs-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Time</th>
                                                            <th>Model</th>
                                                            <th>Status</th>
                                                            <th>Details</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {logs.map((log) => (
                                                            <tr key={log.id}>
                                                                <td className="timestamp">
                                                                    {new Date(log.timestamp).toLocaleTimeString('en-US', { timeZone: timezone })}
                                                                </td>
                                                                <td className="model-name" title={log.model}>{log.model}</td>
                                                                <td>
                                                                    <span className={`status-badge ${log.status}`}>
                                                                        {log.status}
                                                                    </span>
                                                                </td>
                                                                <td className="details" title={log.details}>
                                                                    {log.details}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                <div className="modal-actions">
                    {activeTab === 'models' && (
                        <div className="left-actions">
                            <button
                                className="secondary-btn"
                                disabled={selectedModels.length === 0}
                                onClick={() => setIsTestModalOpen(true)}
                            >
                                Test {selectedModels.length > 0 ? `Selected (${selectedModels.length})` : 'Models'}
                            </button>
                        </div>
                    )}
                    <div className="right-actions">
                        <button onClick={onClose} disabled={saving}>Cancel</button>
                        {activeTab === 'general' && (
                            <button className="primary-btn" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        )}
                        {activeTab === 'models' && modelView !== 'active' && (
                            <button className="primary-btn" onClick={handleSaveDefinitions} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Definitions'}
                            </button>
                        )}
                    </div>
                </div>

                <style jsx>{`
        /* ... existing styles ... */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; padding: 24px; border-radius: 12px; width: 550px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        h2 { margin-top: 0; margin-bottom: 20px; }
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #eee; }
        .tab-btn { background: none; border: none; padding: 8px 16px; cursor: pointer; color: #666; font-weight: 500; border-bottom: 2px solid transparent; }
        .tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; }
        .sub-tabs { display: flex; gap: 8px; margin-bottom: 20px; background: #f1f5f9; padding: 4px; border-radius: 6px; }
        .sub-tab-btn { background: none; border: none; padding: 6px 12px; cursor: pointer; color: #64748b; font-size: 13px; font-weight: 500; border-radius: 4px; flex: 1; }
        .sub-tab-btn.active { background: white; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        
        .toggle-group .toggle-label { display: flex; justify-content: space-between; align-items: center; cursor: pointer; width: 100%; }
        .toggle-switch { position: relative; display: inline-block; width: 50px; height: 24px; margin-left: auto; } /* margin-left auto pushes it right if container is flex */
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #2563eb; }
        input:checked + .slider:before { transform: translateX(26px); }

        .status-pill {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-top: 8px;
        }
        .status-pill.paid { background: #dbeafe; color: #1e40af; }
        .status-pill.free { background: #dcfce7; color: #166534; }

        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: 500; }
        input[type="password"] { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-family: monospace; }
        .timezone-select { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; background: white; }
        .help-text { font-size: 12px; color: #666; margin-top: 4px; }
        .model-section { margin-bottom: 20px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .model-section h3 { font-size: 14px; text-transform: uppercase; color: #666; margin: 0; }
        .text-btn { background: none; border: none; color: #2563eb; cursor: pointer; font-size: 12px; padding: 0 4px; }
        .council-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .model-chip { background: #f3f4f6; padding: 6px 12px; border-radius: 16px; font-size: 13px; font-family: monospace; color: #374151; display: flex; align-items: center; gap: 6px; }
        .model-chip.chairman { background: #e0e7ff; color: #3730a3; display: inline-block; font-weight: 500; }
        .model-chip.selectable { cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
        .model-chip.selectable:hover { background: #e2e8f0; }
        .model-chip.selected { background: #eff6ff; border-color: #2563eb; color: #1e40af; }
        .checkbox-indicator { width: 14px; height: 14px; border-radius: 50%; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 10px; color: white; }
        .selected .checkbox-indicator { background: #2563eb; border-color: #2563eb; }
        .modal-actions { display: flex; justify-content: space-between; margin-top: 24px; padding-top: 20px; border-top: 1px solid #eee; }
        .right-actions { display: flex; gap: 10px; margin-left: auto; }
        button { padding: 8px 16px; border-radius: 6px; border: 1px solid #ddd; background: white; cursor: pointer; }
        button.primary-btn { background: #2563eb; color: white; border: none; }
        button.secondary-btn { background: #f8fafc; color: #334155; border: 1px solid #cbd5e1; font-weight: 500; }
        button:disabled { opacity: 0.7; cursor: not-allowed; }

        /* Editable Styles */
        .editable-container { display: flex; align-items: center; gap: 6px; }
        .edit-icon { opacity: 0; cursor: pointer; font-size: 12px; color: #94a3b8; transition: opacity 0.2s; }
        .model-chip:hover .edit-icon { opacity: 1; }
        .edit-input { border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 4px; font-size: 12px; font-family: monospace; width: 180px; }
        .action-icon { cursor: pointer; font-size: 14px; }
        .action-icon.save { color: #10b981; }
        .action-icon.cancel { color: #ef4444; }

        /* Logs CSS */
        .logs-view { display: flex; flex-direction: column; height: 100%; }
        .logs-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .logs-list { flex: 1; overflow-y: auto; max-height: 400px; border: 1px solid #eee; border-radius: 6px; }
        
        .logs-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .logs-table th { text-align: left; padding: 8px; background: #f8fafc; color: #64748b; font-weight: 500; border-bottom: 1px solid #eee; position: sticky; top: 0; }
        .logs-table td { padding: 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        .logs-table tr:hover { background: #f8fafc; }
        
        .timestamp { font-family: monospace; white-space: nowrap; color: #64748b; }
        .model-name { font-weight: 500; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        
        .status-badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .status-badge.success { background: #dcfce7; color: #166534; }
        .status-badge.error { background: #fee2e2; color: #991b1b; }
        
        .details { color: #475569; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .empty-logs { padding: 20px; text-align: center; color: #94a3b8; }
      `}</style>
            </div>
            <ModelTesterModal
                isOpen={isTestModalOpen}
                onClose={() => setIsTestModalOpen(false)}
                selectedModels={selectedModels}
            />
        </div>
    );
};

export default SettingsModal;
