import { useEffect, useRef, useState } from 'react';
import { getObjectType } from '../../../data/mockObjectTypes';
import { getAllSubtypeEntries, getSubtypeCountForAttribute } from '../context/ObjectTypeWorkspaceContext';
import ObjectTypeSectionCard from './ObjectTypeSectionCard';
import styles from './ObjectTypeSectionCard.module.css';

function BindingBadge({ status }) {
  if (status === 'Bound') return <span className={styles.badgeBound}>Bound</span>;
  if (status.startsWith('Partial') || status === 'Partial') {
    return <span className={styles.badgePartial}>{status}</span>;
  }
  return <span className={styles.badgeUnbound}>Unbound</span>;
}

function SubtypeCountBadge({ count }) {
  if (!count) return null;
  const label = `${count} subtype${count === 1 ? '' : 's'}`;
  return <span className={styles.badgeSubtypes}>{label}</span>;
}

function AttributeRowMenu({ attributeId, onCreateSubtypesFromAttribute }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  return (
    <div className={styles.rowMenu} ref={menuRef}>
      <button
        type="button"
        className={styles.rowMenuBtn}
        aria-label="Attribute actions"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        ⋯
      </button>
      {open && (
        <div className={styles.rowMenuPanel} role="menu">
          <button
            type="button"
            className={styles.rowMenuItem}
            role="menuitem"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
              onCreateSubtypesFromAttribute?.(attributeId);
            }}
          >
            Create subtypes from this attribute
          </button>
        </div>
      )}
    </div>
  );
}

export default function AttributesBindingsSection({
  objectTypeId,
  splitState,
  selectedAttributeId,
  selectedBindingId,
  onSelectAttribute,
  onSelectBinding,
  onCreateSubtypesFromAttribute,
}) {
  const [activeTab, setActiveTab] = useState('attributes');
  const objectType = getObjectType(objectTypeId);
  const showSubtypesColumn = Boolean(
    splitState && getAllSubtypeEntries(splitState).length > 0,
  );

  return (
    <ObjectTypeSectionCard
      title="Attributes & Bindings"
      actions={
        <>
          <button type="button" className={styles.filterBtn} aria-label="Filter">
            ⊘
          </button>
          <button type="button" className={styles.actionBtnPrimary}>
            + Add
          </button>
        </>
      }
    >
      <div className={styles.tabBar} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'attributes'}
          className={activeTab === 'attributes' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('attributes')}
        >
          Attributes ({objectType.attributes.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'bindings'}
          className={activeTab === 'bindings' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('bindings')}
        >
          Bindings ({objectType.bindings.length})
        </button>
      </div>

      <div className={styles.tableWrap}>
        {activeTab === 'attributes' ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Data type</th>
                <th>Bindings</th>
                {showSubtypesColumn ? <th>Subtypes</th> : null}
                <th>Source</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {objectType.attributes.map((row) => (
                <tr
                  key={row.id}
                  className={selectedAttributeId === row.id ? styles.rowSelected : undefined}
                  tabIndex={0}
                  onClick={() => onSelectAttribute(row.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectAttribute(row.id);
                    }
                  }}
                >
                  <td>{row.name}</td>
                  <td>{row.dataType}</td>
                  <td>
                    <BindingBadge status={row.bindingStatus} />
                  </td>
                  {showSubtypesColumn ? (
                    <td>
                      <SubtypeCountBadge
                        count={getSubtypeCountForAttribute(splitState, row.id)}
                      />
                    </td>
                  ) : null}
                  <td>{row.source}</td>
                  <td className={styles.rowMenuCell}>
                    <AttributeRowMenu
                      attributeId={row.id}
                      onCreateSubtypesFromAttribute={onCreateSubtypesFromAttribute}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Table</th>
                <th>Schema</th>
                <th>Status</th>
                <th>Mapped</th>
              </tr>
            </thead>
            <tbody>
              {objectType.bindings.map((row) => (
                <tr
                  key={row.id}
                  className={selectedBindingId === row.id ? styles.rowSelected : undefined}
                  tabIndex={0}
                  onClick={() => onSelectBinding(row.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectBinding(row.id);
                    }
                  }}
                >
                  <td>{row.name}</td>
                  <td>{row.table}</td>
                  <td>{row.schema}</td>
                  <td>
                    <BindingBadge status={row.status} />
                  </td>
                  <td>{row.mappedColumns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ObjectTypeSectionCard>
  );
}
