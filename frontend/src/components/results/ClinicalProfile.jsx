// Normaliza cada variable clínica a un porcentaje (0-100) para la barra visual.
// Los rangos están basados en valores clínicos de referencia típicos.

const FACTORS = [
  {
    id: 'age',
    label: 'Edad',
    format: (v) => `${v} años`,
    normalize: (v) => Math.min(100, (Number(v) / 100) * 100),
  },
  {
    id: 'avg_glucose_level',
    label: 'Glucosa promedio',
    format: (v) => `${v} mg/dL`,
    // Normal: ~70-100 mg/dL → riesgo sube a partir de 126+
    normalize: (v) => Math.min(100, Math.max(0, ((Number(v) - 50) / 350) * 100)),
  },
  {
    id: 'bmi',
    label: 'IMC',
    format: (v) => `${Number(v).toFixed(1)} kg/m²`,
    // Normal: 18.5-24.9 → riesgo sube con obesidad
    normalize: (v) => Math.min(100, Math.max(0, ((Number(v) - 10) / 50) * 100)),
  },
  {
    id: 'hypertension',
    label: 'Hipertensión',
    format: (v) => (Number(v) === 1 ? 'Sí' : 'No'),
    normalize: (v) => (Number(v) === 1 ? 100 : 0),
  },
  {
    id: 'heart_disease',
    label: 'Enf. cardíaca',
    format: (v) => (Number(v) === 1 ? 'Sí' : 'No'),
    normalize: (v) => (Number(v) === 1 ? 100 : 0),
  },
];

function barColor(pct) {
  if (pct < 35) return '#10B981';
  if (pct < 65) return '#F59E0B';
  return '#EF4444';
}

function ClinicalProfile({ patientData }) {
  if (!patientData) return null;

  return (
    <div className="clinical-profile">
      {FACTORS.map(({ id, label, format, normalize }) => {
        const raw = patientData[id];
        if (raw === undefined || raw === '') return null;
        const pct = normalize(raw);
        return (
          <div key={id} className="clinical-factor">
            <div className="clinical-factor__header">
              <span className="clinical-factor__name">{label}</span>
              <span className="clinical-factor__value">{format(raw)}</span>
            </div>
            <div className="clinical-factor__track">
              <div
                className="clinical-factor__fill"
                style={{ width: `${pct}%`, background: barColor(pct) }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ClinicalProfile;
