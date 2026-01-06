import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share } from 'lucide-react';
import Stage1 from './Stage1';
import Stage2 from './Stage2';
import Stage3 from './Stage3';
import ProgressIndicator from './ProgressIndicator';
import CollapsibleStage from './CollapsibleStage';
import { useToast } from '../context/ToastContext';
import './ChatInterface.css';

export default function ChatInterface({
  conversation,
  onSendMessage,
  isLoading,
  inputRef
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { addToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleExport = () => {
    if (!conversation) return;

    let content = `# ${conversation.title || 'LLM Council Session'}\n\n`;
    content += `Date: ${new Date(conversation.created_at).toLocaleString()}\n\n`;

    conversation.messages.forEach(msg => {
      content += `## ${msg.role === 'user' ? 'User' : 'LLM Council'}\n\n`;
      if (msg.role === 'user') {
        content += `${msg.content}\n\n`;
      } else {
        if (msg.stage3) {
          content += `### Final Verdict\n${msg.stage3.response}\n\n`;
        } else if (msg.stage1) {
          // Fallback if no final verdict
          content += `(In progress...)\n\n`;
        }
      }
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `council-session-${conversation.id.slice(0, 8)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast('Conversation exported to Markdown', 'success');
  };

  // Helper to determine progress state
  const getProgressState = (msg) => {
    if (!msg.loading) return null;

    if (msg.loading.stage1) return { stage: 'stage1', status: 'loading' };
    if (msg.loading.stage2) return { stage: 'stage2', status: 'loading' };
    if (msg.loading.stage3) return { stage: 'stage3', status: 'loading' };

    if (msg.stage3) return { stage: 'stage3', status: 'complete' };

    return null;
  };

  if (!conversation) {
    return (
      <div className="chat-interface">
        <div className="empty-state">
          <h2>Welcome to LLM Council</h2>
          <p>Create a new conversation to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="header-info">
          <h2>{conversation.title || 'New Conversation'}</h2>
          <span className="msg-count">{conversation.messages.length} messages</span>
        </div>
        <button className="export-btn" onClick={handleExport} title="Export Conversation">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      <div className="messages-container">
        {conversation.messages.length === 0 ? (
          <div className="empty-state">
            <h2>Start a conversation</h2>
            <p>Ask a question to consult the LLM Council</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {conversation.messages.map((msg, index) => {
              const progress = getProgressState(msg);

              return (
                <motion.div
                  key={index}
                  className="message-group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {msg.role === 'user' ? (
                    <div className="user-message">
                      <div className="message-label">You</div>
                      <div className="message-content">
                        <div className="markdown-content">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="assistant-message">
                      <div className="message-label">LLM Council</div>

                      {/* Stage 1 Content */}
                      {msg.stage1 && (
                        <motion.div
                          initial={{ opacity: 0, rotateX: 10 }}
                          animate={{ opacity: 1, rotateX: 0 }}
                        >
                          <CollapsibleStage title="Stage 1: Individual Responses">
                            <Stage1 responses={msg.stage1} />
                          </CollapsibleStage>
                        </motion.div>
                      )}

                      {/* Stage 2 Content */}
                      {msg.stage2 && (
                        <motion.div
                          initial={{ opacity: 0, rotateX: 10 }}
                          animate={{ opacity: 1, rotateX: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <CollapsibleStage title="Stage 2: Peer Rankings">
                            <Stage2
                              rankings={msg.stage2}
                              labelToModel={msg.metadata?.label_to_model}
                              aggregateRankings={msg.metadata?.aggregate_rankings}
                            />
                          </CollapsibleStage>
                        </motion.div>
                      )}

                      {/* Stage 3 Content */}
                      {msg.stage3 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        >
                          {/* Stage 3 is the final verdict, usually invalid to collapse it immediately, but consistent UI is good. Maybe keep it open or just distinct? Let's use Collapsible but open. */}
                          <CollapsibleStage title="Stage 3: Final Verdict">
                            <Stage3 finalResponse={msg.stage3} />
                          </CollapsibleStage>
                        </motion.div>
                      )}

                      {/* Progress Indicator */}
                      <AnimatePresence>
                        {progress && progress.status === 'loading' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <ProgressIndicator
                              currentStage={progress.stage}
                              status={progress.status}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {isLoading && conversation.messages.length === 0 && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>Consulting the council...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="input-form" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          className="message-input"
          placeholder="Ask your question... (Shift+Enter for new line, Enter to send)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={3}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!input.trim() || isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
}
