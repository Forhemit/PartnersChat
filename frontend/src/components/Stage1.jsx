import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModelAvatar from './ModelAvatar';
import { getModelIdentity } from '../utils/modelIdentity';
import { useToast } from '../context/ToastContext';
import ResponseBadges from './ResponseBadges';
import './Stage1.css';

export default function Stage1({ responses }) {
  const [activeTab, setActiveTab] = useState(0);
  const { addToast } = useToast();

  if (!responses || responses.length === 0) {
    return null;
  }

  const handleCopy = () => {
    const text = responses[activeTab].response;
    navigator.clipboard.writeText(text);
    addToast('Response copied to clipboard', 'success');
  };

  return (
    <div className="stage stage1">
      <h3 className="stage-title">Stage 1: Individual Responses</h3>

      <div className="tabs">
        {responses.map((resp, index) => {
          const isActive = activeTab === index;
          const identity = getModelIdentity(resp.model);

          return (
            <button
              key={index}
              className={`tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
              style={isActive ? { borderColor: identity.color, color: identity.color } : {}}
            >
              <div className="tab-inner" style={{ position: 'relative', zIndex: 2 }}>
                <ModelAvatar modelId={resp.model} size={16} />
                <span>{identity.name}</span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="activeTabStage1"
                  className="tab-highlight"
                  style={{
                    position: 'absolute',
                    top: -1, left: -1, right: -1, bottom: -1,
                    borderTop: `3px solid ${identity.color}`,
                    borderRadius: '8px 8px 0 0',
                    background: 'var(--bg-secondary)',
                    zIndex: 1
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <motion.div
        layout
        className="tab-content"
        style={{
          borderTopColor: getModelIdentity(responses[activeTab].model).color
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="content-header">
          <div className="model-info">
            <ModelAvatar modelId={responses[activeTab].model} size={24} />
            <div className="model-name-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="model-provider">{getModelIdentity(responses[activeTab].model).name}</span>
                <ResponseBadges text={responses[activeTab].response} />
              </div>
              <span className="model-id">{responses[activeTab].model.split('/')[1] || responses[activeTab].model}</span>
            </div>
          </div>
          <button className="copy-btn" onClick={handleCopy} title="Copy to clipboard">
            <Copy size={14} />
            Copy
          </button>
        </div>
        <div className="response-text markdown-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ReactMarkdown>{responses[activeTab].response}</ReactMarkdown>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
