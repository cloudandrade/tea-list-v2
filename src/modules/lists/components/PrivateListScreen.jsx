'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useNavigationLoading } from '@/app/components/NavigationLoadingProvider';
import { useToast } from '@/app/components/ToastProvider';
import { BackIcon, PencilIcon, PlusIcon, TrashIcon } from '@/modules/auth/components/icons';
import { createListItem, deleteList, deleteListItem, getList, updateListItem } from '../services/listApi';
import ItemFormModal from './ItemFormModal';
import ListBottomNav from './ListBottomNav';
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

export default function PrivateListScreen({ listId }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { startNavigationLoading } = useNavigationLoading();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDeleteItem, setPendingDeleteItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteListOpen, setDeleteListOpen] = useState(false);
  const [deleteListLoading, setDeleteListLoading] = useState(false);
  const [itemModal, setItemModal] = useState(null);

  async function reloadList() {
    const response = await getList(listId);
    setList(response.list);
    setItems(response.items);
  }

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

  async function handleUpdateItem(itemId, payload) {
    try {
      await updateListItem(listId, itemId, payload);
      await reloadList();
      showToast({ type: 'success', message: 'Item atualizado.' });
    } catch (requestError) {
      showToast({ type: 'error', message: requestError.message });
      throw requestError;
    }
  }

  async function handleCreateItem(payload) {
    try {
      const response = await createListItem(listId, payload);
      await reloadList();
      showToast({ type: 'success', message: `${response.items?.length || 1} item(ns) adicionado(s) à lista.` });
    } catch (requestError) {
      showToast({ type: 'error', message: requestError.message });
      throw requestError;
    }
  }

  function handleRequestDeleteItem(item) {
    setPendingDeleteItem(item);
  }

  async function handleConfirmDeleteItem() {
    if (!pendingDeleteItem) {
      return;
    }

    setDeleteLoading(true);

    try {
      await deleteListItem(listId, pendingDeleteItem.id);
      await reloadList();
      setPendingDeleteItem(null);
      showToast({ type: 'success', message: 'Item excluído.' });
    } catch (requestError) {
      showToast({ type: 'error', message: requestError.message });
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleConfirmDeleteList() {
    setDeleteListLoading(true);

    try {
      await deleteList(listId);
      showToast({ type: 'success', message: 'Lista excluída.' });
      startNavigationLoading();
      router.replace('/dashboard');
      router.refresh();
    } catch (requestError) {
      showToast({ type: 'error', message: requestError.message });
      setDeleteListLoading(false);
    }
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <section className={styles.main}>Carregando lista...</section>
      </main>
    );
  }

  const listColor = paletteColors[list.colorPalette] || paletteColors.terracotta;
  const patternClass = styles[`listPattern${list.backgroundPattern}`] || styles.listPatternplain;

  return (
    <main className={styles.page}>
      <header className={styles.topBar}>
        <button className="icon-button" type="button" onClick={() => {
          startNavigationLoading();
          router.push('/dashboard');
        }} aria-label="Voltar">
          <BackIcon width="22" height="22" />
        </button>
        <h1 className={styles.topTitle}>Minha Lista</h1>
        <div className={styles.headerActions}>
          <button className="icon-button" type="button" onClick={() => {
            startNavigationLoading();
            router.push(`/dashboard/lists/${listId}/edit`);
          }} aria-label="Editar lista">
            <PencilIcon width="21" height="21" />
          </button>
          <button className="icon-button" type="button" onClick={() => setDeleteListOpen(true)} aria-label="Excluir lista">
            <TrashIcon width="21" height="21" />
          </button>
          <button className="icon-button" type="button" onClick={() => setItemModal({ mode: 'create', item: null })} aria-label="Adicionar item">
            <PlusIcon width="22" height="22" />
          </button>
        </div>
      </header>

      <div className={`${styles.managementPageSurface} ${patternClass}`} style={{ '--list-color': listColor }}>
        <section className={styles.main}>
          <button className="primary-button" type="button" onClick={() => setItemModal({ mode: 'create', item: null })}>
            <PlusIcon width="18" height="18" />
            Criar novo item
          </button>
        </section>

        <ListDisplay
          initialItems={items}
          isManagement
          key={items.map((item) => item.id).join('|')}
          list={list}
          onDeleteItem={handleRequestDeleteItem}
          onEditItem={(item) => setItemModal({ mode: 'edit', item })}
        />

        <section className={styles.main}>
          <div className={styles.publicLinkCard}>
            <strong>Link público</strong>
            <Link className={styles.publicLink} href={`/l/${list.publicHash}`} target="_blank" rel="noopener noreferrer">
              {`Abrir visualização pública`}
            </Link>
          </div>
        </section>
      </div>

      {itemModal ? (
        <ItemFormModal
          mode={itemModal.mode}
          item={itemModal.item}
          onClose={() => setItemModal(null)}
          onSubmit={(payload) => (
            itemModal.mode === 'edit'
              ? handleUpdateItem(itemModal.item.id, payload)
              : handleCreateItem(payload)
          )}
        />
      ) : null}

      {pendingDeleteItem ? (
        <div className={styles.modalOverlay} role="presentation" onClick={() => (deleteLoading ? null : setPendingDeleteItem(null))}>
          <section className={styles.reserveModal} role="dialog" aria-modal="true" aria-labelledby="delete-item-title" onClick={(event) => event.stopPropagation()}>
            <div>
              <h3 className={styles.modalTitle} id="delete-item-title">Excluir item?</h3>
              <p className={styles.modalText}>
                Tem certeza que deseja excluir &quot;{pendingDeleteItem.name}&quot;? Essa ação não pode ser desfeita.
              </p>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.textButton} type="button" disabled={deleteLoading} onClick={() => setPendingDeleteItem(null)}>
                Cancelar
              </button>
              <button className={styles.deleteConfirmButton} type="button" disabled={deleteLoading} onClick={handleConfirmDeleteItem}>
                {deleteLoading ? 'Excluindo...' : 'Excluir item'}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {deleteListOpen ? (
        <div className={styles.modalOverlay} role="presentation" onClick={() => (deleteListLoading ? null : setDeleteListOpen(false))}>
          <section className={styles.reserveModal} role="dialog" aria-modal="true" aria-labelledby="delete-list-title" onClick={(event) => event.stopPropagation()}>
            <div>
              <h3 className={styles.modalTitle} id="delete-list-title">Excluir lista?</h3>
              <p className={styles.modalText}>
                Tem certeza que deseja excluir &quot;{list.title}&quot;? Todos os itens e reservas dessa lista também serão removidos.
              </p>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.textButton} type="button" disabled={deleteListLoading} onClick={() => setDeleteListOpen(false)}>
                Cancelar
              </button>
              <button className={styles.deleteConfirmButton} type="button" disabled={deleteListLoading} onClick={handleConfirmDeleteList}>
                {deleteListLoading ? 'Excluindo...' : 'Excluir lista'}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <ListBottomNav active="dashboard" />
    </main>
  );
}
