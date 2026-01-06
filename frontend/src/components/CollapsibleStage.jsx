import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './CollapsibleStage.css';

export default function CollapsibleStage({ title, children, defaultOpen = true, icon }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="collapsible-stage">
            <button
                className="stage-header-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="stage-header-left">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    {icon && <span className="stage-icon">{icon}</span>}
                    <span className="stage-header-title">{title}</span>
                </div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="stage-content-wrapper">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
