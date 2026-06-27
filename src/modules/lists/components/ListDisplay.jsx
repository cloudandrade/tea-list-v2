'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useToast } from '@/app/components/ToastProvider';
import { PencilIcon } from '@/modules/auth/components/icons';
import { reservePublicItem } from '../services/listApi';
import styles from './lists.module.css';

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

function makeCoverBackground(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  const escapedUrl = String(imageUrl).replaceAll('"', '\\"');
  return {
    backgroundImage: `url("${escapedUrl}")`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  };
}

const paletteColors = {
  terracotta: '#86452a',
  olive: '#586330',
  blue: '#7c90a0',
  rose: '#e6a4b4',
  gold: '#d4ad68',
};

function TrashIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M5 7h14M10 11v6m4-6v6M8 7l1-3h6l1 3m-9 0 1 13h8l1-13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReserveForm({ publicHash, item, onReserved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ guestName: '', guestPhone: '' });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await reservePublicItem(publicHash, item.id, form);
      onReserved(response.item);
      showToast({ type: 'success', message: 'Item reservado com sucesso.' });
      setForm({ guestName: '', guestPhone: '' });
      setOpen(false);
    } catch (requestError) {
      showToast({ type: 'error', message: requestError.message });
    } finally {
      setLoading(false);
    }
  }

  if (item.isReserved) {
    return <p className={styles.itemReservedBadge}>Reservado</p>;
  }

  return (
    <>
      <button className={styles.reserveButton} type="button" onClick={() => setOpen(true)}>
        Reservar
      </button>
      {open ? (
        <div className={styles.modalOverlay} role="presentation" onClick={() => setOpen(false)}>
          <form className={styles.reserveModal} onSubmit={handleSubmit} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div>
              <h3 className={styles.modalTitle}>Reservar item</h3>
              <p className={styles.modalText}>{item.name}</p>
            </div>
            <input
              className={styles.reserveInput}
              name="guestName"
              placeholder="Seu nome"
              value={form.guestName}
              onChange={updateField}
              required
            />
            <input
              className={styles.reserveInput}
              name="guestPhone"
              placeholder="Telefone"
              value={form.guestPhone}
              onChange={updateField}
              required
            />
            <div className={styles.modalActions}>
              <button className={styles.textButton} type="button" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button className={styles.reserveButton} disabled={loading} type="submit">
                {loading ? 'Reservando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function ManagementActions({ item, onDeleteItem, onEditItem }) {
  return (
    <div className={styles.managementActions}>
      <button className={styles.managementIconButton} type="button" onClick={() => onEditItem(item)} aria-label={`Editar ${item.name}`}>
        <PencilIcon />
      </button>
      <button className={`${styles.managementIconButton} ${styles.managementIconDanger}`} type="button" onClick={() => onDeleteItem(item)} aria-label={`Excluir ${item.name}`}>
        <TrashIcon />
      </button>
    </div>
  );
}

function ItemCard({ item, itemIndex, displayMode, publicHash, onReserved, isManagement, onDeleteItem, onEditItem }) {
  const compact = displayMode === 'compact';
  const isPublic = Boolean(publicHash);
  const usesVisualCard = isPublic || isManagement;
  const isPublicReserved = isPublic && item.isReserved;
  const giftedBy = item.reservations?.[0]?.guestName || 'convidado';
  const showImage = usesVisualCard || !compact;
  const showDescription = usesVisualCard || (!compact && item.description);
  const hasPrice = Number(item.price || 0) > 0;
  const showMeta = hasPrice || !usesVisualCard || isPublicReserved || publicHash;

  return (
    <article className={`${styles.itemCard} ${usesVisualCard ? styles.publicItemCard : ''} ${isManagement ? styles.managementItemCard : ''} ${isPublicReserved ? styles.publicItemReserved : ''}`}>
      {showImage ? (
        <div className={styles.itemImage}>
          {usesVisualCard ? <span className={styles.itemNumber}>{String(itemIndex + 1).padStart(2, '0')}</span> : null}
          {item.imageUrl ? <Image alt={item.name} fill sizes="(max-width: 768px) 100vw, 320px" src={item.imageUrl} unoptimized /> : null}
          {isPublicReserved ? (
            <div className={styles.reservedImageOverlay}>
              <span className={styles.reservedPill}>
                <span aria-hidden="true">✓</span>
                Reservado
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
      <h3 className={styles.itemName}>{item.name}</h3>
      {showDescription && item.description ? <p className={styles.itemDescription}>{item.description}</p> : null}
      {showMeta ? (
        <div className={`${styles.itemMeta} ${usesVisualCard ? styles.publicItemMeta : ''}`}>
          {hasPrice ? <span>{formatCurrency(item.price)}</span> : <span aria-hidden="true" />}
          {!usesVisualCard ? (
            <span>
              {item.availableQuantity} de {item.quantity} disponível
            </span>
          ) : null}
          {isPublicReserved ? (
            <span className={styles.giftedBy}>
              <span aria-hidden="true">♙</span>
              Presenteado por {giftedBy}
            </span>
          ) : null}
          {publicHash && !isPublicReserved ? <ReserveForm item={item} publicHash={publicHash} onReserved={onReserved} /> : null}
        </div>
      ) : null}
      {isManagement ? (
        <ManagementActions item={item} onDeleteItem={onDeleteItem} onEditItem={onEditItem} />
      ) : null}
    </article>
  );
}

export default function ListDisplay({
  list,
  initialItems,
  publicHash = '',
  isManagement = false,
  onDeleteItem,
  onEditItem,
}) {
  const [items, setItems] = useState(initialItems);
  const listColor = paletteColors[list.colorPalette] || paletteColors.terracotta;
  const patternClass = styles[`listPattern${list.backgroundPattern}`] || styles.listPatternplain;
  const isPublic = Boolean(publicHash);
  const isBlocksMode = list.displayMode === 'blocks';
  const mainClass = isPublic
    ? `${styles.main} ${styles.publicMain}`
    : isManagement
      ? `${styles.main} ${styles.managementMain}`
    : isBlocksMode
      ? `${styles.main} ${styles.mainBlocks} ${styles.listThemeSurface} ${patternClass}`
      : `${styles.main} ${styles.listThemeSurface} ${patternClass}`;
  const gridClass = isPublic
    ? `${styles.itemsGrid} ${styles.publicItemsGrid}`
    : isManagement
      ? `${styles.itemsGrid} ${styles.publicItemsGrid} ${styles.managementItemsGrid}`
    : isBlocksMode
      ? `${styles.itemsGrid} ${styles.itemsGridBlocks}`
      : styles.itemsGrid;

  function updateReservedItem(updatedItem) {
    setItems((current) => current.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  }

  return (
    <section className={mainClass} style={{ '--list-color': listColor }}>
      <div className={styles.stack}>
        <header className={styles.listHero}>
          <div
            className={`${styles.listCover} ${patternClass}`}
            style={makeCoverBackground(list.coverImageUrl)}
          >
            <div className={styles.listHeroCard}>
              <span className={styles.publicBadge}>{list.type}</span>
              <h1 className={styles.sectionTitle}>{list.title}</h1>
              {list.subtitle ? <p className={styles.listSubtitle}>{list.subtitle}</p> : null}
            </div>
          </div>
          {list.message ? (
            <div className={styles.listMessage}>
              <span>Mensagem aos convidados</span>
              <p>{list.message}</p>
            </div>
          ) : null}
        </header>

        {items.length ? (
          <div className={gridClass}>
            {items.map((item, itemIndex) => (
              <ItemCard
                displayMode={list.displayMode}
                item={item}
                itemIndex={itemIndex}
                key={item.id}
                publicHash={publicHash}
                isManagement={isManagement}
                onDeleteItem={onDeleteItem}
                onEditItem={onEditItem}
                onReserved={updateReservedItem}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h2 className={styles.itemName}>Nenhum item cadastrado ainda</h2>
            <p className={styles.itemDescription}>Adicione itens para compartilhar sua lista com convidados.</p>
          </div>
        )}
      </div>
    </section>
  );
}
