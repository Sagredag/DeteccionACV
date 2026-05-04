import Card from '../ui/Card';
import Button from '../ui/Button';
import RiskGauge from './RiskGauge';
import ClinicalProfile from './ClinicalProfile';
import { getRiskLevel, RISK_LEVELS, RECOMMENDATIONS, VALUE_LABELS } from '../../constants/formFields';

const SUMMARY_FIELDS = [
  { key: 'age', label: 'Edad', format: (v) => `${v} años` },
  { key: 'gender', label: 'Género' },
  { key: 'hypertension', label: 'Hipertensión' },
  { key: 'heart_disease', label: 'Enf. cardíaca' },
  { key: 'avg_glucose_level', label: 'Glucosa', format: (v) => `${v} mg/dL` },
  { key: 'bmi', label: 'IMC', format: (v) => `${Number(v).toFixed(1)} kg/m²` },
  { key: 'smoking_status', label: 'Fumador' },
  { key: 'Residence_type', label: 'Residencia' },
  { key: 'work_type', label: 'Trabajo' },
  { key: 'ever_married', label: 'Est. civil' },
];

function displayValue(key, raw) {
  const map = VALUE_LABELS[key];
  return map ? (map[raw] ?? map[String(raw)] ?? raw) : raw;
}

function ResultsDashboard({ result, patientData, onNewEvaluation }) {
  const level = getRiskLevel(result.probability);
  const riskInfo = RISK_LEVELS[level];
  const rec = RECOMMENDATIONS[level];
  const pct = Math.round(result.probability * 100);

  const handlePrint = () => window.print();

  return (
    <div className="results">
      {/* Disclaimer */}
      <div className="alert alert--warning">
        <span className="alert__icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </span>
        <span>
          Este informe es una <strong>herramienta de evaluación preliminar</strong>. Consulte siempre
          con un profesional médico calificado para un diagnóstico preciso.
        </span>
      </div>

      <Card elevated>
        {/* Header */}
        <div className="results__header">
          <div>
            <h1 className="results__title">Resultado de la Evaluación</h1>
            <p className="results__subtitle">Sistema de Predicción de Riesgo de Ictus</p>
          </div>
          <span className={`risk-badge risk-badge--${level}`}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: riskInfo.color, display: 'inline-block' }} />
            {riskInfo.label}
          </span>
        </div>

        {/* Three-column grid */}
        <div className="results__grid">

          {/* ── Col 1: Gauge ─────────────────────────────────────────────── */}
          <div className="result-card">
            <div>
              <div className="result-card__label">Evaluación Principal</div>
              <div className="result-card__title">Probabilidad de Ictus</div>
            </div>

            <RiskGauge probability={result.probability} />

            <p className="result-card__description">
              El modelo estima una probabilidad de{' '}
              <strong style={{ color: riskInfo.color }}>{pct}%</strong> de accidente
              cerebrovascular basado en los datos clínicos ingresados.
            </p>

            {/* Confidence note */}
            <div style={{ padding: '0.625rem 0.875rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                Nivel de confianza
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                Modelo de Machine Learning entrenado sobre variables clínicas validadas.
              </div>
            </div>
          </div>

          {/* ── Col 2: Classification ─────────────────────────────────────── */}
          <div className="result-card">
            <div>
              <div className="result-card__label">Clasificación</div>
              <div className="result-card__title">Nivel de Riesgo Detectado</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {(['low', 'medium', 'high']).map((l) => {
                const info = RISK_LEVELS[l];
                const isActive = l === level;
                return (
                  <div
                    key={l}
                    className="risk-tier"
                    style={isActive ? {
                      borderColor: info.color,
                      background: info.bg,
                    } : {}}
                  >
                    <span
                      className="risk-tier__dot"
                      style={{ background: info.color }}
                    />
                    <span
                      className="risk-tier__label"
                      style={{ color: isActive ? info.textColor : 'var(--color-text-secondary)', fontWeight: isActive ? 700 : 500 }}
                    >
                      {info.label}
                    </span>
                    {isActive && (
                      <span className="risk-tier__tag" style={{ color: info.textColor }}>
                        Resultado
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={`recommendation recommendation--${level}`}>
              <div className="recommendation__title">{rec.title}</div>
              <div>{rec.text}</div>
            </div>
          </div>

          {/* ── Col 3: Clinical Profile ───────────────────────────────────── */}
          <div className="result-card">
            <div>
              <div className="result-card__label">Perfil Clínico</div>
              <div className="result-card__title">Factores del Paciente</div>
            </div>

            <ClinicalProfile patientData={patientData} />

            <p className="result-card__description">
              Las barras muestran el nivel relativo de cada indicador dentro de los rangos
              clínicos de referencia. Verde = bajo riesgo, amarillo = moderado, rojo = elevado.
            </p>
          </div>
        </div>

        {/* Patient data summary */}
        <div className="patient-summary">
          <div className="patient-summary__title">Datos del Paciente Evaluado</div>
          <div className="patient-summary__grid">
            {SUMMARY_FIELDS.map(({ key, label, format }) => {
              const raw = patientData?.[key];
              if (raw === undefined || raw === '') return null;
              const displayed = format ? format(raw) : displayValue(key, raw);
              return (
                <div key={key} className="patient-summary__item">
                  <div className="patient-summary__item-label">{label}</div>
                  <div className="patient-summary__item-value">{displayed}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="results__actions">
          <Button variant="ghost" onClick={handlePrint}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
            </svg>
            Imprimir Informe
          </Button>
          <Button variant="outline" onClick={onNewEvaluation}>
            ← Nueva Evaluación
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ResultsDashboard;
