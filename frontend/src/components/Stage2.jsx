import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, List } from 'lucide-react';
import ModelAvatar from './ModelAvatar';
import { getModelIdentity } from '../utils/modelIdentity';
import ResponseBadges from './ResponseBadges';
import './Stage2.css';

function deAnonymizeText(text, labelToModel) {
  if (!labelToModel) return text;

  let result = text;
  // Replace each "Response X" with the actual model name
  Object.entries(labelToModel).forEach(([label, model]) => {
    const modelShortName = model.split('/')[1] || model;
    result = result.replace(new RegExp(label, 'g'), `**${modelShortName}**`);
  });
  return result;
}

export default function Stage2({ rankings, labelToModel, aggregateRankings }) {
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'evals'

  if (!rankings || rankings.length === 0) {
    return null;
  }

  // Calculate 1st place votes
  const firstPlaceVotes = useMemo(() => {
    const votes = {};
    if (!labelToModel) return votes;

    // Initialize
    Object.keys(labelToModel).forEach(label => {
      votes[label] = 0;
    });

    rankings.forEach(rank => {
      if (rank.parsed_ranking && rank.parsed_ranking.length > 0) {
        const firstChoice = rank.parsed_ranking[0];
        if (votes[firstChoice] !== undefined) {
          votes[firstChoice]++;
        }
      }
    });

    // Transform to array and sort
    return Object.entries(votes)
      .map(([label, count]) => ({
        label,
        model: labelToModel[label],
        count
      }))
      .sort((a, b) => b.count - a.count);
  }, [rankings, labelToModel]);

  const maxVotes = Math.max(...firstPlaceVotes.map(v => v.count), 1);

  return (
    <div className="stage stage2">
      <div className="stage2-header">
        <h3 className="stage-title">Stage 2: Peer Rankings</h3>
        <div className="view-toggles">
          <button
            className={`view-btn ${viewMode === 'chart' ? 'active' : ''}`}
            onClick={() => setViewMode('chart')}
            title="Council Chamber View"
          >
            <BarChart2 size={16} />
          </button>
          <button
            className={`view-btn ${viewMode === 'evals' ? 'active' : ''}`}
            onClick={() => setViewMode('evals')}
            title="Detailed Evaluations"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'chart' ? (
          <motion.div
            key="chart"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="council-chamber"
          >
            <div className="voting-section">
              <h4>1st Place Votes</h4>
              <div className="vote-chart">
                {firstPlaceVotes.map((vote, idx) => {
                  const identity = getModelIdentity(vote.model);
                  return (
                    <motion.div
                      key={idx}
                      className="vote-bar-row"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: '100%' }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="vote-label">
                        <ModelAvatar modelId={vote.model} size={20} />
                        <span className="vote-model-name">{identity.name}</span>
                      </div>
                      <div className="vote-track">
                        <motion.div
                          className="vote-bar"
                          style={{ backgroundColor: identity.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(vote.count / maxVotes) * 100}%` }}
                          transition={{ type: "spring", stiffness: 50, delay: 0.2 + (idx * 0.1) }}
                        >
                          <span className="vote-count">{vote.count > 0 ? vote.count : ''}</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {aggregateRankings && aggregateRankings.length > 0 && (
              <div className="scoreboard-section">
                <h4>Aggregate Scoreboard</h4>
                <div className="aggregate-list">
                  {aggregateRankings.map((agg, index) => {
                    const identity = getModelIdentity(agg.model);
                    return (
                      <motion.div
                        key={index}
                        className="aggregate-item"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + (index * 0.15) }}
                      >
                        <div className="rank-position" style={{ color: identity.color }}>#{index + 1}</div>
                        <div className="rank-model">
                          <ModelAvatar modelId={agg.model} size={24} />
                          <span className="model-name-score">{identity.name}</span>
                        </div>
                        <div className="rank-metrics">
                          <span className="rank-score">Avg Rank: {agg.average_rank.toFixed(2)}</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="evals"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="evaluations-view"
          >
            <p className="stage-description">
              Raw peer evaluations. Models used anonymous labels "Response A/B/..." to prevent bias.
            </p>

            <div className="tabs">
              {rankings.map((rank, index) => {
                const isActive = activeTab === index;
                const identity = getModelIdentity(rank.model);
                return (
                  <button
                    key={index}
                    className={`tab ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(index)}
                    style={isActive ? { borderColor: identity.color, color: identity.color } : {}}
                  >
                    <div className="tab-inner" style={{ position: 'relative', zIndex: 2 }}>
                      <ModelAvatar modelId={rank.model} size={16} />
                      <span>{identity.name}</span>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabStage2"
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
                borderTopColor: getModelIdentity(rankings[activeTab].model).color
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="content-header">
                <div className="model-info">
                  <ModelAvatar modelId={rankings[activeTab].model} size={24} />
                  <div className="model-name-text">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="model-provider">{getModelIdentity(rankings[activeTab].model).name}</span>
                      <ResponseBadges text={rankings[activeTab].ranking} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="ranking-content markdown-content">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ReactMarkdown>
                      {deAnonymizeText(rankings[activeTab].ranking, labelToModel)}
                    </ReactMarkdown>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
