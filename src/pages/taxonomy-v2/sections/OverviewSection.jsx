import ObjectTypeSpokeGraph from '../components/ObjectTypeSpokeGraph';
import ObjectTypeSectionCard from './ObjectTypeSectionCard';
import styles from './OverviewSection.module.css';

export default function OverviewSection({ objectTypeId }) {
  return (
    <ObjectTypeSectionCard title="Overview">
      <div className={styles.body}>
        <ObjectTypeSpokeGraph objectTypeId={objectTypeId} />
      </div>
    </ObjectTypeSectionCard>
  );
}
