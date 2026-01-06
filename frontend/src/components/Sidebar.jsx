import { useState, useEffect, useMemo } from 'react';
import { Moon, Sun, Settings, Search, X } from 'lucide-react';
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

export default function Sidebar({ conversations, currentId, onSelect, onNew, isOpen, onClose, onOpenSettings, timezone, theme, toggleTheme }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const lowerQuery = searchQuery.toLowerCase();
    return conversations.filter(conv =>
      (conv.title && conv.title.toLowerCase().includes(lowerQuery))
    );
  }, [conversations, searchQuery]);

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/PartnerChatLogo2.png" alt="PartnersChat Logo" />
        </div>
        <div className="header-title-row">
          <h2>Conversations</h2>
          <button className="close-sidebar-btn" onClick={onClose}>×</button>
        </div>
      </div>

      <button className="new-chat-btn" onClick={onNew}>
        + New Conversation
      </button>

      <div className="search-container">
        <Search className="search-icon" size={14} />
        <input
          type="text"
          className="sidebar-search"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
            <X size={12} />
          </button>
        )}
      </div>

      <div className="conversation-list">
        {filteredConversations.length === 0 && searchQuery ? (
          <div className="no-results">No matches found</div>
        ) : (
          filteredConversations.map(conv => (
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
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <Clock timezone={timezone} />

        <div className="footer-actions">
          <button className="footer-btn theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="footer-btn settings-btn" onClick={onOpenSettings} title="Settings">
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
