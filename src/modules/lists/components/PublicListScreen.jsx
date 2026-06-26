'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/app/components/ToastProvider';
import { getPublicList } from '../services/listApi';
import ListDisplay from './ListDisplay';
import styles from './lists.module.css';

export default function PublicListScreen({ publicHash }) {
  const { showToast } = useToast();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadList() {
      try {
        const response = await getPublicList(publicHash);

        if (!active) {
          return;
        }

        setList(response.list);
        setItems(response.items);
      } catch (requestError) {
        setError(requestError.message);
        showToast({ type: 'error', message: requestError.message });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadList();

    return () => {
      active = false;
    };
  }, [publicHash, showToast]);

  if (loading) {
    return (
      <main className={styles.page}>
        <section className={styles.main}>Carregando lista pública...</section>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <section className={styles.main}>
          <div className={styles.emptyState}>
            <h1 className={styles.itemName}>Não foi possível carregar esta lista</h1>
            <p className={styles.itemDescription}>{error}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.topBar}>
        <span />
        <h1 className={styles.topTitle}>Tea List</h1>
        <span />
      </header>
      <ListDisplay initialItems={items} list={list} publicHash={publicHash} />
    </main>
  );
}
