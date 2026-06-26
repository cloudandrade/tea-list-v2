'use client';

import { useState } from 'react';
import { useToast } from '@/app/components/ToastProvider';
import { reservePublicItem } from '../services/listApi';
import styles from './lists.module.css';

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
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
    <form className={styles.reserveForm} onSubmit={handleSubmit}>
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
      <button className="primary-button" disabled={loading} type="submit">
        {loading ? 'Reservando...' : 'Reservar'}
      </button>
    </form>
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

function ItemCard({ item, displayMode, publicHash, onReserved, isManagement, onDeleteItem, onUpdateItem }) {
  const compact = displayMode === 'compact';

  return (
    <article className={styles.itemCard}>
      {!compact ? <div className={styles.itemImage} style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : null} /> : null}
      <h3 className={styles.itemName}>{item.name}</h3>
      {!compact && item.description ? <p className={styles.itemDescription}>{item.description}</p> : null}
      <div className={styles.itemMeta}>
        <span>{formatCurrency(item.price)}</span>
        <span>
          {item.availableQuantity} de {item.quantity} disponível
        </span>
      </div>
      {publicHash ? <ReserveForm item={item} publicHash={publicHash} onReserved={onReserved} /> : null}
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
  const gridClass = list.displayMode === 'blocks' ? `${styles.itemsGrid} ${styles.itemsGridBlocks}` : styles.itemsGrid;
  const listColor = paletteColors[list.colorPalette] || paletteColors.terracotta;

  function updateReservedItem(updatedItem) {
    setItems((current) => current.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  }

  return (
    <section className={styles.main}>
      <div className={styles.stack}>
        <header className={styles.listHero} style={{ '--list-color': listColor }}>
          <div
            className={`${styles.listCover} ${styles[`listPattern${list.backgroundPattern}`] || ''}`}
            style={list.coverImageUrl ? { backgroundImage: `url(${list.coverImageUrl})` } : null}
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
            {items.map((item) => (
              <ItemCard
                displayMode={list.displayMode}
                item={item}
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
