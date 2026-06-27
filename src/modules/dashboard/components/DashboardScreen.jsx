'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useNavigationLoading } from '@/app/components/NavigationLoadingProvider';
import { getLists, getMe, logout } from '@/modules/auth/services/authApi';
import { LogoutIcon, PlusIcon } from '@/modules/auth/components/icons';
import styles from './dashboard.module.css';

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

const paletteColors = {
  terracotta: '#86452a',
  olive: '#586330',
  blue: '#7c90a0',
  rose: '#e6a4b4',
  gold: '#d4ad68',
  wine: '#7b2f46',
  navy: '#2f465c',
  sage: '#8a9a78',
  lavender: '#9b87ad',
  cocoa: '#6b4a3a',
  coral: '#c96f5d',
  mint: '#6fa18a',
};

function makeCoverBackground(imageUrl, color) {
  if (!imageUrl) {
    return {
      backgroundImage: `radial-gradient(circle at 22% 62%, #fff8f5 0 7%, transparent 8%), linear-gradient(135deg, ${color}, #f4eae0)`,
    };
  }

  const escapedUrl = String(imageUrl).replaceAll('"', '\\"');
  return { backgroundImage: `url("${escapedUrl}")` };
}

function ListCard({ list, onManage }) {
  const progress = list.totalItems ? Math.min((list.reservedItems / list.totalItems) * 100, 100) : 0;
  const themeColor = paletteColors[list.colorPalette] || paletteColors.terracotta;

  return (
    <article className={styles.card} style={{ '--list-color': themeColor }}>
      <div className={styles.cardMedia} style={makeCoverBackground(list.coverImageUrl, themeColor)} aria-hidden="true" />
      <div className={styles.cardBody}>
        <p className={styles.type}>{list.type}</p>
        <h3 className={styles.cardTitle}>{list.title}</h3>
        <div className={styles.progressBlock}>
          <p className={styles.progressText}>
            {list.reservedItems} de {list.totalItems} itens adquiridos
          </p>
          <div className={styles.progress} aria-hidden="true">
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
        <button className={styles.manageButton} type="button" onClick={() => onManage(list.id)}>
          Gerenciar Lista
        </button>
      </div>
    </article>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { startNavigationLoading } = useNavigationLoading();
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [meResponse, listsResponse] = await Promise.all([getMe(), getLists()]);

        if (!active) {
          return;
        }

        setUser(meResponse.user);
        setLists(listsResponse.lists);
      } catch {
        startNavigationLoading();
        router.replace('/');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [router, startNavigationLoading]);

  const firstName = useMemo(() => user?.name?.split(' ')[0] || 'bem-vinda', [user]);
  const hasLists = lists.length > 0;

  async function handleLogout() {
    await logout();
    startNavigationLoading();
    router.replace('/');
    router.refresh();
  }

  function goToCreateList() {
    startNavigationLoading();
    router.push('/dashboard/lists/new');
  }

  function goToManageList(listId) {
    startNavigationLoading();
    router.push(`/dashboard/lists/${listId}`);
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <section className={styles.content}>
          <p>Carregando suas listas...</p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.brandSide}>
          <span className={styles.brandMark} aria-hidden="true">
            <Image alt="" src="/tea-list-logo.png" width={34} height={34} />
          </span>
          <h1 className={styles.title}>Tea List</h1>
        </div>
        <button className="icon-button" type="button" onClick={handleLogout} aria-label="Sair">
          <LogoutIcon width="22" height="22" />
        </button>
      </header>

      <section className={styles.content}>
        <div className={styles.greeting}>
          <h2 className={styles.greetingTitle}>Olá, {firstName}</h2>
          <p className={styles.greetingText}>
            {hasLists
              ? 'Bem-vindo(a) de volta. Suas listas de presentes e celebrações estão organizadas abaixo.'
              : 'Bem-vinda de volta. Suas listas reais aparecerão aqui assim que forem criadas.'}
          </p>
        </div>

        <div className={styles.grid}>
          {lists.map((list) => (
            <ListCard key={list.id} list={list} onManage={goToManageList} />
          ))}

          {!hasLists ? (
            <button className={styles.emptyCard} type="button" onClick={goToCreateList}>
              <span className={styles.emptyIcon}>
                <PlusIcon width="22" height="22" />
              </span>
              <h3 className={styles.emptyTitle}>Inicie um novo marco</h3>
              <p className={styles.emptyText}>Você ainda não tem listas cadastradas. Crie a primeira para começar.</p>
            </button>
          ) : null}
        </div>
      </section>

      {hasLists ? (
        <button className={styles.fab} type="button" onClick={goToCreateList}>
          <PlusIcon width="18" height="18" />
          Criar nova lista
        </button>
      ) : null}

      <nav className={styles.bottomNav} aria-label="Navegação principal">
        <div className={styles.bottomNavInner}>
          <button className={`${styles.navItem} ${styles.navItemActive}`} type="button">
            <GridIcon className={styles.navIcon} />
            Dashboard
          </button>
          <button className={styles.navItem} type="button">
            <GiftIcon className={styles.navIcon} />
            Create
          </button>
          <button className={styles.navItem} type="button">
            <UserIcon className={styles.navIcon} />
            Profile
          </button>
        </div>
      </nav>
    </main>
  );
}
