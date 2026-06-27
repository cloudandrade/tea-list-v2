'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useNavigationLoading } from '@/app/components/NavigationLoadingProvider';
import { useToast } from '@/app/components/ToastProvider';
import { createListItem, getList } from '../services/listApi';
import ItemFormModal from './ItemFormModal';
import styles from './lists.module.css';

export default function CreateItemScreen({ listId }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { startNavigationLoading, stopNavigationLoading } = useNavigationLoading();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadList() {
      try {
        const response = await getList(listId);

        if (!active) {
          return;
        }

        // The dedicated route now only opens the reusable item modal.
        void response;
      } catch {
        startNavigationLoading();
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
  }, [listId, router, startNavigationLoading]);

  async function handleSubmit(payload) {
    try {
      const response = await createListItem(listId, payload);
      showToast({ type: 'success', message: `${response.items?.length || 1} item(ns) adicionado(s) à lista.` });
      startNavigationLoading();
      router.push(`/dashboard/lists/${listId}`);
    } catch (requestError) {
      stopNavigationLoading();
      showToast({ type: 'error', message: requestError.message });
      throw requestError;
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
      <section className={styles.main}>Abrindo cadastro de item...</section>
      <ItemFormModal
        mode="create"
        onClose={() => {
          startNavigationLoading();
          router.push(`/dashboard/lists/${listId}`);
        }}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
