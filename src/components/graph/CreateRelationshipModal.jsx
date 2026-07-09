import { useEffect, useMemo, useState } from 'react';
import { eventSources, objects } from '../../data/mockData';
import styles from './CreateRelationshipModal.module.css';

const REL_TYPES = [
  { id: 'o2o', label: 'O2O', description: 'Object to Object' },
  { id: 'o2e', label: 'O2E', description: 'Object to Event' },
];

const CARDINALITIES = ['1:1', '1:N', 'N:1', 'N:M'];

const OBJECT_KEYS = {
  customer: ['CustomerID', 'CustomerName', 'Country'],
  'sales-order': ['SalesOrderID', 'OrderDate', 'CustomerID'],
  'sales-order-item': ['ItemID', 'SalesOrderID', 'ProductID'],
  delivery: ['DeliveryID', 'SalesOrderID', 'ShipDate'],
  'delivery-item': ['DeliveryItemID', 'DeliveryID', 'Quantity'],
  invoice: ['InvoiceID', 'SalesOrderID', 'InvoiceDate'],
  'invoice-item': ['InvoiceItemID', 'InvoiceID', 'Amount'],
  product: ['ProductID', 'ProductName', 'MaterialID'],
  material: ['MaterialID', 'MaterialName', 'PlantID'],
  plant: ['PlantID', 'PlantName', 'Region'],
  'returns-processing': ['ReturnID', 'DeliveryID'],
  'vendor-hub': ['HubID', 'AccountCode'],
  'currency-conversion': ['ConversionID', 'CurrencyCode'],
};

const EVENT_KEYS = {
  'create-sales-order': ['EventID', 'SalesOrderID', 'Timestamp'],
  'change-sales-order': ['EventID', 'SalesOrderID', 'ChangeType'],
  'release-credit-block': ['EventID', 'SalesOrderID', 'ReleasedBy'],
  'create-delivery': ['EventID', 'DeliveryID', 'Timestamp'],
  'post-goods-issue': ['EventID', 'DeliveryID', 'PostingDate'],
  'create-invoice': ['EventID', 'InvoiceID', 'Timestamp'],
  'clear-invoice': ['EventID', 'InvoiceID', 'ClearingDate'],
  'return-created': ['EventID', 'ReturnID', 'Timestamp'],
};

const DEFAULT_FORM = {
  relType: 'o2o',
  cardinality: '1:N',
  sourceId: 'customer',
  targetId: 'sales-order',
  sourceKey: 'CustomerID',
  targetKey: 'CustomerID',
};

function keysForEndpoint(kind, id) {
  if (kind === 'event') {
    return EVENT_KEYS[id] ?? ['EventID', 'RecordID', 'Timestamp'];
  }
  return OBJECT_KEYS[id] ?? ['ID', 'Name', 'Reference'];
}

export default function CreateRelationshipModal({ open, onClose }) {
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const targetOptions = useMemo(() => {
    if (form.relType === 'o2e') {
      return eventSources.map((e) => ({ id: e.id, label: e.name }));
    }
    return objects.map((o) => ({ id: o.id, label: o.name }));
  }, [form.relType]);

  const sourceKeys = useMemo(
    () => keysForEndpoint('object', form.sourceId),
    [form.sourceId],
  );

  const targetKeys = useMemo(
    () => keysForEndpoint(form.relType === 'o2e' ? 'event' : 'object', form.targetId),
    [form.relType, form.targetId],
  );

  const patch = (updates) => setForm((prev) => ({ ...prev, ...updates }));

  const handleRelTypeChange = (relType) => {
    const nextTargetId = relType === 'o2e' ? 'create-sales-order' : 'sales-order';
    const nextTargetKeys = keysForEndpoint(relType === 'o2e' ? 'event' : 'object', nextTargetId);
    patch({
      relType,
      targetId: nextTargetId,
      targetKey: nextTargetKeys[0],
    });
  };

  const handleSourceChange = (sourceId) => {
    const keys = keysForEndpoint('object', sourceId);
    patch({ sourceId, sourceKey: keys[0] });
  };

  const handleTargetChange = (targetId) => {
    const keys = keysForEndpoint(form.relType === 'o2e' ? 'event' : 'object', targetId);
    patch({ targetId, targetKey: keys[0] });
  };

  if (!open) return null;

  const sourceName = objects.find((o) => o.id === form.sourceId)?.name ?? form.sourceId;
  const targetName =
    form.relType === 'o2e'
      ? eventSources.find((e) => e.id === form.targetId)?.name ?? form.targetId
      : objects.find((o) => o.id === form.targetId)?.name ?? form.targetId;

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-relationship-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <h2 id="create-relationship-title" className={styles.title}>
              New relationship
            </h2>
            <p className={styles.subtitle}>
              Define how records connect in this perspective.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>

        <div className={styles.body}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Relationship type</legend>
            <div className={styles.choiceRow}>
              {REL_TYPES.map((type) => (
                <label
                  key={type.id}
                  className={form.relType === type.id ? styles.choiceActive : styles.choice}
                >
                  <input
                    type="radio"
                    name="relType"
                    value={type.id}
                    checked={form.relType === type.id}
                    onChange={() => handleRelTypeChange(type.id)}
                  />
                  <span className={styles.choiceLabel}>{type.label}</span>
                  <span className={styles.choiceHint}>{type.description}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className={styles.field}>
            <span className={styles.label}>Cardinality</span>
            <select
              className={styles.select}
              value={form.cardinality}
              onChange={(e) => patch({ cardinality: e.target.value })}
            >
              {CARDINALITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.endpointGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Source object</span>
              <select
                className={styles.select}
                value={form.sourceId}
                onChange={(e) => handleSourceChange(e.target.value)}
              >
                {objects.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>
                {form.relType === 'o2e' ? 'Target event' : 'Target object'}
              </span>
              <select
                className={styles.select}
                value={form.targetId}
                onChange={(e) => handleTargetChange(e.target.value)}
              >
                {targetOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Key mapping</legend>
            <p className={styles.mappingHint}>
              Match the attribute used to join {sourceName} to {targetName}.
            </p>
            <div className={styles.mappingGrid}>
              <label className={styles.field}>
                <span className={styles.label}>Source key</span>
                <select
                  className={styles.select}
                  value={form.sourceKey}
                  onChange={(e) => patch({ sourceKey: e.target.value })}
                >
                  {sourceKeys.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </label>

              <span className={styles.mappingArrow} aria-hidden>
                →
              </span>

              <label className={styles.field}>
                <span className={styles.label}>Target key</span>
                <select
                  className={styles.select}
                  value={form.targetKey}
                  onChange={(e) => patch({ targetKey: e.target.value })}
                >
                  {targetKeys.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.primaryBtn} onClick={onClose}>
            Create relationship
          </button>
        </footer>
      </div>
    </div>
  );
}
