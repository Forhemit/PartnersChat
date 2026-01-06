import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Hammer } from 'lucide-react'; // Removed Check
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import ModelAvatar from './ModelAvatar';
import { getModelIdentity } from '../utils/modelIdentity';
import { useToast } from '../context/ToastContext';
import './Stage3.css';

export default function Stage3({ finalResponse }) {
  const [showGavel, setShowGavel] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    if (finalResponse) {
      // Trigger confetti on mount
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Hide gavel icon after animation
      const timer = setTimeout(() => setShowGavel(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [finalResponse]);

  if (!finalResponse) {
    return null;
  }

  const identity = getModelIdentity(finalResponse.model);

  const handleCopy = () => {
    navigator.clipboard.writeText(finalResponse.response);
    addToast('Final answer copied to clipboard', 'success');
  };

  return (
    <div className="stage stage3">
      <div className="stage3-header">
        <h3 className="stage-title">Stage 3: Final Council Answer</h3>
        <motion.div
          initial={{ rotate: -45, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
          className="gavel-icon"
        >
          <Hammer size={24} color={identity.color} />
        </motion.div>
      </div>

      <motion.div
        className="final-response"
        style={{ borderColor: identity.color, backgroundColor: identity.bgTint }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="content-header">
          <div className="chairman-info">
            <span className="chairman-badge" style={{ backgroundColor: identity.color }}>Chairman</span>
            <div className="chairman-details">
              <ModelAvatar modelId={finalResponse.model} size={20} />
              <span className="chairman-name" style={{ color: identity.color }}>
                {identity.name}: {finalResponse.model.split('/')[1]}
              </span>
            </div>
          </div>
          <button className="copy-btn" onClick={handleCopy} title="Copy to clipboard">
            <Copy size={14} />
            Copy
          </button>
        </div>
        <div className="final-text markdown-content">
          <ReactMarkdown>{finalResponse.response}</ReactMarkdown>
        </div>
      </motion.div>
    </div>
  );
}
