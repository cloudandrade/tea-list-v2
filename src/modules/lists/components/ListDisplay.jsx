'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useI18n } from '@/app/components/I18nProvider';
import { useToast } from '@/app/components/ToastProvider';
import { PencilIcon, TrashIcon } from '@/modules/auth/components/icons';
import { reservePublicItem } from '../services/listApi';
import styles from './lists.module.css';

function formatCurrency(value, locale) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
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
  wine: '#7b2f46',
  navy: '#2f465c',
  sage: '#8a9a78',
  lavender: '#9b87ad',
  cocoa: '#6b4a3a',
  coral: '#c96f5d',
  mint: '#6fa18a',
};

function ReserveForm({ publicHash, item, onReserved }) {
  const { showToast } = useToast();
  const { t } = useI18n();
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
      showToast({ type: 'success', message: t('lists.itemReserved') });
      setForm({ guestName: '', guestPhone: '' });
      setOpen(false);
    } catch (requestError) {
      showToast({ type: 'error', message: requestError.message });
    } finally {
      setLoading(false);
    }
  }

  if (item.isReserved) {
    return <p className={styles.itemReservedBadge}>{t('lists.reserved')}</p>;
  }

  return (
    <>
      <button className={styles.reserveButton} type="button" onClick={() => setOpen(true)}>
        {t('lists.reserve')}
      </button>
      {open ? (
        <div className={styles.modalOverlay} role="presentation" onClick={() => setOpen(false)}>
          <form className={styles.reserveModal} onSubmit={handleSubmit} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div>
              <h3 className={styles.modalTitle}>{t('lists.reserveItem')}</h3>
              <p className={styles.modalText}>{item.name}</p>
            </div>
            <input
              className={styles.reserveInput}
              name="guestName"
              placeholder={t('lists.yourName')}
              value={form.guestName}
              onChange={updateField}
              required
            />
            <input
              className={styles.reserveInput}
              name="guestPhone"
              placeholder={t('lists.phone')}
              value={form.guestPhone}
              onChange={updateField}
              required
            />
            <div className={styles.modalActions}>
              <button className={styles.textButton} type="button" onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </button>
              <button className={styles.reserveButton} disabled={loading} type="submit">
                {loading ? t('lists.reserving') : t('common.confirm')}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function ManagementActions({ item, onDeleteItem, onEditItem }) {
  const { t } = useI18n();

  return (
    <div className={styles.managementActions}>
      <button className={styles.managementIconButton} type="button" onClick={() => onEditItem(item)} aria-label={`${t('common.edit')} ${item.name}`}>
        <PencilIcon />
      </button>
      <button className={`${styles.managementIconButton} ${styles.managementIconDanger}`} type="button" onClick={() => onDeleteItem(item)} aria-label={`${t('common.delete')} ${item.name}`}>
        <TrashIcon />
      </button>
    </div>
  );
}

function ItemCard({ item, itemIndex, displayMode, publicHash, onReserved, isManagement, onDeleteItem, onEditItem }) {
  const { locale, t } = useI18n();
  const compact = displayMode === 'compact';
  const isPublic = Boolean(publicHash);
  const usesVisualCard = isPublic || isManagement;
  const isPublicReserved = isPublic && item.isReserved;
  const giftedBy = item.reservations?.[0]?.guestName || t('lists.anonymousGuest');
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
                {t('lists.reserved')}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
      <h3 className={styles.itemName}>{item.name}</h3>
      {showDescription && item.description ? <p className={styles.itemDescription}>{item.description}</p> : null}
      {showMeta ? (
        <div className={`${styles.itemMeta} ${usesVisualCard ? styles.publicItemMeta : ''}`}>
          {hasPrice ? <span>{formatCurrency(item.price, locale)}</span> : <span aria-hidden="true" />}
          {!usesVisualCard ? (
            <span>
            {t('lists.available', { available: item.availableQuantity, total: item.quantity })}
            </span>
          ) : null}
          {isPublicReserved ? (
            <span className={styles.giftedBy}>
              <span aria-hidden="true">♙</span>
            {t('lists.giftedBy', { name: giftedBy })}
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
  const { t } = useI18n();
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
              <span>{t('lists.guestMessage')}</span>
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
            <h2 className={styles.itemName}>{t('lists.emptyItemsTitle')}</h2>
            <p className={styles.itemDescription}>{t('lists.emptyItemsText')}</p>
          </div>
        )}
      </div>
    </section>
  );
}
