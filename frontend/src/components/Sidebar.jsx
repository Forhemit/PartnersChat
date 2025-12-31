import { useState, useEffect } from 'react';
import './Sidebar.css';

const Clock = ({ timezone }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time based on timezone
  const timeString = time.toLocaleTimeString('en-US', {
    timeZone: timezone || 'America/Los_Angeles',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Format date
  const dateString = time.toLocaleDateString('en-US', {
    timeZone: timezone || 'America/Los_Angeles',
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="sidebar-clock">
      <div className="clock-time">{timeString}</div>
      <div className="clock-date">{dateString}</div>
    </div>
  );
};

export default function Sidebar({ conversations, currentId, onSelect, onNew, isOpen, onClose, onOpenSettings, timezone }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Conversations</h2>
        <button className="close-sidebar-btn" onClick={onClose}>×</button>
      </div>

      <button className="new-chat-btn" onClick={onNew}>
        + New Conversation
      </button>

      <div className="conversation-list">
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`conversation-item ${conv.id === currentId ? 'active' : ''}`}
            onClick={() => onSelect(conv.id)}
          >
            <div className="conv-title">{conv.title || 'New Conversation'}</div>
            <div className="conv-date">
              {new Date(conv.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <Clock timezone={timezone} />
        <button className="settings-btn" onClick={onOpenSettings} title="Settings">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          Settings
        </button>
      </div>
    </aside>
  );
};
