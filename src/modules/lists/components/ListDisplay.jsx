'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useI18n } from '@/app/components/I18nProvider';
import { useToast } from '@/app/components/ToastProvider';
import { CopyIcon, EyeIcon, PencilIcon, TrashIcon, ChevronDownIcon } from '@/modules/auth/components/icons';
import { reservePublicItem } from '../services/listApi';
import { sampleImageBottomColor } from '../services/sampleImageBottomColor';
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

const PAGE_SURFACE = '#fff8f5';

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

function formatPhoneMask(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) {
    return '';
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function PixPaymentBlock({ item }) {
  const { showToast } = useToast();
  const { t } = useI18n();

  if (!item?.pixEnabled || !item?.pixKey) {
    return null;
  }

  async function copyPixKey() {
    try {
      await navigator.clipboard.writeText(item.pixKey);
      showToast({ type: 'success', message: t('lists.pixKeyCopied') });
    } catch {
      showToast({ type: 'error', message: t('lists.pixKeyCopyError') });
    }
  }

  return (
    <div className={styles.pixPaymentBlock}>
      <div>
        <h4 className={styles.pixPaymentTitle}>{t('lists.pixPaymentTitle')}</h4>
        <p className={styles.pixPaymentHint}>{t('lists.pixPaymentHint')}</p>
      </div>
      <div className={styles.pixPaymentKeyBox}>
        <span className={styles.pixPaymentLabel}>{t('lists.pixKey')}</span>
        <div className={styles.pixPaymentKeyRow}>
          <p className={styles.pixPaymentKey}>{item.pixKey}</p>
          <button
            className={styles.pixCopyButton}
            type="button"
            onClick={copyPixKey}
            aria-label={t('lists.copyPixKey')}
            title={t('lists.copyPixKey')}
          >
            <CopyIcon width="16" height="16" />
            <span>{t('lists.copyPixKey')}</span>
          </button>
        </div>
      </div>
      {item.pixQrCodeUrl ? (
        <div className={styles.pixPaymentQr}>
          <Image
            alt={t('lists.pixQrCodeOptional')}
            height={180}
            src={item.pixQrCodeUrl}
            unoptimized
            width={180}
          />
        </div>
      ) : null}
    </div>
  );
}

function PixDetailsModal({ item, onClose }) {
  const { t } = useI18n();

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <section
        className={`${styles.reserveModal} ${styles.pixDetailsModal}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pix-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div>
          <h3 className={styles.modalTitle} id="pix-details-title">
            {t('lists.pixDetailsTitle')}
          </h3>
          <p className={styles.modalText}>{item.name}</p>
        </div>
        <PixPaymentBlock item={item} />
        <div className={styles.modalActions}>
          <button className={styles.reserveButton} type="button" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </section>
    </div>
  );
}

function ReservedStatus({ item, mode = 'badge', giftedBy }) {
  const { t } = useI18n();
  const [pixOpen, setPixOpen] = useState(false);
  const isPix = Boolean(item.pixEnabled && item.pixKey);
  const showGiftedBy = mode === 'giftedBy';

  return (
    <>
      <div className={`${styles.reservedStatus} ${isPix ? styles.reservedStatusPix : ''}`}>
        {showGiftedBy ? (
          <span className={styles.giftedBy}>
            <span aria-hidden="true">♙</span>
            {t('lists.giftedBy', { name: giftedBy || t('lists.anonymousGuest') })}
          </span>
        ) : (
          <span className={styles.itemReservedBadge}>{t('lists.reserved')}</span>
        )}
        {isPix ? (
          <button
            className={styles.pixViewButton}
            type="button"
            onClick={() => setPixOpen(true)}
            aria-label={t('lists.viewPixDetails')}
            title={t('lists.viewPixDetails')}
          >
            <EyeIcon width="18" height="18" />
          </button>
        ) : null}
      </div>
      {pixOpen ? <PixDetailsModal item={item} onClose={() => setPixOpen(false)} /> : null}
    </>
  );
}

function ReserveForm({ publicHash, item, onReserved }) {
  const { showToast } = useToast();
  const { t } = useI18n();
  const [form, setForm] = useState({ guestName: '', guestPhone: '' });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isPix = Boolean(item.pixEnabled && item.pixKey);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'guestPhone' ? formatPhoneMask(value) : value,
    }));
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
    const reservedBy = item.reservations?.[0]?.guestName;
    return (
      <ReservedStatus
        item={item}
        mode={reservedBy ? 'giftedBy' : 'badge'}
        giftedBy={reservedBy}
      />
    );
  }

  return (
    <>
      <button className={styles.reserveButton} type="button" onClick={() => setOpen(true)}>
        {t('lists.reserve')}
      </button>
      {open ? (
        <div className={styles.modalOverlay} role="presentation" onClick={() => setOpen(false)}>
          <form
            className={`${styles.reserveModal} ${isPix ? styles.reserveModalWithPix : ''}`}
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
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
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              value={form.guestPhone}
              onChange={updateField}
              minLength={14}
              maxLength={15}
              required
            />
            {isPix ? <PixPaymentBlock item={item} /> : null}
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
  const hasReservedGuestName = Boolean(item.reservations?.[0]?.guestName);
  const hasPrice = Number(item.price || 0) > 0;
  const showImage = usesVisualCard || (isDetailed && expanded) || (!isPublicOrManagement && !isCompact);
  const showDescription = Boolean(
    item.description
    && (usesVisualCard || (isDetailed && expanded) || (!isPublicOrManagement && !isCompact)),
  );

  function renderReservedStatus(preferredMode = 'badge') {
    const mode = preferredMode === 'giftedBy' || hasReservedGuestName ? 'giftedBy' : 'badge';
    return (
      <ReservedStatus
        item={item}
        mode={mode}
        giftedBy={giftedBy}
      />
    );
  }

  if (isPublicOrManagement && isCompact) {
    return (
      <article className={`${styles.compactItem} ${isReserved ? styles.compactItemReserved : ''}`}>
        <div className={styles.compactItemMain}>
          <h3 className={styles.compactItemName}>
            <span className={styles.compactItemNumber}>{String(itemIndex + 1).padStart(2, '0')}</span>
            {item.name}
          </h3>
          {isManagementReserved ? renderReservedStatus('giftedBy') : null}
        </div>
        <div className={styles.compactItemActions}>
          {isManagement ? (
            <ManagementActions item={item} onDeleteItem={onDeleteItem} onEditItem={onEditItem} />
          ) : null}
          {isPublicReserved ? renderReservedStatus('giftedBy') : null}
          {publicHash && !isPublicReserved ? <ReserveForm item={item} publicHash={publicHash} onReserved={onReserved} /> : null}
        </div>
      </article>
    );
  }

  if (isPublicOrManagement && isDetailed) {
    return (
      <article className={`${styles.detailedItem} ${isReserved ? styles.publicItemReserved : ''} ${expanded ? styles.detailedItemExpanded : ''}`}>
        <div className={styles.detailedItemHeader}>
          <button
            className={styles.detailedItemSummary}
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((current) => !current)}
          >
            <h3 className={styles.detailedItemName}>{item.name}</h3>
          </button>
          <div className={styles.detailedItemHeaderActions}>
            {isManagement ? (
              <ManagementActions item={item} onDeleteItem={onDeleteItem} onEditItem={onEditItem} />
            ) : null}
            <button
              className={`${styles.detailedItemToggle} ${expanded ? styles.detailedItemToggleOpen : ''}`}
              type="button"
              aria-expanded={expanded}
              aria-label={expanded ? t('lists.collapseItem') : t('lists.expandItem')}
              onClick={() => setExpanded((current) => !current)}
            >
              <ChevronDownIcon width="22" height="22" />
            </button>
          </div>
        </div>
        {expanded ? (
          <div className={styles.detailedItemBody}>
            <div className={styles.itemImage}>
              <span className={styles.itemNumber}>{String(itemIndex + 1).padStart(2, '0')}</span>
              {item.imageUrl ? <Image alt={item.name} fill sizes="(max-width: 768px) 100vw, 280px" src={item.imageUrl} unoptimized /> : null}
              {isReserved ? (
                <div className={styles.reservedImageOverlay}>
                  <span className={styles.reservedPill}>
                    <span aria-hidden="true">✓</span>
                    {t('lists.reserved')}
                  </span>
                </div>
              ) : null}
            </div>
            <div className={styles.detailedItemContent}>
              {item.description ? <p className={styles.itemDescription}>{item.description}</p> : null}
              <div className={styles.detailedItemMeta}>
                {hasPrice ? <span>{formatCurrency(item.price, locale)}</span> : null}
                {isManagementReserved ? renderReservedStatus('giftedBy') : null}
                {publicHash && !isPublicReserved ? <ReserveForm item={item} publicHash={publicHash} onReserved={onReserved} /> : null}
                {isPublicReserved ? renderReservedStatus('giftedBy') : null}
              </div>
            </div>
          </div>
        ) : null}
      </article>
    );
  }

  const showMeta = hasPrice || !usesVisualCard || isManagementReserved || Boolean(publicHash);

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
          {isManagementReserved ? renderReservedStatus('giftedBy') : null}
          {publicHash && !isPublicReserved ? <ReserveForm item={item} publicHash={publicHash} onReserved={onReserved} /> : null}
          {isPublicReserved ? renderReservedStatus('giftedBy') : null}
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
  const [coverEdgeColor, setCoverEdgeColor] = useState(PAGE_SURFACE);
  const listColor = paletteColors[list.colorPalette] || paletteColors.terracotta;
  const patternClass = styles[`listPattern${list.backgroundPattern}`] || styles.listPatternplain;
  const isPublic = Boolean(publicHash);
  const displayMode = list.displayMode || 'blocks';
  const isBlocksMode = displayMode === 'blocks';
  const isDetailedMode = displayMode === 'detailed';
  const isCompactMode = displayMode === 'compact';
  const coverFadeTo = `color-mix(in srgb, ${listColor} 14%, ${PAGE_SURFACE})`;
  const mainClass = isPublic
    ? `${styles.main} ${styles.publicMain}`
    : isManagement
      ? `${styles.main} ${styles.managementMain}`
    : isBlocksMode
      ? `${styles.main} ${styles.mainBlocks} ${styles.listThemeSurface} ${patternClass}`
      : `${styles.main} ${styles.listThemeSurface} ${patternClass}`;

  useEffect(() => {
    let active = true;

    async function detectCoverEdgeColor() {
      if (!list.coverImageUrl) {
        if (active) {
          setCoverEdgeColor(PAGE_SURFACE);
        }
        return;
      }

      const sampledColor = await sampleImageBottomColor(list.coverImageUrl, {
        fallback: PAGE_SURFACE,
      });

      if (active) {
        setCoverEdgeColor(sampledColor);
      }
    }

    detectCoverEdgeColor();

    return () => {
      active = false;
    };
  }, [list.coverImageUrl]);

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
            style={{
              ...(makeCoverBackground(list.coverImageUrl) || {}),
              '--cover-edge-color': coverEdgeColor,
              '--cover-fade-to': coverFadeTo,
            }}
          >
            <span className={`${styles.publicBadge} ${styles.listCoverBadge}`}>{list.type}</span>
            <div className={styles.listHeroFade} aria-hidden="true" />
            <div className={styles.listHeroContent}>
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
