import styles from './DecisionPanelIntro.module.css';

export function CycleResolutionIntro() {
  return (
    <div className={styles.intro}>
      <h3 className={styles.introTitle}>Resolve cycle</h3>
      <p className={styles.introText}>
        All options available are shown below. You may preview consequences or compare
        alternatives before removing a relationship.
      </p>
    </div>
  );
}

export function ConnectionDecisionIntro({ objectName, pathCount }) {
  const totalChoices = pathCount + 1;

  return (
    <div className={styles.intro}>
      <h3 className={styles.introTitle}>Choose how to connect {objectName}</h3>
      <p className={styles.introText}>
        {totalChoices} possible connection {totalChoices === 1 ? 'path' : 'paths'} found.
        Preview the consequences of each option before adding it.
      </p>
    </div>
  );
}
