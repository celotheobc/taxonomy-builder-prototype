import { getObjectType } from '../../../data/mockObjectTypes';
import ObjectTypeSectionCard from './ObjectTypeSectionCard';
import styles from './AgentContextSection.module.css';

export default function AgentContextSection({ objectTypeId }) {
  const objectType = getObjectType(objectTypeId);

  return (
    <ObjectTypeSectionCard title="Agent Context">
      <textarea
        className={styles.editor}
        readOnly
        value={objectType.agentContext}
        aria-label="Agent context markdown"
      />
    </ObjectTypeSectionCard>
  );
}
