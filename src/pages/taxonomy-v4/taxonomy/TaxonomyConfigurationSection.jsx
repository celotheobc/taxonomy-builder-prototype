import styles from './TaxonomyEditor.module.css';

export default function TaxonomyConfigurationSection() {
  return (
    <section className={styles.configSection} aria-label="Taxonomy configuration">
      <div className={styles.configSectionHeader}>
        <h2 className={styles.configSectionTitle}>Synchronisation</h2>
        <span className={styles.configSectionBadge}>Coming soon</span>
      </div>
      <p className={styles.configSectionCopy}>
        Future settings for manual vs synchronised taxonomies, refresh behaviour, and automatic
        creation of new values will live here as taxonomy-level properties.
      </p>
    </section>
  );
}
