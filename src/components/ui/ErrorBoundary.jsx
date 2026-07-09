import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.wrap}>
          <h1>Something went wrong</h1>
          <p>{this.state.error.message}</p>
          <pre>{this.state.error.stack}</pre>
          <p className={styles.hint}>
            Try restarting via <strong>Start Prototype.command</strong> or{' '}
            <code>npm run dev</code> in Terminal — do not open index.html directly.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
