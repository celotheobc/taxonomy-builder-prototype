import { CONTEXT_STEPS, SCRATCH_STEPS, TOUR_ROUTES } from './demoTourSteps';
import { useDemoTour } from './DemoTourContext';
import theoBotAvatar from '../../assets/theobot-avatar.png';
import styles from './DemoTourPopover.module.css';

function StepList({ steps, completedIds }) {
  return (
    <ol className={styles.stepList}>
      {steps.map((step, index) => {
        const done = completedIds.includes(step.id);
        const isCurrent =
          !done &&
          (index === 0 || completedIds.includes(steps[index - 1].id));

        return (
          <li
            key={step.id}
            className={[
              styles.step,
              done ? styles.stepDone : '',
              isCurrent ? styles.stepCurrent : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className={styles.stepMarker} aria-hidden>
              {done ? '✓' : index + 1}
            </span>
            <span className={styles.stepText}>{step.text}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default function DemoTourPopover() {
  const {
    open,
    setOpen,
    route,
    setRoute,
    scratchCompleted,
    contextCompleted,
    scratchProgress,
    contextProgress,
    markFinished,
    focusContextModel,
  } = useDemoTour();

  const steps = route === TOUR_ROUTES.CONTEXT ? CONTEXT_STEPS : SCRATCH_STEPS;
  const completed = route === TOUR_ROUTES.CONTEXT ? contextCompleted : scratchCompleted;
  const progress = route === TOUR_ROUTES.CONTEXT ? contextProgress : scratchProgress;
  const allDone = completed.length === steps.length;

  if (!open) return null;

  return (
    <div className={styles.root}>
      <div
        id="theobot-panel"
        className={styles.panel}
        role="dialog"
        aria-label="TheoBot tour guide"
      >
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderIdentity}>
              <img
                src={theoBotAvatar}
                alt=""
                className={styles.panelAvatar}
                width={40}
                height={40}
              />
              <div>
                <p className={styles.eyebrow}>Tour guide</p>
                <div className={styles.titleRow}>
                  <h2 className={styles.title}>TheoBot</h2>
                  <span className={styles.progressLabel}>
                    {Math.round(progress * 100)}%
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              aria-label="Hide TheoBot"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <div className={styles.routeTabs} role="tablist" aria-label="Tour routes">
            <button
              type="button"
              role="tab"
              aria-selected={route === TOUR_ROUTES.SCRATCH}
              className={`${styles.routeTab} ${
                route === TOUR_ROUTES.SCRATCH ? styles.routeTabActive : ''
              }`}
              onClick={() => setRoute(TOUR_ROUTES.SCRATCH)}
            >
              Build from scratch
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={route === TOUR_ROUTES.CONTEXT}
              className={`${styles.routeTab} ${
                route === TOUR_ROUTES.CONTEXT ? styles.routeTabActive : ''
              }`}
              onClick={() => {
                setRoute(TOUR_ROUTES.CONTEXT);
                focusContextModel();
              }}
            >
              Context Model
            </button>
          </div>

          <div className={styles.progressBar} aria-hidden>
            <span
              className={styles.progressFill}
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>

          <div className={styles.panelBody}>
            <StepList steps={steps} completedIds={completed} />
          </div>

          <div className={styles.panelFooter}>
            <p className={styles.hint}>
              TheoBot checks off steps as you complete actions in the prototype.
            </p>
            {allDone && (
              <button
                type="button"
                className={styles.finishBtn}
                onClick={() => markFinished(route)}
              >
                Mark route complete
              </button>
            )}
          </div>
        </div>
    </div>
  );
}
