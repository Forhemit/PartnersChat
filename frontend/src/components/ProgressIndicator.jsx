import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import './ProgressIndicator.css';

const steps = [
    { id: 'stage1', label: 'Individual Responses' },
    { id: 'stage2', label: 'Peer Review' },
    { id: 'stage3', label: 'Final Verdict' }
];

export default function ProgressIndicator({ currentStage, status }) {
    // status: 'loading' | 'complete'

    const getCurrentStepIndex = () => {
        if (currentStage === 'stage3' && status === 'complete') return 3;
        const idx = steps.findIndex(s => s.id === currentStage);
        return idx === -1 ? 0 : idx;
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
        <div className="progress-container">
            <div className="progress-track">
                <motion.div
                    className="progress-bar-fill"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>

            <div className="steps-row">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step.id} className={`step-item ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                            <div className="step-circle">
                                {isCompleted ? (
                                    <Check size={14} strokeWidth={3} />
                                ) : isCurrent ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <div className="step-dot" />
                                )}
                            </div>
                            <span className="step-label">{step.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
