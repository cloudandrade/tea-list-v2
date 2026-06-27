'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/app/components/ToastProvider';
import { getPublicList } from '../services/listApi';
import ListDisplay from './ListDisplay';
import styles from './lists.module.css';

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

  const listColor = paletteColors[list.colorPalette] || paletteColors.terracotta;
  const patternClass = styles[`listPattern${list.backgroundPattern}`] || styles.listPatternplain;

  return (
    <main className={`${styles.page} ${styles.publicPage} ${patternClass}`} style={{ '--list-color': listColor }}>
      <ListDisplay initialItems={items} list={list} publicHash={publicHash} />
    </main>
  );
}
