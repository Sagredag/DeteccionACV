// Definición declarativa del formulario.
// Los `value` de cada opción son exactamente los que espera el modelo.

export const FORM_SECTIONS = [
  {
    id: 'personal',
    title: 'Información Personal',
    fields: [
      {
        id: 'age',
        label: 'Edad',
        type: 'number',
        placeholder: '45',
        unit: 'años',
        min: 1,
        max: 120,
        required: true,
        hint: 'Edad del paciente en años completos',
      },
      {
        id: 'gender',
        label: 'Género',
        type: 'radio',
        required: true,
        options: [
          { label: 'Masculino', value: 'Male' },
          { label: 'Femenino', value: 'Female' },
          { label: 'Otro', value: 'Other' },
        ],
      },
      {
        id: 'ever_married',
        label: 'Estado Civil',
        type: 'radio',
        required: true,
        options: [
          { label: 'Casado/a', value: 'Yes' },
          { label: 'Soltero/a', value: 'No' },
        ],
      },
    ],
  },
  {
    id: 'medical',
    title: 'Historial Médico',
    fields: [
      {
        id: 'hypertension',
        label: 'Hipertensión Arterial',
        type: 'radio',
        required: true,
        hint: '¿Tiene diagnóstico de hipertensión?',
        options: [
          { label: 'Sí', value: 1 },
          { label: 'No', value: 0 },
        ],
      },
      {
        id: 'heart_disease',
        label: 'Enfermedad Cardíaca',
        type: 'radio',
        required: true,
        hint: '¿Tiene antecedentes de cardiopatía?',
        options: [
          { label: 'Sí', value: 1 },
          { label: 'No', value: 0 },
        ],
      },
      {
        id: 'work_type',
        label: 'Tipo de Trabajo',
        type: 'select',
        required: true,
        options: [
          { label: 'Seleccionar...', value: '' },
          { label: 'Empleado privado', value: 'Private' },
          { label: 'Autoempleado', value: 'Self-employed' },
          { label: 'Empleado público', value: 'Govt_job' },
          { label: 'Menor de edad', value: 'children' },
          { label: 'Nunca ha trabajado', value: 'Never_worked' },
        ],
      },
      {
        id: 'Residence_type',
        label: 'Tipo de Residencia',
        type: 'radio',
        required: true,
        options: [
          { label: 'Urbana', value: 'Urban' },
          { label: 'Rural', value: 'Rural' },
        ],
      },
    ],
  },
  {
    id: 'clinical',
    title: 'Indicadores Clínicos',
    fields: [
      {
        id: 'avg_glucose_level',
        label: 'Glucosa Promedio en Sangre',
        type: 'number',
        placeholder: '100',
        unit: 'mg/dL',
        min: 50,
        max: 500,
        step: '0.1',
        required: true,
        hint: 'Nivel de glucosa en ayunas',
      },
      {
        id: 'bmi',
        label: 'Índice de Masa Corporal (IMC)',
        type: 'number',
        placeholder: '25.0',
        unit: 'kg/m²',
        min: 10,
        max: 100,
        step: '0.1',
        required: true,
        hint: 'Peso (kg) ÷ Talla² (m)',
      },
      {
        id: 'smoking_status',
        label: 'Estado de Fumador',
        type: 'select',
        required: true,
        options: [
          { label: 'Seleccionar...', value: '' },
          { label: 'Nunca fumó', value: 'never smoked' },
          { label: 'Antes fumaba', value: 'formerly smoked' },
          { label: 'Fuma actualmente', value: 'smokes' },
          { label: 'Desconocido', value: 'Unknown' },
        ],
      },
    ],
  },
];

// ─── Risk classification ───────────────────────────────────────────────────

export const RISK_LEVELS = {
  low: {
    key: 'low',
    label: 'Riesgo Bajo',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    textColor: '#065F46',
  },
  medium: {
    key: 'medium',
    label: 'Riesgo Moderado',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    textColor: '#92400E',
  },
  high: {
    key: 'high',
    label: 'Riesgo Alto',
    color: '#EF4444',
    bg: '#FEF2F2',
    border: '#FECACA',
    textColor: '#991B1B',
  },
};

export function getRiskLevel(probability) {
  if (probability < 0.3) return 'low';
  if (probability < 0.6) return 'medium';
  return 'high';
}

export const RECOMMENDATIONS = {
  low: {
    title: 'Bajo riesgo detectado',
    text: 'Los indicadores clínicos sugieren un riesgo reducido de ictus. Se recomienda mantener hábitos saludables, actividad física regular y controles médicos periódicos.',
  },
  medium: {
    title: 'Riesgo moderado — atención recomendada',
    text: 'Se detectaron factores de riesgo que merecen seguimiento médico. Se recomienda consultar con un profesional para ajustar tratamiento o hábitos preventivos.',
  },
  high: {
    title: 'Riesgo elevado — consulte un médico',
    text: 'Los indicadores sugieren un riesgo elevado de accidente cerebrovascular. Se recomienda buscar evaluación médica especializada a la brevedad para intervención preventiva.',
  },
};

// Mapa de traducción para mostrar valores en la UI
export const VALUE_LABELS = {
  gender: { Male: 'Masculino', Female: 'Femenino', Other: 'Otro' },
  ever_married: { Yes: 'Casado/a', No: 'Soltero/a' },
  work_type: {
    Private: 'Empleado privado',
    'Self-employed': 'Autoempleado',
    Govt_job: 'Empleado público',
    children: 'Menor de edad',
    Never_worked: 'Nunca trabajó',
  },
  Residence_type: { Urban: 'Urbana', Rural: 'Rural' },
  smoking_status: {
    'never smoked': 'Nunca fumó',
    'formerly smoked': 'Antes fumaba',
    smokes: 'Fuma actualmente',
    Unknown: 'Desconocido',
  },
  hypertension: { 0: 'No', 1: 'Sí', '0': 'No', '1': 'Sí' },
  heart_disease: { 0: 'No', 1: 'Sí', '0': 'No', '1': 'Sí' },
};
