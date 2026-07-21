import styles from './SplitModalV5.module.css';

const OPTIONS = [
  {
    id: 'attribute-values',
    label: 'Existing attribute values (recommended for most hierarchies)',
  },
  {
    id: 'rules',
    label: 'Rules (for advanced classifications).',
  },
];

export default function SplitMethodChooser({ value, onChange, name = 'hierarchy-creation-method' }) {
  return (
    <fieldset className={styles.methodFieldset}>
      <legend className={styles.methodLegend}>How would you like to define this hierarchy?</legend>
      <div className={styles.methodRadioList}>
        {OPTIONS.map((option) => (
          <label key={option.id} className={styles.methodRadioRow}>
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
            />
            <span className={styles.methodRadioLabel}>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
