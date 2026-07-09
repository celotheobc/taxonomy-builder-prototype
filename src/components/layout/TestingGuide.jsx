import { useState } from 'react';
import styles from './TestingGuide.module.css';

export default function TestingGuide({ experience }) {
  const [open, setOpen] = useState(true);

  return (
    <div className={styles.guide}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        How to test this prototype {open ? '▾' : '▸'}
      </button>
      {open && (
        <div className={styles.body}>
          {experience === 'progressive' ? (
            <>
              <p className={styles.lead}>
                <strong>Progressive demo.</strong> Build the Order-to-Cash perspective
                step-by-step; cycle resolution and Accounts Hub connection use the right
                inspector.
              </p>
              <ol>
                <li>
                  Click <strong>Sales Order</strong> (the suggested chip on the empty
                  canvas).
                </li>
                <li>
                  On the graph, click <strong>+</strong> on ghost nodes to add{' '}
                  <strong>Customer</strong>, <strong>Delivery</strong>, and{' '}
                  <strong>Delivery Item</strong> (only these three are offered until
                  the loop is resolved).
                </li>
                <li>
                  When all four are included, status becomes{' '}
                  <strong>Needs resolution</strong> — four relationships form a loop.
                  Use the <strong>Resolve cycle</strong> panel on the right (or ✂ on
                  the graph).
                </li>
                <li>
                  After resolving, use canvas <strong>+</strong> or search to add{' '}
                  <strong>Accounts Hub</strong>. Choose a connection path in the{' '}
                  <strong>Connect object</strong> panel — one route shows{' '}
                  <strong>Creates cycle</strong>.
                </li>
                <li>
                  Optional: <strong>Currency Conversion</strong> has no model paths.
                  Toggle Discover for events/metrics on included objects.
                </li>
              </ol>
            </>
          ) : (
            <>
              <p className={styles.lead}>
                <strong>Route B — Shortcut.</strong> Jumps straight to the
                pre-loaded ambiguity (no building required).
              </p>
              <ol>
                <li>
                  Graph already includes Customer, Sales Order, Delivery, Delivery
                  Item, Invoice — focal hub is <strong>Delivery Item</strong>.
                </li>
                <li>
                  Read the amber banner: two routes to Delivery Item (not labelled as
                  “cycle”).
                </li>
                <li>
                  Default <strong>Pattern B</strong>: click ✂ on a highlighted edge to
                  prune that route.
                </li>
                <li>
                  Try <strong>Pattern A</strong>: use “Keep this route” buttons instead.
                </li>
                <li>
                  Validation → <strong>Valid</strong> after resolution. Check{' '}
                  <em>Advanced details</em> for the technical framing.
                </li>
              </ol>
            </>
          )}
          <p className={styles.note}>
            The delivery loop appears when Customer, Sales Order, Delivery, and
            Delivery Item are all included with their relationships active. Remove
            one edge in the loop to validate, then continue with Accounts Hub.
          </p>
        </div>
      )}
    </div>
  );
}
