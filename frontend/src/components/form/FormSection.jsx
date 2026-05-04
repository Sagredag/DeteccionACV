import FormField from './FormField';

function FormSection({ section, values, onChange, errors }) {
  return (
    <div>
      <div className="form-section__title">{section.title}</div>
      <div className="form-section__grid">
        {section.fields.map((field) => (
          <FormField
            key={field.id}
            field={field}
            value={values[field.id] ?? ''}
            onChange={onChange}
            error={errors?.[field.id]}
          />
        ))}
      </div>
    </div>
  );
}

export default FormSection;
