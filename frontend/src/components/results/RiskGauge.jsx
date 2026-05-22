import { useEffect, useState } from 'react';
import { getRiskLevel, RISK_LEVELS } from '../../constants/formFields';

const SIZE = 164;
const STROKE = 14;
const R = SIZE / 2 - STROKE / 2;
const CIRC = 2 * Math.PI * R;

function RiskGauge({ probability }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(probability), 80);
    return () => clearTimeout(t);
  }, [probability]);

  const level = getRiskLevel(probability);
  const { color } = RISK_LEVELS[level];
  const offset = CIRC - animated * CIRC;

  return (
    <div className="risk-gauge">
      <div className="risk-gauge__chart" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE}>
          {/* Track */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none" stroke="#F3F4F6" strokeWidth={STROKE}
          />
          {/* Progress */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            style={{ transition: 'stroke-dashoffset 0.85s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="risk-gauge__center">
          <span className="risk-gauge__percentage" style={{ color }}>
            {Math.round(probability * 100)}%
          </span>
          <span className="risk-gauge__sublabel">Probabilidad</span>
        </div>
      </div>
    </div>
  );
}

export default RiskGauge;
