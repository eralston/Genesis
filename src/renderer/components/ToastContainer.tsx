import React from 'react';
import type { Toast } from '../hooks/useToast.js';
import styles from './ToastContainer.module.css';

interface Props {
  toasts: Toast[];
  dismiss: (id: number) => void;
}

export default function ToastContainer({ toasts, dismiss }: Props): React.JSX.Element {
  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toast} ${styles[t.type]}`}
          role="alert"
        >
          <span>{t.message}</span>
          <button className={styles.close} onClick={() => dismiss(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}
