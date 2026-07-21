import { useEffect, useMemo, useRef, useState } from 'react';
import SplitAttributePicker from './SplitAttributePicker';
import {
  RULE_JOINS,
  RULE_OPERATORS,
  createEmptyCondition,
  createEmptyRule,
  getRuleBuilderFields,
  getRuleFieldValues,
  previewRuleSubtypes,
} from '../data/rulePreview';
import {
  formatConditionCount,
  formatMatchingRecords,
  SUBTYPE_EDITOR_EMPTY,
  SUBTYPE_PREVIEW_EMPTY,
} from './subtypeMatchCopy';
import styles from './SplitModalV5.module.css';

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3.25 3.25l7.5 7.5M10.75 3.25l-7.5 7.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function RuleBuilderPanel({
  objectType,
  objectTypeId,
  rules,
  onRulesChange,
  splitAttributeOptions,
  getValueCount,
  modalOpen,
}) {
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [focusNameOnSelectId, setFocusNameOnSelectId] = useState(null);
  const nameInputRef = useRef(null);
  const fields = useMemo(() => getRuleBuilderFields(objectType), [objectType]);

  const preview = useMemo(
    () =>
      previewRuleSubtypes(
        objectTypeId,
        rules.map((rule) => ({ label: rule.label, conditions: rule.conditions })),
      ),
    [objectTypeId, rules],
  );

  const previewById = useMemo(() => {
    const map = new Map();
    rules.forEach((rule, index) => {
      map.set(rule.id, preview[index]);
    });
    return map;
  }, [rules, preview]);

  const selectedRule = rules.find((rule) => rule.id === selectedRuleId) ?? null;
  const selectedMatch = selectedRule ? previewById.get(selectedRule.id) : null;

  useEffect(() => {
    if (focusNameOnSelectId && selectedRuleId === focusNameOnSelectId && nameInputRef.current) {
      nameInputRef.current.focus();
      setFocusNameOnSelectId(null);
    }
  }, [focusNameOnSelectId, selectedRuleId, rules]);

  useEffect(() => {
    if (selectedRuleId && !rules.some((rule) => rule.id === selectedRuleId)) {
      setSelectedRuleId(rules[0]?.id ?? null);
    }
  }, [rules, selectedRuleId]);

  const updateRules = (next) => onRulesChange(next);

  const updateRule = (ruleId, patch) => {
    updateRules(rules.map((rule) => (rule.id === ruleId ? { ...rule, ...patch } : rule)));
  };

  const updateCondition = (ruleId, index, patch) => {
    updateRules(
      rules.map((rule) => {
        if (rule.id !== ruleId) return rule;
        const conditions = rule.conditions.map((item, i) =>
          i === index ? { ...item, ...patch } : item,
        );
        return { ...rule, conditions };
      }),
    );
  };

  const addSubtype = () => {
    const rule = createEmptyRule();
    updateRules([...rules, rule]);
    setSelectedRuleId(rule.id);
    setFocusNameOnSelectId(rule.id);
  };

  const removeRule = (ruleId, event) => {
    event?.stopPropagation();
    const next = rules.filter((rule) => rule.id !== ruleId);
    updateRules(next);
    if (selectedRuleId === ruleId) {
      setSelectedRuleId(next[0]?.id ?? null);
    }
  };

  const addCondition = (ruleId) => {
    updateRules(
      rules.map((rule) => {
        if (rule.id !== ruleId) return rule;
        const prev = rule.conditions[rule.conditions.length - 1];
        const fieldId = prev?.fieldId ?? fields[0]?.id ?? '';
        const operator = prev?.operator ?? 'equals';
        const values = getRuleFieldValues(objectType, fieldId);
        const nextCondition = {
          ...createEmptyCondition(fieldId),
          operator,
          join: 'and',
          value: values[0]?.value ?? '',
        };
        return { ...rule, conditions: [...rule.conditions, nextCondition] };
      }),
    );
  };

  const addFirstCondition = (ruleId) => {
    const defaultFieldId = fields[0]?.id ?? '';
    const values = getRuleFieldValues(objectType, defaultFieldId);
    updateRules(
      rules.map((rule) => {
        if (rule.id !== ruleId) return rule;
        return {
          ...rule,
          conditions: [
            {
              ...createEmptyCondition(defaultFieldId),
              value: values[0]?.value ?? '',
            },
          ],
        };
      }),
    );
  };

  const removeCondition = (ruleId, index) => {
    updateRules(
      rules.map((rule) => {
        if (rule.id !== ruleId) return rule;
        return { ...rule, conditions: rule.conditions.filter((_, i) => i !== index) };
      }),
    );
  };

  const namedCount = rules.filter((rule) => rule.label.trim()).length;

  return (
    <div className={styles.groupingShell}>
      <div className={styles.groupingFormWrap}>
        <div className={styles.groupingLayout}>
          <div className={styles.groupingColumn}>
            <div className={styles.ruleEditorPanel}>
              <div className={styles.ruleEditorHeader} aria-hidden>
                <span>Edit subtype</span>
              </div>
              {!selectedRule ? (
                <p className={styles.ruleEditorEmpty}>{SUBTYPE_EDITOR_EMPTY}</p>
              ) : (
                <div className={styles.ruleEditorBody}>
                  <label className={styles.subtypeEditorNameLabel} htmlFor={`subtype-name-${selectedRule.id}`}>
                    Subtype name
                  </label>
                  <input
                    ref={nameInputRef}
                    id={`subtype-name-${selectedRule.id}`}
                    type="text"
                    className={styles.subtypeEditorNameInput}
                    value={selectedRule.label}
                    placeholder="Subtype name"
                    onChange={(event) => updateRule(selectedRule.id, { label: event.target.value })}
                    aria-label="Subtype name"
                  />

                  <p className={styles.subtypeEditorNameLabel}>Conditions</p>

                  {selectedRule.conditions.length === 0 ? (
                    <p className={styles.ruleEditorHint}>
                      Add a condition to define which records belong to this subtype.
                    </p>
                  ) : null}

                  {selectedRule.conditions.map((condition, index) => {
                    const valueOptions = getRuleFieldValues(objectType, condition.fieldId);
                    const triggerId = `rule-attr-${selectedRule.id}-${index}`;
                    const isFirst = index === 0;
                    return (
                      <div
                        key={`${selectedRule.id}-${index}`}
                        className={`${styles.ruleConditionRow} ${isFirst ? styles.ruleConditionRowFirst : ''}`}
                      >
                        {!isFirst ? (
                          <select
                            className={styles.ruleJoinSelect}
                            value={condition.join === 'or' ? 'or' : 'and'}
                            onChange={(event) =>
                              updateCondition(selectedRule.id, index, { join: event.target.value })
                            }
                            aria-label={`Join condition ${index + 1}`}
                          >
                            {RULE_JOINS.map((join) => (
                              <option key={join.id} value={join.id}>
                                {join.label}
                              </option>
                            ))}
                          </select>
                        ) : null}
                        <div className={styles.ruleConditionAttribute}>
                          <SplitAttributePicker
                            objectType={objectType}
                            options={splitAttributeOptions}
                            value={condition.fieldId}
                            onChange={(fieldId) => {
                              const values = getRuleFieldValues(objectType, fieldId);
                              updateCondition(selectedRule.id, index, {
                                fieldId,
                                value: values[0]?.value ?? '',
                              });
                            }}
                            getValueCount={getValueCount}
                            modalOpen={modalOpen}
                            triggerId={triggerId}
                            labelledBy={triggerId}
                            compact
                            singleLineTrigger
                          />
                        </div>
                        <select
                          className={styles.ruleOperatorSelect}
                          value={condition.operator}
                          onChange={(event) =>
                            updateCondition(selectedRule.id, index, { operator: event.target.value })
                          }
                          aria-label="Operator"
                        >
                          {RULE_OPERATORS.map((op) => (
                            <option key={op.id} value={op.id}>
                              {op.label}
                            </option>
                          ))}
                        </select>
                        <select
                          className={styles.ruleValueSelect}
                          value={condition.value}
                          disabled={!condition.fieldId || !valueOptions.length}
                          onChange={(event) =>
                            updateCondition(selectedRule.id, index, { value: event.target.value })
                          }
                          aria-label="Value"
                        >
                          {!condition.value ? (
                            <option value="" disabled>
                              Select value
                            </option>
                          ) : null}
                          {valueOptions.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.value}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className={styles.ruleRemoveBtn}
                          aria-label="Remove condition"
                          onClick={() => removeCondition(selectedRule.id, index)}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    className={styles.ruleAddConditionBtn}
                    onClick={() =>
                      selectedRule.conditions.length
                        ? addCondition(selectedRule.id)
                        : addFirstCondition(selectedRule.id)
                    }
                  >
                    Add condition
                  </button>

                  <p className={styles.subtypeMatchLive} aria-live="polite">
                    {formatMatchingRecords(selectedMatch?.recordCount ?? 0, objectType)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className={`${styles.groupingColumn} ${styles.groupingColumnPreview}`}>
            <div className={styles.groupingColumnHeader}>
              <h3 className={styles.groupingColumnTitlePreview}>Subtypes ({rules.length})</h3>
              <button type="button" className={styles.addSubtypeBtnSecondary} onClick={addSubtype}>
                Add subtype
              </button>
            </div>
            <div className={styles.groupingGroups}>
              {!rules.length ? (
                <p className={styles.groupingPreviewEmpty}>{SUBTYPE_PREVIEW_EMPTY}</p>
              ) : (
                rules.map((rule) => {
                  const isSelected = rule.id === selectedRuleId;
                  const match = previewById.get(rule.id);
                  return (
                    <article
                      key={rule.id}
                      className={`${styles.conceptCard} ${styles.subtypeNavCard} ${isSelected ? styles.conceptCardSelected : ''}`}
                    >
                      <button
                        type="button"
                        className={styles.subtypeNavCardHit}
                        onClick={() => setSelectedRuleId(rule.id)}
                        aria-pressed={isSelected}
                      >
                        <span className={styles.subtypeNavCardName}>
                          {rule.label.trim() || 'Untitled subtype'}
                        </span>
                        <span className={styles.subtypeNavCardMatchSecondary}>
                          {formatMatchingRecords(match?.recordCount ?? 0, objectType)}
                        </span>
                        <span className={styles.subtypeNavCardMatchSecondary}>
                          {formatConditionCount(rule.conditions.length)}
                        </span>
                      </button>
                      <button
                        type="button"
                        className={styles.conceptRemoveBtn}
                        onClick={(event) => removeRule(rule.id, event)}
                        aria-label={`Remove ${rule.label.trim() || 'subtype'}`}
                      >
                        <CloseIcon />
                      </button>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
        <p className={styles.classificationProgress} aria-live="polite">
          {namedCount > 0 ? (
            <span className={styles.classificationProgressStrong}>
              {namedCount} subtype{namedCount === 1 ? '' : 's'} created
            </span>
          ) : (
            <span className={styles.classificationProgressMuted}>No subtypes yet</span>
          )}
        </p>
      </div>
    </div>
  );
}
