import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

export default function Layout(): React.JSX.Element {
  return (
    <div className={styles.shell}>
      <nav className={styles.sidebar}>
        <div className={styles.logo}>🎮 Genesis</div>
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
        >
          Library
        </NavLink>
        <NavLink
          to="/roms"
          className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
        >
          ROM Manager
        </NavLink>
      </nav>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
