import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Game } from '../../types/index.js';
import CoverArt from './CoverArt.js';
import StatusBadge from './StatusBadge.js';
import RatingStars from './RatingStars.js';
import styles from './GameCard.module.css';

interface Props {
  game: Game;
}

export default function GameCard({ game }: Props): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <button
      className={styles.card}
      onClick={() => navigate(`/game/${game.id}`)}
      aria-label={`Open ${game.title}`}
    >
      <div className={styles.cover}>
        <CoverArt src={game.coverArtUrl} alt={game.title} />
      </div>
      <div className={styles.info}>
        <span className={styles.title}>{game.title}</span>
        <div className={styles.meta}>
          <StatusBadge status={game.status as 'owned' | 'wishlist'} />
          {game.rating != null && (
            <RatingStars value={game.rating} readonly />
          )}
        </div>
      </div>
    </button>
  );
}
