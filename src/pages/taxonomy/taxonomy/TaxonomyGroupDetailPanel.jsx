import { useMemo, useState } from 'react';
import {
  UNGROUPED_GROUP_ID,
  getDirectMemberSubtypes,
  getGroupById,
  getMemberGroups,
  getUngroupedMemberIds,
} from '../../../data/taxonomyHierarchy';
import { OpenIcon, PreviewIcon } from '../subtypes/SubtypeRowIcons';
import { formatSubtypeRowStats } from '../subtypes/subtypeRowStats';
import AddMembersModal from './AddMembersModal';
import styles from './TaxonomyEditor.module.css';

export default function TaxonomyGroupDetailPanel({
  taxonomyId,
  taxonomyName,
  selectedGroupId,
  groups,
  subtypes,
  totalRows,
  onUpdateDescription,
  onRenameGroup,
  onAddChildGroup,
  onAddMembers,
  onRemoveMember,
  onPreviewMember,
  onOpenMember,
  onViewSourceRecords,
  onPreviewGroupMembers,
}) {
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const isUngrouped = selectedGroupId === UNGROUPED_GROUP_ID;
  const group = isUngrouped ? null : getGroupById(groups, selectedGroupId);

  const members = useMemo(() => {
    if (isUngrouped) {
      const ids = getUngroupedMemberIds(subtypes, groups);
      return ids
        .map((id) => subtypes.find((subtype) => subtype.id === id))
        .filter(Boolean);
    }
    return getDirectMemberSubtypes(group, subtypes);
  }, [isUngrouped, group, groups, subtypes]);

  const title = isUngrouped ? 'Ungrouped' : group?.label ?? 'Group';
  const description = isUngrouped
    ? 'Subtype members that are not yet assigned to a business group. Move members into groups to organise this taxonomy.'
    : group?.description ?? '';

  const handleRename = () => {
    if (isUngrouped || !group) return;
    const nextLabel = window.prompt('Rename group', group.label);
    if (nextLabel?.trim()) onRenameGroup(group.id, nextLabel.trim());
  };

  const handleNewChild = () => {
    if (isUngrouped) return;
    const nextLabel = window.prompt('New child group name');
    if (nextLabel?.trim()) onAddChildGroup(group.id, nextLabel.trim());
  };

  return (
    <div className={styles.groupDetail}>
      <header className={styles.groupDetailHeader}>
        <p className={styles.groupDetailEyebrow}>Group details</p>
        <h2 className={styles.groupDetailTitle}>{title}</h2>
      </header>

      <div className={styles.groupDetailBody}>
        <section className={styles.docSection}>
          <h3 className={styles.docSectionTitle}>Description</h3>
          {isUngrouped ? (
            <p className={styles.docText}>{description}</p>
          ) : (
            <textarea
              className={styles.descriptionInput}
              value={description}
              rows={3}
              onChange={(event) => onUpdateDescription(group.id, event.target.value)}
              aria-label={`Description for ${title}`}
            />
          )}
        </section>

        <section className={styles.docSection}>
          <h3 className={styles.docSectionTitle}>Members</h3>
          {members.length ? (
            <ul className={styles.memberList}>
              {members.map((member) => {
                const memberGroups = getMemberGroups(member.id, groups);
                return (
                  <li key={member.id} className={styles.memberRow}>
                    <div className={styles.memberMain}>
                      <span className={styles.memberName}>{member.label}</span>
                      <span className={styles.memberMeta}>
                        {formatSubtypeRowStats(member.recordCount, totalRows)}
                        {memberGroups.length > 1
                          ? ` · in ${memberGroups.length} groups`
                          : ''}
                      </span>
                      {memberGroups.length > 0 && (
                        <ul className={styles.membershipList} aria-label={`Groups for ${member.label}`}>
                          {memberGroups.map((memberGroup) => (
                            <li key={memberGroup.id} className={styles.membershipItem}>
                              <span className={styles.membershipCheck} aria-hidden>
                                ✓
                              </span>
                              <span>{memberGroup.label}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className={styles.memberActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        title="Preview Data"
                        aria-label={`Preview data for ${member.label}`}
                        onClick={() => onPreviewMember(member.id)}
                      >
                        <PreviewIcon />
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        title="Open Subtype"
                        aria-label={`Open ${member.label}`}
                        onClick={() => onOpenMember(member.id)}
                      >
                        <OpenIcon />
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        title="View Source Records"
                        aria-label={`View source records for ${member.label}`}
                        onClick={() => onViewSourceRecords(member.id)}
                      >
                        ≡
                      </button>
                      {!isUngrouped && (
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                          title="Remove from group"
                          aria-label={`Remove ${member.label} from ${title}`}
                          onClick={() => onRemoveMember(group.id, member.id)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.docTextMuted}>No members in this group yet.</p>
          )}
        </section>

        <section className={styles.docSection}>
          <h3 className={styles.docSectionTitle}>Actions</h3>
          <div className={styles.actionBar}>
            {!isUngrouped && (
              <>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => setAddMembersOpen(true)}
                >
                  Add Members
                </button>
                <button type="button" className={styles.secondaryBtn} onClick={handleNewChild}>
                  New Child Group
                </button>
                <button type="button" className={styles.secondaryBtn} onClick={handleRename}>
                  Rename Group
                </button>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => onPreviewGroupMembers(members)}
                >
                  Preview Members
                </button>
              </>
            )}
            {isUngrouped && members.length > 0 && (
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => onPreviewGroupMembers(members)}
              >
                Preview Members
              </button>
            )}
          </div>
        </section>
      </div>

      <AddMembersModal
        open={addMembersOpen}
        groupLabel={title}
        subtypes={subtypes}
        existingMemberIds={group?.memberIds ?? []}
        onClose={() => setAddMembersOpen(false)}
        onAdd={(memberIds) => onAddMembers(group.id, memberIds)}
      />
    </div>
  );
}
