import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormSection from './FormSection';
import { FORM_SECTIONS } from '../../constants/formFields';

const INITIAL_VALUES = {
  age: '',
  gender: '',
  ever_married: '',
  hypertension: '',
  heart_disease: '',
  work_type: '',
  Residence_type: '',
  avg_glucose_level: '',
  bmi: '',
  smoking_status: '',
};

function PatientForm({ onSubmit, loading, error }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});

  const handleChange = (id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const validate = () => {
    const next = {};
    FORM_SECTIONS.forEach((section) =>
      section.fields.forEach((field) => {
        const v = values[field.id];
        if (field.required && (v === '' || v === null || v === undefined)) {
          next[field.id] = 'Campo requerido';
        }
      })
    );
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Convertir strings numéricos a numbers antes de enviar al API
    onSubmit({
      ...values,
      age: Number(values.age),
      hypertension: Number(values.hypertension),
      heart_disease: Number(values.heart_disease),
      avg_glucose_level: Number(values.avg_glucose_level),
      bmi: Number(values.bmi),
    });
  };

  const totalFields = FORM_SECTIONS.flatMap((s) => s.fields).length;
  const filledFields = FORM_SECTIONS.flatMap((s) => s.fields).filter(
    (f) => values[f.id] !== '' && values[f.id] !== null && values[f.id] !== undefined
  ).length;
  const progress = Math.round((filledFields / totalFields) * 100);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card elevated>
        {/* Header */}
        <div className="patient-form__header">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 className="patient-form__title">Evaluación de Riesgo de Ictus</h1>
              <p className="patient-form__subtitle">
                Complete los datos clínicos del paciente para obtener la predicción de riesgo.
              </p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Completado
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {progress}%
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: '1rem', height: '4px', background: '#E5E7EB', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'var(--color-primary)',
                borderRadius: '999px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="patient-form__body">
          {FORM_SECTIONS.map((section) => (
            <FormSection
              key={section.id}
              section={section}
              values={values}
              onChange={handleChange}
              errors={errors}
            />
          ))}

          {error && (
            <div className="alert alert--error">
              <span className="alert__icon">⚠</span>
              <div>
                <strong>Error al procesar la solicitud</strong>
                <div style={{ marginTop: '0.2rem' }}>{error}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="patient-form__footer">
          <span className="patient-form__footer-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Los datos no se almacenan de forma permanente.
          </span>
          <Button type="submit" size="lg" loading={loading}>
            {loading ? 'Analizando...' : 'Predecir Riesgo →'}
          </Button>
        </div>
      </Card>
    </form>
  );
}

export default PatientForm;
