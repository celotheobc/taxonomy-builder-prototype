import { agentContextMarkdown } from '../../data/mockData';
import styles from './AgentContextModule.module.css';

export default function AgentContextModule() {
  return (
    <section className={styles.module} aria-labelledby="agent-heading">
      <h2 id="agent-heading">Agent Context</h2>
      <div className={styles.tabs}>
        <button type="button" className={styles.tabActive}>
          Markdown
        </button>
        <button type="button" className={styles.tab}>
          Preview
        </button>
      </div>
      <textarea
        className={styles.editor}
        readOnly
        value={agentContextMarkdown}
        aria-label="Agent context markdown"
      />
    </section>
  );
}
