import React, { useState } from 'react';
import styles from './RatingStars.module.css';

interface Props {
  value: number | null;
  onChange?: (rating: number) => void;
  readonly?: boolean;
}

const MAX = 5;

export default function RatingStars({ value, onChange, readonly }: Props): React.JSX.Element {
  const [hovered, setHovered] = useState<number | null>(null);

  const display = hovered ?? value ?? 0;

  return (
    <span className={styles.stars} aria-label={`Rating: ${value ?? 0} of ${MAX}`}>
      {Array.from({ length: MAX }, (_, i) => {
        const star = i + 1;
        return (
          <span
            key={star}
            className={star <= display ? styles.active : styles.inactive}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(null)}
            role={readonly ? undefined : 'button'}
            tabIndex={readonly ? undefined : 0}
            onKeyDown={(e) => {
              if (!readonly && (e.key === 'Enter' || e.key === ' ')) onChange?.(star);
            }}
            aria-pressed={!readonly ? star === value : undefined}
          >
            ★
          </span>
        );
      })}
    </span>
  );
}
