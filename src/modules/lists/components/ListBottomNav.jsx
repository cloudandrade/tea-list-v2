'use client';

import { useRouter } from 'next/navigation';
import styles from '@/modules/dashboard/components/dashboard.module.css';

function GridIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M5 5h6v6H5zm8 0h6v6h-6zM5 13h6v6H5zm8 0h6v6h-6z" fill="currentColor" />
    </svg>
  );
}

function GiftIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7c-3-3-6-2-6 0s4 1 6 0Zm0 0c3-3 6-2 6 0s-4 1-6 0Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20c1.4-3.5 3.7-5.2 7-5.2s5.6 1.7 7 5.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function ListBottomNav({ active = 'create' }) {
  const router = useRouter();

  return (
    <nav className={styles.bottomNav} aria-label="Navegação principal">
      <div className={styles.bottomNavInner}>
        <button
          className={`${styles.navItem} ${active === 'dashboard' ? styles.navItemActive : ''}`}
          type="button"
          onClick={() => router.push('/dashboard')}
        >
          <GridIcon className={styles.navIcon} />
          Dashboard
        </button>
        <button
          className={`${styles.navItem} ${active === 'create' ? styles.navItemActive : ''}`}
          type="button"
          onClick={() => router.push('/dashboard/lists/new')}
        >
          <GiftIcon className={styles.navIcon} />
          Create
        </button>
        <button className={`${styles.navItem} ${active === 'profile' ? styles.navItemActive : ''}`} type="button">
          <UserIcon className={styles.navIcon} />
          Profile
        </button>
      </div>
    </nav>
  );
}
