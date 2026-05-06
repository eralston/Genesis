import React from 'react';
import type { GameStatus } from '../../types/index.js';
import styles from './StatusBadge.module.css';

interface Props {
  status: GameStatus;
}

export default function StatusBadge({ status }: Props): React.JSX.Element {
  return (
    <span className={`${styles.badge} ${status === 'owned' ? styles.owned : styles.wishlist}`}>
      {status === 'owned' ? 'Owned' : 'Wishlist'}
    </span>
  );
}
