import React from 'react';
import { Check, Clock, Truck, FlaskConical, Brain, Package } from 'lucide-react';

const stepIcons = {
  1: Package,
  2: Truck,
  3: FlaskConical,
  4: Brain,
};

const stepNames = {
  1: 'Collection',
  2: 'Transport',
  3: 'Sequencing',
  4: 'AI Analysis',
};

const Timeline = ({ timeline, currentStep }) => {
  const allSteps = [1, 2, 3, 4];

  return (
    <div style={styles.container}>
      {allSteps.map((step, index) => {
        const timelineEntry = timeline?.find(t => t.step === step);
        const isCompleted = timelineEntry?.verified;
        const isCurrent = step === currentStep;
        const isPending = step > currentStep;
        const Icon = stepIcons[step];

        return (
          <React.Fragment key={step}>
            <div style={styles.stepContainer}>
              <div style={{
                ...styles.iconWrapper,
                ...(isCompleted ? styles.completed : {}),
                ...(isCurrent ? styles.current : {}),
                ...(isPending ? styles.pending : {}),
              }}>
                {isCompleted ? <Check size={20} /> : <Icon size={20} />}
              </div>
              <div style={styles.stepInfo}>
                <span style={{
                  ...styles.stepName,
                  color: isCompleted ? '#10b981' : isCurrent ? '#6366f1' : '#64748b'
                }}>
                  {stepNames[step]}
                </span>
                {timelineEntry && (
                  <>
                    <span style={styles.timestamp}>
                      {new Date(timelineEntry.timestamp).toLocaleString()}
                    </span>
                    <div style={styles.hashContainer}>
                      <span style={styles.hashLabel}>Hash:</span>
                      <span style={styles.hash}>{timelineEntry.hash.substring(0, 16)}...</span>
                    </div>
                  </>
                )}
                {isPending && (
                  <span style={styles.pendingText}>
                    <Clock size={12} /> Pending
                  </span>
                )}
              </div>
            </div>
            {index < allSteps.length - 1 && (
              <div style={{
                ...styles.connector,
                background: isCompleted ? 'linear-gradient(180deg, #10b981, #10b981)' : 
                           'linear-gradient(180deg, rgba(99, 102, 241, 0.3), rgba(99, 102, 241, 0.1))'
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  stepContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.3s ease',
  },
  completed: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
  },
  current: {
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    color: 'white',
    boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  pending: {
    background: 'rgba(100, 116, 139, 0.2)',
    color: '#64748b',
    border: '2px dashed rgba(100, 116, 139, 0.3)',
  },
  stepInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingTop: '4px',
  },
  stepName: {
    fontSize: '16px',
    fontWeight: '600',
  },
  timestamp: {
    fontSize: '12px',
    color: '#64748b',
  },
  hashContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
  },
  hashLabel: {
    fontSize: '11px',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  hash: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#a5b4fc',
    background: 'rgba(99, 102, 241, 0.1)',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  pendingText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#64748b',
  },
  connector: {
    width: '2px',
    height: '40px',
    marginLeft: '23px',
    borderRadius: '2px',
  },
};

export default Timeline;
