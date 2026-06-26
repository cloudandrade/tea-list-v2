'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/app/components/ToastProvider';
import { BackIcon, PencilIcon, PlusIcon } from '@/modules/auth/components/icons';
import { deleteListItem, getList, updateListItem } from '../services/listApi';
import ListBottomNav from './ListBottomNav';
import ListDisplay from './ListDisplay';
import styles from './lists.module.css';

export default function PrivateListScreen({ listId }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadList() {
      try {
        const response = await getList(listId);

        if (!active) {
          return;
        }

        setList(response.list);
        setItems(response.items);
      } catch {
        router.replace('/dashboard');
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
  }, [listId, router]);

  async function handleUpdateItem(itemId, payload) {
    try {
      const response = await updateListItem(listId, itemId, payload);
      setItems((current) => current.map((item) => (item.id === itemId ? response.item : item)));
      showToast({ type: 'success', message: 'Item atualizado.' });
    } catch (requestError) {
      showToast({ type: 'error', message: requestError.message });
      throw requestError;
    }
  }

  async function handleDeleteItem(itemId) {
    try {
      await deleteListItem(listId, itemId);
      setItems((current) => current.filter((item) => item.id !== itemId));
      showToast({ type: 'success', message: 'Item excluído.' });
    } catch (requestError) {
      showToast({ type: 'error', message: requestError.message });
    }
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <section className={styles.main}>Carregando lista...</section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.topBar}>
        <button className="icon-button" type="button" onClick={() => router.push('/dashboard')} aria-label="Voltar">
          <BackIcon width="22" height="22" />
        </button>
        <h1 className={styles.topTitle}>Minha Lista</h1>
        <div className={styles.headerActions}>
          <button className="icon-button" type="button" onClick={() => router.push(`/dashboard/lists/${listId}/edit`)} aria-label="Editar lista">
            <PencilIcon width="21" height="21" />
          </button>
          <button className="icon-button" type="button" onClick={() => router.push(`/dashboard/lists/${listId}/items`)} aria-label="Adicionar item">
            <PlusIcon width="22" height="22" />
          </button>
        </div>
      </header>

      <section className={styles.main}>
        <button className="primary-button" type="button" onClick={() => router.push(`/dashboard/lists/${listId}/items`)}>
          <PlusIcon width="18" height="18" />
          Criar novo item
        </button>
      </section>

      <ListDisplay
        initialItems={items}
        isManagement
        list={list}
        onDeleteItem={handleDeleteItem}
        onUpdateItem={handleUpdateItem}
      />

      <section className={styles.main}>
        <div className={styles.emptyState}>
          <strong>Link público</strong>
          <p className={styles.itemDescription}>{`/l/${list.publicHash}`}</p>
        </div>
      </section>

      <ListBottomNav active="dashboard" />
    </main>
  );
}
