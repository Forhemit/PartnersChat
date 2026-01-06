import { useEffect } from 'react';

export function useKeyboardShortcuts({
    onEscape,
    onSlash,
    onMetaEnter
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Escape to close things or open settings (if defined)
            if (e.key === 'Escape' && onEscape) {
                onEscape();
            }

            // / to focus input
            if (e.key === '/' && onSlash && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                onSlash();
            }

            // Cmd+Enter or Ctrl+Enter to send (often handled locally by input, but exposed here if needed)
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && onMetaEnter) {
                onMetaEnter();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onEscape, onSlash, onMetaEnter]);
}
