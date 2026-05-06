import React, { useState } from 'react';
import styles from './CoverArt.module.css';

interface Props {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

export default function CoverArt({ src, alt, className }: Props): React.JSX.Element {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className={`${styles.placeholder} ${className ?? ''}`} aria-label={alt}>
        <span className={styles.icon}>🕹️</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${styles.img} ${className ?? ''}`}
      onError={() => setErrored(true)}
    />
  );
}
