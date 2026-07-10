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
  const [expanded, setExpanded] = useState(itemIndex === 0);
  const isPublic = Boolean(publicHash);
  const isPublicOrManagement = isPublic || isManagement;
  const isCompact = displayMode === 'compact';
  const isDetailed = displayMode === 'detailed';
  const isBlocks = !isCompact && !isDetailed;
  const usesVisualCard = isPublicOrManagement && isBlocks;
  const isPublicReserved = isPublic && item.isReserved;
  const isManagementReserved = isManagement && item.isReserved;
  const isReserved = isPublicReserved || isManagementReserved;
  const giftedBy = item.reservations?.[0]?.guestName || t('lists.anonymousGuest');
  const hasPrice = Number(item.price || 0) > 0;
  const showImage = usesVisualCard || (isDetailed && expanded) || (!isPublicOrManagement && !isCompact);
  const showDescription = Boolean(
    item.description
    && (usesVisualCard || (isDetailed && expanded) || (!isPublicOrManagement && !isCompact)),
  );

  if (isPublicOrManagement && isCompact) {
    return (
      <article className={`${styles.compactItem} ${isReserved ? styles.compactItemReserved : ''}`}>
        <div className={styles.compactItemMain}>
          <h3 className={styles.compactItemName}>{item.name}</h3>
          {isManagementReserved ? (
            <span className={styles.giftedBy}>
              <span aria-hidden="true">♙</span>
              {t('lists.giftedBy', { name: giftedBy })}
            </span>
          ) : null}
        </div>
        <div className={styles.compactItemActions}>
          {isManagement ? (
            <ManagementActions item={item} onDeleteItem={onDeleteItem} onEditItem={onEditItem} />
          ) : null}
          {isPublicReserved ? <span className={styles.itemReservedBadge}>{t('lists.reserved')}</span> : null}
          {publicHash && !isPublicReserved ? <ReserveForm item={item} publicHash={publicHash} onReserved={onReserved} /> : null}
        </div>
      </article>
    );
  }

  if (isPublicOrManagement && isDetailed) {
    return (
      <article className={`${styles.detailedItem} ${isReserved ? styles.publicItemReserved : ''}`}>
        <button
          className={styles.detailedItemSummary}
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          <h3 className={styles.detailedItemName}>{item.name}</h3>
          <span className={styles.detailedItemToggle} aria-hidden="true">{expanded ? '−' : '+'}</span>
        </button>
        {expanded ? (
          <div className={styles.detailedItemBody}>
            <div className={styles.itemImage}>
              <span className={styles.itemNumber}>{String(itemIndex + 1).padStart(2, '0')}</span>
              {item.imageUrl ? <Image alt={item.name} fill sizes="(max-width: 768px) 100vw, 320px" src={item.imageUrl} unoptimized /> : null}
              {isReserved ? (
                <div className={styles.reservedImageOverlay}>
                  <span className={styles.reservedPill}>
                    <span aria-hidden="true">✓</span>
                    {t('lists.reserved')}
                  </span>
                </div>
              ) : null}
            </div>
            {item.description ? <p className={styles.itemDescription}>{item.description}</p> : null}
            <div className={styles.detailedItemMeta}>
              {hasPrice ? <span>{formatCurrency(item.price, locale)}</span> : <span aria-hidden="true" />}
              {isManagementReserved ? (
                <span className={styles.giftedBy}>
                  <span aria-hidden="true">♙</span>
                  {t('lists.giftedBy', { name: giftedBy })}
                </span>
              ) : null}
              {publicHash && !isPublicReserved ? <ReserveForm item={item} publicHash={publicHash} onReserved={onReserved} /> : null}
              {isPublicReserved ? <span className={styles.itemReservedBadge}>{t('lists.reserved')}</span> : null}
              {isManagement ? (
                <ManagementActions item={item} onDeleteItem={onDeleteItem} onEditItem={onEditItem} />
              ) : null}
            </div>
          </div>
        ) : null}
      </article>
    );
  }

  const showMeta = hasPrice || !usesVisualCard || isManagementReserved || (publicHash && !isPublicReserved);

  return (
    <article className={`${styles.itemCard} ${usesVisualCard ? styles.publicItemCard : ''} ${isManagement ? styles.managementItemCard : ''} ${isReserved ? styles.publicItemReserved : ''}`}>
      {showImage ? (
        <div className={styles.itemImage}>
          {usesVisualCard ? <span className={styles.itemNumber}>{String(itemIndex + 1).padStart(2, '0')}</span> : null}
          {item.imageUrl ? <Image alt={item.name} fill sizes="(max-width: 768px) 100vw, 320px" src={item.imageUrl} unoptimized /> : null}
          {isReserved ? (
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
      {showDescription ? <p className={styles.itemDescription}>{item.description}</p> : null}
      {showMeta ? (
        <div className={`${styles.itemMeta} ${usesVisualCard ? styles.publicItemMeta : ''}`}>
          {hasPrice ? <span>{formatCurrency(item.price, locale)}</span> : <span aria-hidden="true" />}
          {!usesVisualCard ? (
            <span>
              {t('lists.available', { available: item.availableQuantity, total: item.quantity })}
            </span>
          ) : null}
          {isManagementReserved ? (
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
  const displayMode = list.displayMode || 'blocks';
  const isBlocksMode = displayMode === 'blocks';
  const isDetailedMode = displayMode === 'detailed';
  const isCompactMode = displayMode === 'compact';
  const mainClass = isPublic
    ? `${styles.main} ${styles.publicMain}`
    : isManagement
      ? `${styles.main} ${styles.managementMain}`
    : isBlocksMode
      ? `${styles.main} ${styles.mainBlocks} ${styles.listThemeSurface} ${patternClass}`
      : `${styles.main} ${styles.listThemeSurface} ${patternClass}`;

  let gridClass = styles.itemsGrid;

  if (isPublic || isManagement) {
    if (isBlocksMode) {
      gridClass = `${styles.itemsGrid} ${styles.publicItemsGrid}${isManagement ? ` ${styles.managementItemsGrid}` : ''}`;
    } else if (isDetailedMode) {
      gridClass = `${styles.itemsGrid} ${styles.itemsGridDetailed}${isManagement ? ` ${styles.managementItemsGrid}` : ''}`;
    } else if (isCompactMode) {
      gridClass = `${styles.itemsGrid} ${styles.itemsGridCompact}${isManagement ? ` ${styles.managementItemsGrid}` : ''}`;
    }
  } else if (isBlocksMode) {
    gridClass = `${styles.itemsGrid} ${styles.itemsGridBlocks}`;
  }

  function updateReservedItem(updatedItem) {
    setItems((current) => current.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  }

  return (
    <section className={mainClass} style={{ '--list-color': listColor }}>
      <div className={styles.stack}>
        <header className={styles.listHero}>
          <div
            className={styles.listCover}
            style={makeCoverBackground(list.coverImageUrl) || undefined}
          >
            <div className={styles.listHeroFade} aria-hidden="true" />
            <div className={styles.listHeroContent}>
              <span className={styles.publicBadge}>{list.type}</span>
              <h1 className={styles.listHeroTitle}>{list.title}</h1>
              {list.subtitle ? <p className={styles.listSubtitle}>{list.subtitle}</p> : null}
              {list.message ? <p className={styles.listHeroMessage}>{list.message}</p> : null}
            </div>
          </div>
        </header>

        <div className={styles.giftsSection}>
          <div className={styles.giftsSectionHeading}>
            <h2 className={styles.giftsSectionTitle}>{t('lists.giftsSection')}</h2>
            <span className={styles.giftsSectionCount}>
              {t(items.length === 1 ? 'lists.giftsCountOne' : 'lists.giftsCount', { count: items.length })}
            </span>
          </div>
          <div className={styles.giftsDivider} aria-hidden="true">
            <span className={styles.giftsDividerTrack} />
            <span className={styles.giftsDividerIndicator} />
          </div>
        </div>

        {items.length ? (
          <div className={gridClass}>
            {items.map((item, itemIndex) => (
              <ItemCard
                displayMode={displayMode}
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
