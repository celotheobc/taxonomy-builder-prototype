import { useEffect, useMemo, useRef, useState } from 'react';
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
import MoveToGroupModal from './MoveToGroupModal';
import styles from './TaxonomyEditor.module.css';

export default function TaxonomyGroupDetailPanel({
  selectedGroupId,
  groups,
  subtypes,
  totalRows,
  onUpdateDescription,
  onRenameGroup,
  onDeleteGroup,
  onAddChildGroup,
  onCreateGroup,
  onAddMembers,
  onMoveMemberToGroup,
  onRemoveMember,
  onPreviewMember,
  onOpenMember,
}) {
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [moveMember, setMoveMember] = useState(null);
  const [showOrganiseGuidance, setShowOrganiseGuidance] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const titleInputRef = useRef(null);
  const isUngrouped = selectedGroupId === UNGROUPED_GROUP_ID;
  const group = isUngrouped ? null : getGroupById(groups, selectedGroupId);

  useEffect(() => {
    setIsEditingTitle(false);
    setTitleDraft('');
  }, [selectedGroupId]);

  useEffect(() => {
    if (!isEditingTitle) return;
    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, [isEditingTitle]);

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

  const startTitleEdit = () => {
    if (isUngrouped || !group) return;
    setTitleDraft(group.label);
    setIsEditingTitle(true);
  };

  const commitTitleEdit = () => {
    if (!group) return;
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== group.label) {
      onRenameGroup(group.id, trimmed);
    }
    setIsEditingTitle(false);
  };

  const cancelTitleEdit = () => {
    setIsEditingTitle(false);
    setTitleDraft(group?.label ?? '');
  };

  const handleDeleteGroup = () => {
    if (isUngrouped || !group) return;
    const confirmed = window.confirm(
      `Delete "${group.label}"? Child groups will also be removed. Members stay in other groups or return to Ungrouped.`,
    );
    if (confirmed) onDeleteGroup(group.id);
  };

  const handleNewChild = () => {
    if (isUngrouped) return;
    const nextLabel = window.prompt('New child group name');
    if (nextLabel?.trim()) onAddChildGroup(group.id, nextLabel.trim());
  };

  const handleCreateGroup = () => {
    const nextLabel = window.prompt('New group name', isUngrouped ? 'Planning' : '');
    if (nextLabel?.trim()) onCreateGroup(nextLabel.trim());
  };

  return (
    <div className={styles.groupDetail}>
      <header className={styles.groupDetailHeader}>
        <div className={styles.groupDetailIntro}>
          <p className={styles.groupDetailEyebrow}>Group details</p>
          {isUngrouped ? (
            <h2 className={styles.groupDetailTitle}>{title}</h2>
          ) : isEditingTitle ? (
            <input
              ref={titleInputRef}
              className={styles.groupDetailTitleInput}
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onBlur={commitTitleEdit}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitTitleEdit();
                }
                if (event.key === 'Escape') {
                  event.preventDefault();
                  cancelTitleEdit();
                }
              }}
              aria-label="Group name"
            />
          ) : (
            <button
              type="button"
              className={styles.groupDetailTitleButton}
              onClick={startTitleEdit}
              aria-label={`Rename ${title}`}
            >
              {title}
            </button>
          )}
        </div>
        <div className={styles.groupDetailHeaderActions}>
          {isUngrouped ? (
            <button type="button" className={styles.primaryBtn} onClick={handleCreateGroup}>
              Create group
            </button>
          ) : (
            <>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => setAddMembersOpen(true)}
              >
                Add members
              </button>
              <button type="button" className={styles.secondaryBtn} onClick={handleNewChild}>
                New child group
              </button>
              <button
                type="button"
                className={`${styles.textBtn} ${styles.textBtnDanger} ${styles.deleteGroupBtn}`}
                onClick={handleDeleteGroup}
              >
                Delete group
              </button>
            </>
          )}
        </div>
      </header>

      <div className={styles.groupDetailBody}>
        {isUngrouped && showOrganiseGuidance ? (
          <section className={styles.docSection}>
            <div className={styles.guidanceCard}>
              <div className={styles.guidanceHeader}>
                <h3 className={styles.guidanceTitle}>Organise these members</h3>
                <button
                  type="button"
                  className={styles.guidanceDismiss}
                  onClick={() => setShowOrganiseGuidance(false)}
                  aria-label="Dismiss organise members guidance"
                >
                  ×
                </button>
              </div>
              <ol className={styles.guidanceSteps}>
                <li>Create a business group (e.g. Planning, Execution, Quality).</li>
                <li>Select the group in the hierarchy, or use Move to group on each member.</li>
                <li>Add members to the group — they can belong to more than one group.</li>
              </ol>
            </div>
          </section>
        ) : null}
        {isUngrouped ? null : (
          <section className={styles.docSection}>
            <h3 className={styles.docSectionTitle}>Description</h3>
            <textarea
              className={styles.descriptionInput}
              value={group?.description ?? ''}
              rows={3}
              onChange={(event) => onUpdateDescription(group.id, event.target.value)}
              aria-label={`Description for ${title}`}
            />
          </section>
        )}

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
                      {isUngrouped && (
                        <button
                          type="button"
                          className={styles.moveToGroupBtn}
                          onClick={() => setMoveMember(member)}
                        >
                          Move to group
                        </button>
                      )}
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
      </div>

      <AddMembersModal
        open={addMembersOpen}
        groupLabel={title}
        subtypes={subtypes}
        existingMemberIds={group?.memberIds ?? []}
        onClose={() => setAddMembersOpen(false)}
        onAdd={(memberIds) => onAddMembers(group.id, memberIds)}
      />

      <MoveToGroupModal
        open={Boolean(moveMember)}
        memberLabel={moveMember?.label ?? ''}
        groups={groups}
        onClose={() => setMoveMember(null)}
        onMove={(groupId) => onMoveMemberToGroup(groupId, moveMember.id)}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
}
