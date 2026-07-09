import styles from './DecisionPanelHeader.module.css';

export default function DecisionPanelHeader() {
  return (
    <div className={styles.bar}>
      <h2 className={styles.title}>Action required</h2>
    </div>
  );
}
