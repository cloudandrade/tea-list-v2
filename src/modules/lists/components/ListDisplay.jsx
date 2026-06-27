'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useToast } from '@/app/components/ToastProvider';
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

function ManagementActions({ item, onDeleteItem, onUpdateItem }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: item.name,
    price: String(item.price || ''),
    quantity: item.quantity,
    description: item.description || '',
    imageUrl: item.imageUrl || '',
  });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      await onUpdateItem(item.id, {
        ...form,
        price: Number(String(form.price).replace(',', '.')) || 0,
        quantity: Math.max(Number(form.quantity || 1), 1),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className={styles.managementActions}>
        <button className={styles.textButton} type="button" onClick={() => setEditing(true)}>
          Editar
        </button>
        <button className={styles.dangerButton} type="button" onClick={() => onDeleteItem(item.id)}>
          Excluir
        </button>
      </div>
    );
  }

  return (
    <form className={styles.managementForm} onSubmit={handleSubmit}>
      <input className={styles.reserveInput} name="name" value={form.name} onChange={updateField} required />
      <input className={styles.reserveInput} name="price" value={form.price} onChange={updateField} placeholder="Preço" />
      <input
        className={styles.reserveInput}
        min="1"
        name="quantity"
        type="number"
        value={form.quantity}
        onChange={updateField}
      />
      <textarea className={styles.reserveInput} name="description" rows={3} value={form.description} onChange={updateField} />
      <input className={styles.reserveInput} name="imageUrl" value={form.imageUrl} onChange={updateField} placeholder="URL da imagem" />
      <div className={styles.managementActions}>
        <button className={styles.textButton} disabled={saving} type="submit">
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
        <button className={styles.dangerButton} type="button" onClick={() => setEditing(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function ItemCard({ item, itemIndex, displayMode, publicHash, onReserved, isManagement, onDeleteItem, onUpdateItem }) {
  const compact = displayMode === 'compact';
  const isPublic = Boolean(publicHash);
  const isPublicReserved = isPublic && item.isReserved;
  const giftedBy = item.reservations?.[0]?.guestName || 'convidado';
  const showImage = isPublic || !compact || isManagement;
  const showDescription = isPublic || (!compact && item.description);

  return (
    <article className={`${styles.itemCard} ${isPublic ? styles.publicItemCard : ''} ${isPublicReserved ? styles.publicItemReserved : ''}`}>
      {showImage ? (
        <div className={styles.itemImage}>
          {isPublic ? <span className={styles.itemNumber}>{String(itemIndex + 1).padStart(2, '0')}</span> : null}
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
      <div className={`${styles.itemMeta} ${isPublic ? styles.publicItemMeta : ''}`}>
        <span>{formatCurrency(item.price)}</span>
        {!isPublic ? (
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
      {isManagement ? (
        <ManagementActions item={item} onDeleteItem={onDeleteItem} onUpdateItem={onUpdateItem} />
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
  onUpdateItem,
}) {
  const [items, setItems] = useState(initialItems);
  const listColor = paletteColors[list.colorPalette] || paletteColors.terracotta;
  const patternClass = styles[`listPattern${list.backgroundPattern}`] || styles.listPatternplain;
  const isPublic = Boolean(publicHash);
  const isBlocksMode = list.displayMode === 'blocks';
  const mainClass = isPublic
    ? `${styles.main} ${styles.publicMain}`
    : isBlocksMode
    ? `${styles.main} ${styles.mainBlocks} ${styles.listThemeSurface} ${patternClass}`
    : `${styles.main} ${styles.listThemeSurface} ${patternClass}`;
  const gridClass = isPublic
    ? `${styles.itemsGrid} ${styles.publicItemsGrid}`
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
                onUpdateItem={onUpdateItem}
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
