'use client';

import { useState } from 'react';
import { useI18n } from '@/app/components/I18nProvider';
import { useToast } from '@/app/components/ToastProvider';
import { PlusIcon } from '@/modules/auth/components/icons';
import { compressImageFile } from '../services/imageCompression';
import styles from './lists.module.css';

const initialForm = {
  name: '',
  price: '',
  quantity: 1,
  description: '',
  imageUrl: '',
};

function makeImageBackground(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  const escapedUrl = String(imageUrl).replaceAll('"', '\\"');
  return { backgroundImage: `url("${escapedUrl}")` };
}

function makeInitialForm(item) {
  if (!item) {
    return initialForm;
  }

  return {
    name: item.name || '',
    price: String(item.price || ''),
    quantity: item.quantity || 1,
    description: item.description || '',
    imageUrl: item.imageUrl || '',
  };
}

export default function ItemFormModal({ mode = 'create', item = null, onClose, onSubmit }) {
  const { showToast } = useToast();
  const { t } = useI18n();
  const [form, setForm] = useState(() => makeInitialForm(item));
  const [saving, setSaving] = useState(false);
  const isEdit = mode === 'edit';

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function changeQuantity(delta) {
    setForm((current) => ({ ...current, quantity: Math.max(Number(current.quantity || 1) + delta, 1) }));
  }

  function handleItemImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast({ type: 'error', message: t('lists.invalidImage') });
      return;
    }

    compressImageFile(file, { maxWidth: 1000, maxHeight: 760, quality: 0.7 })
      .then((imageDataUrl) => {
        setForm((current) => ({ ...current, imageUrl: imageDataUrl }));
      })
      .catch((compressionError) => {
        showToast({ type: 'error', message: compressionError.message });
      });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      await onSubmit({
        ...form,
        price: Number(String(form.price).replace(',', '.')) || 0,
        quantity: isEdit ? 1 : Math.max(Number(form.quantity || 1), 1),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={saving ? undefined : onClose}>
      <section className={`${styles.reserveModal} ${styles.itemFormModal}`} role="dialog" aria-modal="true" aria-labelledby="item-form-title" onClick={(event) => event.stopPropagation()}>
        <header>
          <h3 className={styles.modalTitle} id="item-form-title">
            {isEdit ? t('lists.editItem') : t('lists.addItem')}
          </h3>
          <p className={styles.modalText}>
            {isEdit ? t('lists.editItemText') : t('lists.addItemText')}
          </p>
        </header>

        <form className={`${styles.form} ${styles.itemFormGrid}`} onSubmit={handleSubmit}>
          <div className={styles.itemFormFields}>
            <label className={styles.fieldPlain}>
              <span className={styles.label}>{t('lists.itemName')}</span>
              <input
                className={styles.reserveInput}
                name="name"
                placeholder={t('lists.itemNamePlaceholder')}
                value={form.name}
                onChange={updateField}
                required
              />
            </label>

            <label className={styles.fieldPlain}>
              <span className={styles.label}>{t('lists.approximatePrice')}</span>
              <input
                className={styles.reserveInput}
                name="price"
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={form.price}
                onChange={updateField}
              />
            </label>

            {!isEdit ? (
              <div className={styles.fieldPlain}>
                <span className={styles.label}>{t('lists.quantity')}</span>
                <div className={styles.quantityRow}>
                  <button className={styles.quantityButton} type="button" onClick={() => changeQuantity(-1)}>
                    -
                  </button>
                  <span className={styles.quantityValue}>{form.quantity}</span>
                  <button className={styles.quantityButton} type="button" onClick={() => changeQuantity(1)}>
                    +
                  </button>
                </div>
              </div>
            ) : null}

            <label className={styles.fieldPlain}>
              <span className={styles.label}>{t('lists.descriptionOptional')}</span>
              <textarea
                className={styles.reserveInput}
                name="description"
                placeholder={t('lists.itemDescriptionPlaceholder')}
                rows={5}
                value={form.description}
                onChange={updateField}
              />
            </label>

            <label className={styles.fieldPlain}>
              <span className={styles.label}>{t('lists.imageUrlOptional')}</span>
              <input
                className={styles.reserveInput}
                name="imageUrl"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={updateField}
              />
            </label>
          </div>

          <aside className={styles.itemFormImagePanel}>
            <h4 className={styles.itemFormImageTitle}>{t('lists.itemImage')}</h4>
            <label
              className={`${styles.itemUpload} ${form.imageUrl ? styles.itemUploadWithImage : ''}`}
              style={makeImageBackground(form.imageUrl)}
            >
              <input className={styles.fileInput} type="file" accept="image/*" onChange={handleItemImageChange} />
              <div>
                <strong>{t('lists.uploadPhoto')}</strong>
                <p>{form.imageUrl ? t('lists.changeImage') : t('lists.imageHint')}</p>
              </div>
            </label>
            <p className={styles.sectionText}>
              {t('lists.imageQuote')}
            </p>
          </aside>

          <div className={`${styles.modalActions} ${styles.itemFormActions}`}>
            <button className={styles.itemFormSecondaryButton} type="button" disabled={saving} onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button className={styles.itemFormPrimaryButton} disabled={saving} type="submit">
              {!isEdit ? <PlusIcon width="18" height="18" /> : null}
              {saving ? t('lists.saving') : isEdit ? t('lists.saveChanges') : t('lists.saveItem')}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
