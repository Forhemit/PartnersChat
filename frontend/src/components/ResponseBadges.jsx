import { Code, FileText, Zap, Feather } from 'lucide-react';
import './ResponseBadges.css';

export default function ResponseBadges({ text }) {
    if (!text) return null;

    const badges = [];

    // Heuristic: Code-heavy
    if ((text.match(/```/g) || []).length >= 2) {
        badges.push({ label: 'Code', icon: Code, color: 'var(--primary-color)' });
    }

    // Heuristic: Length
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 300) {
        badges.push({ label: 'Detailed', icon: FileText, color: '#8b5cf6' }); // Violet
    } else if (wordCount < 50) {
        badges.push({ label: 'Concise', icon: Zap, color: '#f59e0b' }); // Amber
    }

    // Heuristic: Creative (contains bullet points or extensive formatting)
    if ((text.match(/^[-*] /gm) || []).length > 5) {
        // Only add if not already detailed to avoid clutter, or add diverse badges
        if (!badges.find(b => b.label === 'Detailed')) {
            badges.push({ label: 'Structured', icon: Feather, color: '#10b981' }); // Emerald
        }
    }

    if (badges.length === 0) return null;

    return (
        <div className="response-badges">
            {badges.map((badge, idx) => {
                const Icon = badge.icon;
                return (
                    <span
                        key={idx}
                        className="quality-badge"
                        style={{
                            color: badge.color,
                            borderColor: badge.color,
                            backgroundColor: `color-mix(in srgb, ${badge.color} 10%, transparent)`
                        }}
                        title={badge.label}
                    >
                        <Icon size={10} strokeWidth={2.5} />
                        {badge.label}
                    </span>
                );
            })}
            <span className="word-count-badge">
                {wordCount} words
            </span>
        </div>
    );
}
